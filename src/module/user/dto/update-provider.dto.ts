import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';
import { ServiceCategory } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProviderDto {
  @ApiPropertyOptional({
    description: 'Business name',
    example: 'Happy Kids Party',
  })
  @IsOptional()
  @IsString()
  bussinessName?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'contact@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Contact person name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Service categories',
    enum: ServiceCategory,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  serviceCategory?: ServiceCategory[];

  @ApiPropertyOptional({
    description: 'Service area / city',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  serviceArea?: string;

  @ApiPropertyOptional({ description: 'Latitude', example: '40.7128' })
  @IsOptional()
  @IsString()
  latitude?: string;

  @ApiPropertyOptional({ description: 'Longitude', example: '-74.0060' })
  @IsOptional()
  @IsString()
  longitude?: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Premium birthday party services',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Price range', example: '$200 - $1000' })
  @IsOptional()
  @IsString()
  priceRange?: string;

  @ApiPropertyOptional({
    description: 'Website URL',
    example: 'https://example.com',
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    description: 'Instagram profile',
    example: 'https://instagram.com/happykidsparty',
  })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ description: 'Portfolio images URLs', type: [String] })
  @IsOptional()
  @IsArray()
  portfolioImages?: string[];
}
