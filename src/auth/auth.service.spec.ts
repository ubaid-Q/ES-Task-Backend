import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('@/redis/redis.provider', () => ({
  redisClient: {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      findByUsername: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
      decode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create a new user and return an access token', async () => {
      const username = 'newuser';
      const password = 'password';
      const fakeUser = { id: '1', username, role: 'user' };
      (usersService.create as jest.Mock).mockResolvedValue(fakeUser);

      const result = await authService.register(username, password);

      expect(usersService.create).toHaveBeenCalledWith({ username, password });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { username: fakeUser.username, id: fakeUser.id, role: fakeUser.role },
        expect.any(Object),
      );
      expect(result).toEqual({ user: fakeUser, access_token: 'signed-token' });
    });
  });

  describe('validateUser', () => {
    it('should return user data if password matches', async () => {
      const username = 'existinguser';
      const password = 'password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const fakeUser = { id: '1', username, password: hashedPassword, role: 'user' };

      (usersService.findByUsername as jest.Mock).mockResolvedValue(fakeUser);

      const result = await authService.validateUser(username, password);
      expect(result).toEqual({ id: fakeUser.id, username: fakeUser.username, role: fakeUser.role });
    });

    it('should return null if user not found', async () => {
      (usersService.findByUsername as jest.Mock).mockResolvedValue(null);
      const result = await authService.validateUser('nonexistent', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const username = 'existinguser';
      const password = 'wrongpassword';
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const fakeUser = { id: '1', username, password: hashedPassword, role: 'user' };

      (usersService.findByUsername as jest.Mock).mockResolvedValue(fakeUser);
      const result = await authService.validateUser(username, password);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const username = 'existinguser';
      const password = 'password';
      const fakeUser = { id: '1', username, role: 'user' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(fakeUser);

      const result = await authService.login(username, password);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { username: fakeUser.username, id: fakeUser.id, role: fakeUser.role },
        expect.any(Object),
      );
      expect(result).toEqual({ access_token: 'signed-token' });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);
      await expect(authService.login('invalid', 'invalid')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should store token in Redis and return success message', async () => {
      const fakeToken = 'token';
      const exp = Math.floor(Date.now() / 1000) + 3600;
      (jwtService.decode as jest.Mock).mockReturnValue({ exp });

      const result = await authService.logout(fakeToken);
      expect(result).toEqual({ message: 'Successfully logged out' });
    });

    it('should throw UnauthorizedException for an invalid token', async () => {
      const fakeToken = 'invalid-token';
      (jwtService.decode as jest.Mock).mockReturnValue(null);
      await expect(authService.logout(fakeToken)).rejects.toThrow(UnauthorizedException);
    });
  });
});
