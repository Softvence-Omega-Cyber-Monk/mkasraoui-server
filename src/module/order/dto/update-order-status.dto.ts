import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'New status of the order',
    enum: ['CANCELLED', 'DELIVERED'],
    example: 'DELIVERED',
  })
  @IsEnum(['CANCELLED', 'DELIVERED'], {
    message: 'Status must be either CANCELLED or DELIVERED',
  })
  status: 'CANCELLED' | 'DELIVERED';
}
