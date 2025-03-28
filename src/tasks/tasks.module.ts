import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity/task.entity';
import { UsersModule } from '@/users/users.module';
import { EventsModule } from '@/events/events.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    UsersModule,
    EventsModule,
    AuthModule,
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
