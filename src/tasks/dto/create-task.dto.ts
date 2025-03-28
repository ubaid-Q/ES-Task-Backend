import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ description: 'Title of the task' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Detailed description of the task' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'User ID of the assignee' })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}
