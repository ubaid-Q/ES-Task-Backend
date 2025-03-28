import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity/task.entity';
import { UsersService } from '@/users/users.service';
import { EventsGateway } from '@/events/events.gateway';
import { EventsService } from '@/events/events.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '@/users/entities/user.entity/user.entity';
import { EventType, Roles } from '@/model';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private usersService: UsersService,
    private eventsGateway: EventsGateway,
    private eventsService: EventsService,
  ) {}

  /**
   * Creates a new task. The task is recorded with the current user as the creator.
   * Optionally assigns the task if an assigneeId is provided.
   */
  async create(createTaskDto: CreateTaskDto, currentUser: User): Promise<Task> {
    const task = this.tasksRepository.create({ ...createTaskDto, createdBy: { id: currentUser.id } });
    if (createTaskDto.assigneeId) {
      const assignee = await this.usersService.findOneById(createTaskDto.assigneeId);
      if (!assignee) {
        throw new NotFoundException('Assignee user not found');
      }
      task.assignee = assignee;
    }
    const savedTask = await this.tasksRepository.save(task);
    await this.eventsService.logEvent({ eventType: EventType.TASK_CREATED, payload: savedTask });
    if (savedTask.assignee) {
      this.eventsGateway.notifyUser(savedTask.assignee.id, EventType.TASK_ASSIGNED, savedTask);
    }
    return savedTask;
  }

  /**
   * Retrieves all tasks that are related to the current user.
   * If the user is an admin, all tasks are returned.
   * Otherwise, only tasks created by or assigned to the user are returned.
   */
  async findAll(currentUser: User): Promise<Task[]> {
    if (currentUser.role === Roles.ADMIN) {
      return this.tasksRepository.find();
    }
    return this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .where('createdBy.id = :userId OR assignee.id = :userId', { userId: currentUser.id })
      .getMany();
  }

  /**
   * Retrieves a single task by id and verifies that the current user is either the creator or the assignee.
   * Admin users can view any task.
   */
  async findOne(id: string, currentUser: User): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id }, relations: ['createdBy', 'assignee'] });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (
      currentUser.role !== Roles.ADMIN &&
      task.createdBy.id !== currentUser.id &&
      (!task.assignee || task.assignee.id !== currentUser.id)
    ) {
      throw new UnauthorizedException('You are not authorized to view this task');
    }
    return task;
  }

  /**
   * Updates a task.
   * Checks authorization similar to findOne (only creator, assignee, or admin can update).
   * Optionally updates the assignee if provided.
   */
  async update(id: string, updateTaskDto: UpdateTaskDto, currentUser: User): Promise<Task> {
    const task = await this.findOne(id, currentUser);
    if (updateTaskDto.assigneeId) {
      const assignee = await this.usersService.findOneById(updateTaskDto.assigneeId);
      if (!assignee) {
        throw new NotFoundException('Assignee user not found');
      }
      task.assignee = assignee;
    }
    Object.assign(task, updateTaskDto);
    const updatedTask = await this.tasksRepository.save(task);

    await this.eventsService.logEvent({ eventType: EventType.TASK_UPDATED, payload: updatedTask });
    if (updatedTask.assignee) {
      let notifyTo = updatedTask.assignee.id;
      if (currentUser.id === notifyTo) {
        notifyTo = updatedTask.createdBy.id;
      }
      this.eventsGateway.notifyUser(notifyTo, EventType.TASK_UPDATED, updatedTask);
    }
    return updatedTask;
  }

  /**
   * Deletes a task after verifying authorization.
   * Notifies the assignee if the task was assigned.
   */
  async remove(id: string, currentUser: User): Promise<void> {
    const task = await this.findOne(id, currentUser);
    if (currentUser.role !== Roles.ADMIN && task.createdBy.id !== currentUser.id) {
      throw new UnauthorizedException('Only the creator or an admin can delete this task');
    }
    await this.tasksRepository.delete(id);
    await this.eventsService.logEvent({ eventType: EventType.TASK_DELETED, payload: { id } });

    if (task.assignee) {
      this.eventsGateway.notifyUser(task.assignee.id, EventType.TASK_DELETED, { id });
    }
  }
}
