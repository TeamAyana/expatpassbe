import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './auth0.strategy';
import { AuthService } from '../auth/auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: AuthService;

  const mockAuthService = {
    syncUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return undefined if payload.sub is undefined', async () => {
      const payload = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = await strategy.validate(payload as any);

      expect(result).toBeUndefined();
      expect(mockAuthService.syncUser).not.toHaveBeenCalled();
    });

    it('should sync and return user if payload is valid', async () => {
      const payload = {
        sub: 'auth0|123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockUser = {
        id: 1,
        auth0Id: payload.sub,
        email: payload.email,
        fullname: payload.name,
      };

      mockAuthService.syncUser.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload as any);

      expect(mockAuthService.syncUser).toHaveBeenCalledWith({
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
      });
      expect(result).toEqual(mockUser);
    });
  });
}); 