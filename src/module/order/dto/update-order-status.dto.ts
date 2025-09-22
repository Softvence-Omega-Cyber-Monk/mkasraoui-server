import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Order status',
    enum: ['PENDING', 'PAID', 'CANCELLED', 'FAILED', 'DELIVERED'],
    example: 'PAID',
  })
  @IsString()
  @IsIn(['PENDING', 'PAID', 'CANCELLED', 'FAILED', 'DELIVERED'])
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED' | 'DELIVERED';
}
