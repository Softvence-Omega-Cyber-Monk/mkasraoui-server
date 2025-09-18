import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class refreshTokenDto {
  @ApiProperty({
    example: 'asdfasrfewfwaf*****.....',
    description: 'your refresh token',
  })
  @IsNotEmpty({ message: 'Refresh token is required!' })
  @IsString( { message: 'Rrfresh token must be a string' })
  refreshToken: string;

}
