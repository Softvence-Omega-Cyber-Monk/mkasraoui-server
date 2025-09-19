import { PartialType } from '@nestjs/swagger';
import { CreateProviderReviewDto } from './create-provider-review.dto';

export class UpdateProviderReviewDto extends PartialType(CreateProviderReviewDto) {}
