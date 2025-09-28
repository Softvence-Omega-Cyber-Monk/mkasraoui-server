import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
;
import { ApiProperty } from '@nestjs/swagger';
import { Priority } from '@prisma/client';

export class UpdateTaskDto {
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isComplete?: boolean;

  @ApiProperty({ enum: Priority, required: false })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}