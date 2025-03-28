import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'The username for registration' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'The password for registration' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
