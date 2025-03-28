import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity/task.entity';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Roles } from '@/model';
import { UsersService } from '@/users/users.service';
import { EventsGateway } from '@/events/events.gateway';
import { EventsService } from '@/events/events.service';
import { User } from '@/users/entities/user.entity/user.entity';

describe('TasksService', () => {
  let service: TasksService;
  let moduleRef: TestingModule;

  const fakeTask = {
    id: 'task1',
    title: 'Test Task',
    description: 'Test description',
    createdBy: { id: 'user1' },
    assignee: { id: 'user2' },
  };

  const mockTaskRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((task) => Promise.resolve({ ...task, id: 'task1' })),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    find: jest.fn().mockResolvedValue([fakeTask]),
    findOne: jest.fn().mockImplementation(({ where }: { where: { id: string } }) => {
      if (where.id === 'nonexistent') return Promise.resolve(null);
      return Promise.resolve(fakeTask);
    }),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([fakeTask]),
    }),
  };

  const mockUsersService = {
    findOneById: jest.fn().mockImplementation((id: string) => {
      if (id === 'user-not-found') return Promise.resolve(null);
      return Promise.resolve({ id, role: Roles.USER });
    }),
  };

  const mockEventsGateway = { notifyUser: jest.fn() };
  const mockEventsService = { logEvent: jest.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockTaskRepository },
        { provide: UsersService, useValue: mockUsersService },
        { provide: EventsGateway, useValue: mockEventsGateway },
        { provide: EventsService, useValue: mockEventsService },
      ],
    }).compile();

    service = moduleRef.get<TasksService>(TasksService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe('create', () => {
    it('should create a task and log events', async () => {
      const createTaskDto = { title: 'Test Task', description: 'Test description', assigneeId: 'user2' };
      const currentUser = { id: 'user1', role: Roles.USER } as User;

      const result = await service.create(createTaskDto, currentUser);
      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createTaskDto,
          createdBy: { id: currentUser.id },
        }),
      );
      expect(mockTaskRepository.save).toHaveBeenCalled();
      expect(mockEventsService.logEvent).toHaveBeenCalledWith({
        eventType: expect.any(String),
        payload: expect.objectContaining({ id: 'task1' }),
      });
      expect(mockEventsGateway.notifyUser).toHaveBeenCalledWith('user2', expect.any(String), expect.objectContaining({ id: 'task1' }));
      expect(result).toHaveProperty('id', 'task1');
    });
  });

  describe('findAll', () => {
    it('should return all tasks for admin', async () => {
      const adminUser = { id: 'admin', role: Roles.ADMIN } as User;
      const tasks = await service.findAll(adminUser);
      expect(mockTaskRepository.find).toHaveBeenCalled();
      expect(tasks).toEqual([fakeTask]);
    });

    it('should return tasks for a non-admin user', async () => {
      const user = { id: 'user1', role: Roles.USER } as User;
      const tasks = await service.findAll(user);
      expect(tasks).toEqual([fakeTask]);
    });
  });

  describe('findOne', () => {
    it('should return a task if the user is authorized', async () => {
      const currentUser = { id: 'user1', role: Roles.USER } as User;
      const task = await service.findOne('task1', currentUser);
      expect(task).toEqual(fakeTask);
    });

    it('should throw NotFoundException if the task is not found', async () => {
      await expect(service.findOne('nonexistent', { id: 'user1', role: Roles.USER } as User)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if the user is not authorized', async () => {
      const unauthorizedUser = { id: 'user3', role: Roles.USER } as User;
      await expect(service.findOne('task1', unauthorizedUser)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    it('should update a task and log events', async () => {
      const updateTaskDto = { title: 'Updated Title', assigneeId: 'user2' };
      const currentUser = { id: 'user1', role: Roles.USER } as User;
      const updatedTask = await service.update('task1', updateTaskDto, currentUser);
      expect(updatedTask.title).toEqual('Updated Title');
      expect(mockEventsService.logEvent).toHaveBeenCalled();
      expect(mockEventsGateway.notifyUser).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a task if the current user is authorized', async () => {
      const currentUser = { id: 'user1', role: Roles.USER } as User;
      await service.remove('task1', currentUser);
      expect(mockTaskRepository.delete).toHaveBeenCalledWith('task1');
      expect(mockEventsService.logEvent).toHaveBeenCalled();
      expect(mockEventsGateway.notifyUser).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if the user is not authorized', async () => {
      const unauthorizedUser = { id: 'user3', role: Roles.USER } as User;
      await expect(service.remove('task1', unauthorizedUser)).rejects.toThrow(UnauthorizedException);
    });
  });
});
