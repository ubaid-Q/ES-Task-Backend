import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '@/users/entities/user.entity/user.entity';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() currentUser: User) {
    return this.tasksService.create(createTaskDto, currentUser);
  }

  @Get()
  async findAll(@CurrentUser() currentUser: User) {
    return this.tasksService.findAll(currentUser);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.tasksService.findOne(id, currentUser);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @CurrentUser() currentUser: User) {
    return this.tasksService.update(id, updateTaskDto, currentUser);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.tasksService.remove(id, currentUser);
  }
}
