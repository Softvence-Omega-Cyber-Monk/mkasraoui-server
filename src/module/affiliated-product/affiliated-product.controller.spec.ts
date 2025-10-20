import { Test, TestingModule } from '@nestjs/testing';
import { AffiliatedProductController } from './affiliated-product.controller';
import { AffiliatedProductService } from './affiliated-product.service';

describe('AffiliatedProductController', () => {
  let controller: AffiliatedProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AffiliatedProductController],
      providers: [AffiliatedProductService],
    }).compile();

    controller = module.get<AffiliatedProductController>(AffiliatedProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
