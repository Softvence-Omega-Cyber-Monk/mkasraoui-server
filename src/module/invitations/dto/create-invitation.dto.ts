import { IsEmail, IsNotEmpty, IsString, IsUrl, IsOptional, IsNumberString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer'; // Needed for @ValidateNested and Type(() => ...)

// ----------------------------------------------------------------------
// 1. Nested DTO for Shipping Address
// ----------------------------------------------------------------------

export class ShippingAddressDto {
  @ApiProperty({ description: 'The guest’s first name for shipping.', example: 'Alice' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'The guest’s last name for shipping.', example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'The primary street address line.', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({ description: 'The secondary address line (e.g., Apt, Suite).', example: 'Apt 4B', required: false })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ description: 'The city for the shipping address.', example: 'New York' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'The state or province.', example: 'NY', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ description: 'The postal code/ZIP code.', example: '10001' })
  // Use IsString and IsNumberString for flexibility with international and US zip codes
  @IsNumberString() 
  @IsNotEmpty()
  postcode: string;

  @ApiProperty({ description: 'The country code (e.g., US, CA).', example: 'US' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

// ----------------------------------------------------------------------
// 2. Main Invitation DTO (Updated)
// ----------------------------------------------------------------------

export class CreateInvitationDto {
  @ApiProperty({
    description: 'The email address of the user being invited.',
    example: 'alice.smith@example.com',
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @ApiProperty({
    description: 'The name of the user being invited.',
    example: 'Alice Smith',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  guest_name: string;
  
  @ApiProperty({
    description: 'The phone of the user being invited.',
    example: '67666767',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  guest_phone: string; // Corrected typo: quest_phone -> guest_phone

  @ApiProperty({
    description: 'The ID of the party plan associated with the invitation.',
    example: 'party12345',
  })
  @IsString()
  @IsNotEmpty()
  party_id: string; // Removed '?' as it's typically required for creation

  @ApiProperty({
    description: 'A publicly accessible URL pointing to the user’s profile picture.',
    example: 'https://cdn.example.com/profiles/alice.jpg',
    type: String,
  })
  @IsUrl({ require_protocol: true })
  @IsNotEmpty()
  imageUrl: string;

  // New: Nested Shipping Address
  @ApiProperty({
    description: 'The shipping address details for the invited guest.',
    type: () => ShippingAddressDto,
  })
  @ValidateNested() // Ensures validation runs on the nested object
  @Type(() => ShippingAddressDto) // Enables class-transformer to instantiate the nested DTO
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;
}