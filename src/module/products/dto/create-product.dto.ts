// Nested DTO for Activity creation
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType, Theme } from '@prisma/client';

export class CreateActivityDTO {
  @ApiProperty({
    description: 'The title of the activity.',
    example: 'Build a Tower',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'A description of the activity.',
    example: 'Use the blocks to build the tallest tower you can.',
  })
  @IsString()
  description: string;
}

// Main DTO for Product creation
export class CreateProductDTO {
  @ApiProperty({
    description: 'The title of the product.',
    example: 'Building Blocks',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'A detailed description of the product.',
    example: 'A set of colorful blocks for creative play.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The type or category of the product.',
    example: 'DIY_BOX',
  })
  @IsString()
  product_type:ProductType;

  @ApiProperty({
    description: 'The maximum number of kids that can use the product.',
    example: 4,
  })
  @IsNumber()
  @IsOptional()
  up_to_kids?: number;
  
  @ApiProperty({
    description: 'The recommended age range for the product.',
    example: '3-6 years',
  })
  @IsString()
  age_range: string;
  @ApiProperty({
    description: 'The theme of the product.',
    example: 'SUPERHERO',
  })
  @IsString()
  @IsOptional()
  theme:Theme

  @ApiProperty({ description: 'The price of the product.', example: 25.99 })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'A list of items included with the product.',
    isArray: true,
    example: ['50 pieces', 'instruction manual'],
  })
  @IsArray()
  @IsString({ each: true })
  included: string[];

  @ApiProperty({
    description: 'An optional tutorial URL.',
    required: false,
    example: 'https://example.com/tutorial',
  })
  @IsString()
  @IsOptional()
  tutorial?: string;
  
  
  @ApiProperty({
    description: 'URLs of the product images.',
    isArray: true,
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  })
  @IsArray()
  @IsString({ each: true })
  imges: string[];

  @ApiProperty({
    description: 'A list of activities associated with the product.',
    type: [CreateActivityDTO],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActivityDTO)
  activities: CreateActivityDTO[];
}

export class ProductFilterDto {
  @ApiPropertyOptional({ description: 'Search term for product title or description.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter products by age range (e.g., "3-5").' })
  @IsOptional()
  @IsString()
  age_range?: string;

  @ApiPropertyOptional({ description: 'Filter products by theme (e.g., "SCIENCE").' })
  @IsOptional()
  @IsString()
  theme?: string;
}
