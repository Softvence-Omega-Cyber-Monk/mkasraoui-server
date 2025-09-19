// Nested DTO for Activity creation
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityDTO {
  @ApiProperty({ description: 'The title of the activity.', example: 'Build a Tower' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'A description of the activity.', example: 'Use the blocks to build the tallest tower you can.' })
  @IsString()
  description: string;
}

// Main DTO for Product creation
export class CreateProductDTO {
  @ApiProperty({ description: 'The title of the product.', example: 'Building Blocks' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'A detailed description of the product.', example: 'A set of colorful blocks for creative play.' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'The type or category of the product.', example: 'Toy' })
  @IsString()
  product_type: string;

  @ApiProperty({ description: 'The recommended age range for the product.', example: '3-6 years' })
  @IsString()
  age_range: string;

  @ApiProperty({ description: 'The price of the product.', example: 25.99 })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'A list of items included with the product.', isArray: true, example: ['50 pieces', 'instruction manual'] })
  @IsArray()
  @IsString({ each: true })
  included: string[];

  @ApiProperty({ description: 'An optional tutorial URL.', required: false, example: 'https://example.com/tutorial' })
  @IsString()
  @IsOptional()
  tutorial?: string;

  @ApiProperty({ description: 'URLs of the product images.', isArray: true, example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'] })
  @IsArray()
  @IsString({ each: true })
  imges: string[];

  @ApiProperty({ description: 'A list of activities associated with the product.', type: [CreateActivityDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityDTO)
  activities: CreateActivityDTO[];
}