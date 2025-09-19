import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ServiceCategory } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RequestProviderDto {
  @ApiProperty({ description: 'Name of the business', example: 'Happy Kids Party' })
  @IsNotEmpty()
  @IsString()
  bussinessName: string;

  @ApiProperty({ description: 'Business contact email', example: 'contact@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contact person name', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  contactName: string;

  @ApiProperty({ description: 'Contact phone number', example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Array of service categories offered', enum: ServiceCategory, isArray: true })
  @IsArray()
  serviceCategory: ServiceCategory[];

  @ApiProperty({ description: 'Service area / city', example: 'New York' })
  @IsNotEmpty()
  @IsString()
  serviceArea: string;

  @ApiProperty({ description: 'Latitude of the service location', example: '40.7128' })
  @IsNotEmpty()
  @IsString()
  latitude: string;

  @ApiProperty({ description: 'Longitude of the service location', example: '-74.0060' })
  @IsNotEmpty()
  @IsString()
  longitude: string;

  @ApiProperty({ description: 'Brief description about the provider', example: 'We provide premium birthday party services.' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Price range for the services', example: '$200 - $1000' })
  @IsString()
  priceRange: string;

  @ApiProperty({ description: 'Website URL', example: 'https://example.com', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ description: 'Instagram profile link', example: 'https://instagram.com/happykidsparty', required: false })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiProperty({ description: 'Portfolio images URLs', example: ['https://example.com/image1.jpg'], required: false, type: [String] })
  @IsOptional()
  @IsArray()
  portfolioImages?: string[];
}
