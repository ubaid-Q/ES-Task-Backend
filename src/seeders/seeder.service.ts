import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Roles } from '@/model';
import { User } from '@/users/entities/user.entity/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async onApplicationBootstrap() {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log('Skipping seeding: Not in production.');
      return;
    }

    const adminExists = await this.userRepository.findOne({ where: { username: 'admin' } });
    if (adminExists) {
      this.logger.log('Admin user already exists. Seeding skipped.');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = this.userRepository.create({
      username: 'admin',
      password: hashedPassword,
      role: Roles.ADMIN,
    });

    await this.userRepository.save(adminUser);
    this.logger.log('Admin user seeded successfully.');
  }
}
