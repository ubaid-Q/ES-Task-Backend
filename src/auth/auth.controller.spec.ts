import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: Partial<AuthService>;

  const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    authController = module.get<AuthController>(AuthController);
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const loginDto = { username: 'testuser', password: 'password' };
      (authService.login as jest.Mock).mockResolvedValue({ access_token: 'signed-token' });

      const result = await authController.login(loginDto);
      expect(result).toEqual({ access_token: 'signed-token' });
    });
  });

  describe('register', () => {
    it('should return a user object and access token', async () => {
      const registerDto = { username: 'newuser', password: 'password' };
      const fakeUser = { id: '1', username: 'newuser', role: 'user' };
      (authService.register as jest.Mock).mockResolvedValue({ user: fakeUser, access_token: 'signed-token' });

      const result = await authController.register(registerDto);
      expect(result).toEqual({ user: fakeUser, access_token: 'signed-token' });
    });
  });

  describe('logout', () => {
    it('should return a success message when token is provided', async () => {
      const fakeToken = 'token';
      const req: any = { headers: { authorization: `Bearer ${fakeToken}` } };
      (authService.logout as jest.Mock).mockResolvedValue({ message: 'Successfully logged out' });

      const result = await authController.logout(req);
      expect(result).toEqual({ message: 'Successfully logged out' });
    });

    it('should throw UnauthorizedException when token is missing', async () => {
      const req: any = { headers: {} };
      await expect(authController.logout(req)).rejects.toThrow(UnauthorizedException);
    });
  });
});
