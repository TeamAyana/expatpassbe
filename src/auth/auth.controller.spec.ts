import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    syncUser: jest.fn(),
    getUser: jest.fn(),
  };

  const mockRequest = {
    user: {
      userId: 'auth0|123',
      email: 'test@example.com',
      name: 'Test User',
      accessToken: 'mock-access-token',
    },
    headers: {
      'user-agent': 'Mozilla/5.0',
    },
  };

  const mockResponse = {
    redirect: jest.fn(),
    json: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard('auth0'))
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should be defined', () => {
      expect(controller.login).toBeDefined();
    });
  });

  describe('socialLogin', () => {
    it('should return correct URL for social login', () => {
      const connection = 'google-oauth2';
      const result = controller.socialLogin(connection);

      expect(result).toHaveProperty('url');
      expect(result.url).toContain(process.env.AUTH0_DOMAIN);
      expect(result.url).toContain(process.env.AUTH0_CLIENT_ID);
      expect(result.url).toContain(process.env.AUTH0_CALLBACK_URL);
      expect(result.url).toContain(connection);
    });
  });

  describe('callback', () => {
    it('should redirect web clients with token', async () => {
      const mockUser = {
        id: 1,
        auth0Id: mockRequest.user.userId,
        email: mockRequest.user.email,
        fullname: mockRequest.user.name,
      };

      mockAuthService.syncUser.mockResolvedValue(mockUser);

      await controller.callback(mockRequest, mockResponse);

      expect(mockAuthService.syncUser).toHaveBeenCalledWith(mockRequest.user);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        `${process.env.FRONTEND_URL}/auth/callback?token=${mockRequest.user.accessToken}`,
      );
    });

    it('should return JSON response for mobile clients', async () => {
      const mockUser = {
        id: 1,
        auth0Id: mockRequest.user.userId,
        email: mockRequest.user.email,
        fullname: mockRequest.user.name,
      };

      mockAuthService.syncUser.mockResolvedValue(mockUser);
      mockRequest.headers['user-agent'] = 'Mobile App';

      await controller.callback(mockRequest, mockResponse);

      expect(mockAuthService.syncUser).toHaveBeenCalledWith(mockRequest.user);
      expect(mockResponse.json).toHaveBeenCalledWith({
        accessToken: mockRequest.user.accessToken,
        user: mockUser,
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 1,
        auth0Id: mockRequest.user.userId,
        email: mockRequest.user.email,
        fullname: mockRequest.user.name,
      };

      mockAuthService.getUser.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest);

      expect(mockAuthService.getUser).toHaveBeenCalledWith(mockRequest.user);
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should redirect to Auth0 logout URL', () => {
      controller.logout(mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        `https://${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${process.env.FRONTEND_URL}`,
      );
    });
  });
});
