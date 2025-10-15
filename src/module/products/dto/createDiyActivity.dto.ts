
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateDiyActivityDto {
  @ApiProperty({ required: true, example: 'Build a birdhouse' })
  @IsNotEmpty()
  @IsString()
  title: string;
  @ApiProperty({ required: false, example: 'A fun activity for all ages.' })
  @IsOptional()
  @IsString()
  description?: string;
  @ApiProperty({ required: false, example: '1. Cut wood; 2. Assemble; 3. Paint' })
  @IsOptional()
  @IsString()
  instruction_sheet?: string;
}

export class CreateDiyActivityMultipartDto extends CreateDiyActivityDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'The tutorial video file (e.g., MP4).',
        required: false,
    })
    video?: any;
}