import { Test, TestingModule } from '@nestjs/testing';
import { ProviderPaymentController } from './provider-payment.controller';
import { ProviderPaymentService } from './provider-payment.service';

describe('ProviderPaymentController', () => {
  let controller: ProviderPaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderPaymentController],
      providers: [ProviderPaymentService],
    }).compile();

    controller = module.get<ProviderPaymentController>(ProviderPaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
