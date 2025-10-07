import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';


export class CreateQuoteDto {
  @ApiProperty({ example: 'provider-profile-uuid' })
  @IsString()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '2025-10-15T00:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '2025-10-15T18:30:00Z' })
  @IsDateString()
  time: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  numberOfGuest: number;

  @ApiProperty({ example: 'Royal Blue Theme' })
  @IsOptional()
  @IsString()
  partyTheme?: string;


  @ApiProperty({ example: 'New York City, Central Park' })
  @IsString()
  @IsNotEmpty()
  partyLocation: string;

  @ApiProperty({ example: 'Need vegetarian catering and live DJ' })
  @IsString()
  @IsOptional()
  description?: string;


}
