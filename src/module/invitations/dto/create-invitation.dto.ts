import { IsEmail, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // 👈 Import ApiProperty

export class CreateInvitationDto {
  @ApiProperty({
    description: 'The email address of the user being invited.',
    example: 'alice.smith@example.com',
    type: String, // Optional, but good practice
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'A publicly accessible URL pointing to the user’s profile picture.',
    example: 'https://cdn.example.com/profiles/alice.jpg',
    type: String, // Optional, but good practice
  })
  @IsUrl(
    { require_protocol: true },
  )
  @IsNotEmpty()
  imageUrl: string;
}