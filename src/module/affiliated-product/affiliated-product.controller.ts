import { Controller } from '@nestjs/common';
import { AffiliatedProductService } from './affiliated-product.service';

@Controller('affiliated-product')
export class AffiliatedProductController {
  constructor(private readonly affiliatedProductService: AffiliatedProductService) {}
}
