

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
export class UpdateActivityDto {
  @ApiPropertyOptional({ required: true, example: 'Build a faster birdhouse' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ required: false, example: 'A slightly refined activity.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ required: false, example: '1. Cut metal; 2. Assemble; 3. Spray' })
  @IsOptional()
  @IsString()
  instruction_sheet?: string;
  
  video?: string; 
}

export class UpdateActivityMultipartDto extends UpdateActivityDto {
    @ApiPropertyOptional({
        type: 'string',
        format: 'binary',
        description: 'The new video file for the DIY activity (max 10MB).',
        required: false,
    })
    declare video?: any; 
}