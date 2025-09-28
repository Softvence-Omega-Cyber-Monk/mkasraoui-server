import { IsNotEmpty, IsString, IsEnum, IsDateString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Category, Priority } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty({ example: 'Order birthday cake' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Category, example: Category.FOOD })
  @IsEnum(Category)
  category: Category;

  @ApiProperty({ enum: Priority, example: Priority.HIGH })
  @IsEnum(Priority)
  priority: Priority;

  @ApiProperty({ example: '2025-10-15T00:00:00.000Z', description: 'The deadline for the task' })
  @IsDateString()
  dueDate: Date;
}
