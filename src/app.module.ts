import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { User } from './users/entities/user.entity/user.entity';
import { Task } from './tasks/entities/task.entity/task.entity';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seeders/seeder.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
      global: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
      database: process.env.POSTGRES_DB || 'exact_solution_task',
      entities: [User, Task],
      synchronize: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/events', {}),
    UsersModule,
    TasksModule,
    EventsModule,
    AuthModule,
    AdminModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
