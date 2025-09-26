import { PartialType } from '@nestjs/swagger';
import { CreateProviderPlanDto } from './create-provider-plan.dto';

export class UpdateProviderPlanDto extends PartialType(CreateProviderPlanDto) {}
