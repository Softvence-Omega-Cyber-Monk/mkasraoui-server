import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    example: 'alice.smith@example.com',
    type: String,
  })
  @IsNotEmpty()
  guest_name: string;
  @ApiProperty({
    description: 'The phone of the user being invited.',
    example: '67666767',
  })
  @IsNotEmpty()
  quest_phone: string;

  @ApiProperty({
    description: 'The ID of the party plan associated with the invitation.',
    example: 'party12345',
  })
  @IsString()
  @IsNotEmpty()
  party_id?: string;

  @ApiProperty({
    description: 'A publicly accessible URL pointing to the user’s profile picture.',
    example: 'https://cdn.example.com/profiles/alice.jpg',
    type: String,
  })
  @IsUrl(
    { require_protocol: true },
  )
  @IsNotEmpty()
  imageUrl: string;
}