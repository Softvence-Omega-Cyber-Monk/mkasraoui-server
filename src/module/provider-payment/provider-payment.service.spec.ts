import { Test, TestingModule } from '@nestjs/testing';
import { ProviderPaymentService } from './provider-payment.service';

describe('ProviderPaymentService', () => {
  let service: ProviderPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProviderPaymentService],
    }).compile();

    service = module.get<ProviderPaymentService>(ProviderPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
