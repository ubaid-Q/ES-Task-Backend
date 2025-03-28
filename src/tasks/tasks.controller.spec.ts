import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '@/users/entities/user.entity/user.entity';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: Partial<TasksService>;

  const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    tasksService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: tasksService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<TasksController>(TasksController);
  });

  describe('create', () => {
    it('should call tasksService.create with provided DTO and currentUser', async () => {
      const createTaskDto: CreateTaskDto = { title: 'Task Title', description: 'Task Description', assigneeId: 'user2' };
      const currentUser = { id: 'user1', role: 'user' } as User;
      (tasksService.create as jest.Mock).mockResolvedValue({ id: 'task1', ...createTaskDto });
      const result = await controller.create(createTaskDto, currentUser);
      expect(tasksService.create).toHaveBeenCalledWith(createTaskDto, currentUser);
      expect(result).toEqual({ id: 'task1', ...createTaskDto });
    });
  });

  describe('findAll', () => {
    it('should call tasksService.findAll with currentUser', async () => {
      const currentUser = { id: 'user1', role: 'user' } as User;
      (tasksService.findAll as jest.Mock).mockResolvedValue([{ id: 'task1' }]);
      const result = await controller.findAll(currentUser);
      expect(tasksService.findAll).toHaveBeenCalledWith(currentUser);
      expect(result).toEqual([{ id: 'task1' }]);
    });
  });

  describe('findOne', () => {
    it('should call tasksService.findOne with id and currentUser', async () => {
      const currentUser = { id: 'user1', role: 'user' } as User;
      (tasksService.findOne as jest.Mock).mockResolvedValue({ id: 'task1' });
      const result = await controller.findOne('task1', currentUser);
      expect(tasksService.findOne).toHaveBeenCalledWith('task1', currentUser);
      expect(result).toEqual({ id: 'task1' });
    });
  });

  describe('update', () => {
    it('should call tasksService.update with id, update DTO and currentUser', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Title' };
      const currentUser = { id: 'user1', role: 'user' } as User;
      (tasksService.update as jest.Mock).mockResolvedValue({ id: 'task1', ...updateTaskDto });
      const result = await controller.update('task1', updateTaskDto, currentUser);
      expect(tasksService.update).toHaveBeenCalledWith('task1', updateTaskDto, currentUser);
      expect(result).toEqual({ id: 'task1', ...updateTaskDto });
    });
  });

  describe('remove', () => {
    it('should call tasksService.remove with id and currentUser', async () => {
      const currentUser = { id: 'user1', role: 'user' } as User;
      (tasksService.remove as jest.Mock).mockResolvedValue(undefined);
      const result = await controller.remove('task1', currentUser);
      expect(tasksService.remove).toHaveBeenCalledWith('task1', currentUser);
      expect(result).toBeUndefined();
    });
  });
});
