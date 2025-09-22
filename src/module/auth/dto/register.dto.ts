import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Optional name of the user',
  })
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  name?: string;

  @ApiProperty({
    example: 'shalauddinahmedshipon@gmail.com',
    description: 'User email address',
  })
  @IsNotEmpty({ message: 'Email is required!' })
  @IsEmail({}, { message: 'Email must be valid!' })
  email: string;

  @ApiProperty({
    example: '+88019132434',
    description: 'phone number of the user',
  })
  @IsString({ message: 'phone must be a string' })
  phone: string;


  @ApiProperty({
    example: 'Dhaka,Bangladesh',
    description: 'address of the user',
  })
  @IsString({ message: 'phone must be a string' })
  address: string;

  @ApiProperty({
    example: '123456',
    description: 'Password with at least 6 characters',
  })
  @IsNotEmpty({ message: 'Password is required!' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
