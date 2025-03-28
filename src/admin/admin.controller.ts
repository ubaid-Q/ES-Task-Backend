import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Roles as UserRole } from '@/model';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async findAll() {
    return await this.adminService.findAll();
  }

  @Get('users/:id')
  async findOne(@Param('id') id: string) {
    return await this.adminService.findOne(id);
  }

  @Delete('users/:id')
  async remove(@Param('id') id: string) {
    await this.adminService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
