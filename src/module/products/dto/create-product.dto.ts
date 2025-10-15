// Nested DTO for Activity creation
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsEnum, // <-- Added for Theme and Category Enums
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// 💡 UPDATED IMPORT: Include the new 'Category' enum
import { ProductType, Theme, DIY_Category } from '@prisma/client'; 

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
  @IsNotEmpty() // <-- This ensures it's not empty
  title: string; // <-- THIS FIELD MUST BE PRESENT

  @ApiProperty({
    description: 'A detailed description of the product.',
    example: 'A set of colorful blocks for creative play.',
  })
  @IsString()
  description: string;
  @ApiProperty({
    description: 'The title of the product.',
    example: 'Building Blocks',
    enum: ProductType,
  })
  @IsEnum(ProductType)
  product_type: ProductType;
  
  @ApiProperty({
    description: 'The category for the product, used for menu organization.',
    example: 'DIY_BOX',
    enum: DIY_Category,
  })
  @IsEnum(DIY_Category)
  @IsOptional() 
  category?: DIY_Category = DIY_Category.DIY_BOX 

  @ApiProperty({
    description: 'The maximum number of kids that can use the product.',
    example: 4,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
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
    enum: Theme,
  })
  @IsEnum(Theme)
  @IsOptional()
  theme: Theme;

  @ApiProperty({ description: 'The price of the product.', example: 25.99 })
  @IsNumber()
  @Type(() => Number)
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

  @ApiPropertyOptional({ 
    description: 'Filter products by theme (e.g., "SCIENCE").',
    enum: Theme,
  })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @ApiPropertyOptional({ 
    description: 'Filter products by menu category (e.g., "BIRTHDAY_DECORATIONS").',
    enum: DIY_Category,
  })
  @IsOptional()
  @IsEnum(DIY_Category)
  category?: DIY_Category;
}


export class CreateProductMultipartDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: 'The image files for the product (up to 10).',
  })
  files: any[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The tutorial video file for the product.',
    required: false,
  })
  tutorialVideo?: any;

  @ApiProperty({
    type: 'string',
    description: 'The product data as a JSON string.',
    example: JSON.stringify({
      title: 'Building Blocks',
      description: 'A set of colorful blocks...',
      product_type: 'DIY_BOX',
      theme: 'SUPERHERO',
      // 💡 FIX: Use the string literal 'BIRTHDAY_DECORATIONS' instead of the enum variable
      category: 'BIRTHDAY_DECORATIONS', 
      age_range: '3-6 years',
      price: 25.99,
      included: ['50 pieces', 'instruction manual'],
      activities: [
        { title: 'Build a Tower', description: 'Use the blocks to build a tall tower.' },
      ],
    }),
  })
  data: string;
}