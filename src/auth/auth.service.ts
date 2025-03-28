import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/users/users.service';
import { redisClient } from '@/redis/redis.provider';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const user = await this.usersService.create({ username, password });
    const payload = { username: user.username, id: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '3h',
    });
    return { user, access_token };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, id: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '3h',
      }),
    };
  }

  async logout(token: string): Promise<{ message: string }> {
    const decoded = this.jwtService.decode(token) as any;
    if (!decoded || !decoded.exp) {
      throw new UnauthorizedException('Invalid token');
    }
    const currentTime = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - currentTime;
    if (ttl > 0) {
      await redisClient.set(`revoked:${token}`, 'revoked', 'EX', ttl);
    }
    return { message: 'Successfully logged out' };
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    const result = await redisClient.get(`revoked:${token}`);
    return result === 'revoked';
  }
}
