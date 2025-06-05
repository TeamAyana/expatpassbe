import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncUser', () => {
    const mockAuth0User = {
      userId: 'auth0|123',
      email: 'test@example.com',
      name: 'Test User',
    };

    it('should create a new user if not exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        auth0Id: mockAuth0User.userId,
        email: mockAuth0User.email,
        fullname: mockAuth0User.name,
        username: expect.any(String),
      });

      const result = await service.syncUser(mockAuth0User);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { auth0Id: mockAuth0User.userId },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          auth0Id: mockAuth0User.userId,
          email: mockAuth0User.email,
          fullname: mockAuth0User.name,
          username: expect.any(String),
        },
      });
      expect(result).toBeDefined();
      expect(result.auth0Id).toBe(mockAuth0User.userId);
    });

    it('should return existing user if found', async () => {
      const existingUser = {
        id: 1,
        auth0Id: mockAuth0User.userId,
        email: mockAuth0User.email,
        fullname: mockAuth0User.name,
        username: 'testuser1234',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);

      const result = await service.syncUser(mockAuth0User);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { auth0Id: mockAuth0User.userId },
      });
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingUser);
    });
  });
});
