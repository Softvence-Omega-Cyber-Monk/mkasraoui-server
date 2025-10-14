import { Test, TestingModule } from '@nestjs/testing';
import { AmazonServiceService } from './amazon-service.service';

describe('AmazonServiceService', () => {
  let service: AmazonServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AmazonServiceService],
    }).compile();

    service = module.get<AmazonServiceService>(AmazonServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
