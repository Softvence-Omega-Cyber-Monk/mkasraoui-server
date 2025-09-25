import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSubscriptionDto {
    @ApiProperty({
        description: 'Price ID from Stripe',
        example: 'price_1RuIseCiM0crZsfwqv3vZZGj',
    })
    @IsString()
    @IsNotEmpty()
    priceId: string;
    @ApiProperty({
        description: 'Plan ID',
        example: 'plan_123456'
    })
    @IsString()
    @IsNotEmpty()
    pland_id:string
}
