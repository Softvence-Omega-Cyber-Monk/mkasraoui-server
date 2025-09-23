import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateNewsLetterDto {
    @ApiProperty({
    description:"give you emal",
    example:"test@gmail.com"
    })
    @IsString()
    @IsNotEmpty()
    email: string
}
