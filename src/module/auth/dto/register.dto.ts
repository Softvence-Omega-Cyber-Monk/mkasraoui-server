import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Optional full name of the user',
  })
  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  fullName?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsNotEmpty({ message: 'Email is required!' })
  @IsEmail({}, { message: 'Email must be valid!' })
  email: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Password with at least 6 characters',
  })
  @IsNotEmpty({ message: 'Password is required!' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;


  @ApiProperty({
    example: 'BUYER',
    enum: ['SELLER', 'BUYER'],
    description: 'Role selected by user (ADMIN not allowed)',
  })
  @IsEnum([ Role.SELLER, Role.BUYER], {
    message: 'Role must be one of: SELLER,BUYER',
  })
  role: Role;
}
