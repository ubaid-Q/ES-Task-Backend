import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { User } from '@/users/entities/user.entity/user.entity';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  async getUsers() {
    return this.usersService.findAll();
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.findOneById(user.id);
  }

  @Put('profile')
  async updateProfile(@CurrentUser() user: User, @Body() updateData: Partial<User>) {
    return this.usersService.updateProfile(user.id, updateData);
  }
}
