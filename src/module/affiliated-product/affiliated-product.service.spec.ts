import { Test, TestingModule } from '@nestjs/testing';
import { AffiliatedProductService } from './affiliated-product.service';

describe('AffiliatedProductService', () => {
  let service: AffiliatedProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AffiliatedProductService],
    }).compile();

    service = module.get<AffiliatedProductService>(AffiliatedProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
