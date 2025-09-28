import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({ example: 'prod_123', description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, description: 'Quantity of the product' })
  @IsNumber()
  quantity: number;


}

class ShippingInfoDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+123456789' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  state: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  zipCode: string;

  @ApiProperty({ example: '123 Main Street, Apt 5' })
  @IsString()
  address: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 60.5, description: 'Total price including shipping' })
  @IsNumber()
  totalPrice: number;

  @ApiProperty({ example: 5, description: 'Shipping fee' })
  @IsNumber()
  shippingFee: number;

  @ApiProperty({ type: ShippingInfoDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingInfoDto)
  shippingInfo: ShippingInfoDto;

  @ApiProperty({ example: 'Leave at front door', required: false })
  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
