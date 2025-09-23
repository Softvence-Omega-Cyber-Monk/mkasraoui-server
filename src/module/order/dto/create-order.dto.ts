import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: '123 Main St, New York', description: 'Shipping address' })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty({ example: 'John Doe', description: 'Contact name' })
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiProperty({ example: '1234567890', description: 'Contact phone number' })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;
}
