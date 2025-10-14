import { Test, TestingModule } from '@nestjs/testing';
import { AmazonServiceController } from './amazon-service.controller';
import { AmazonServiceService } from './amazon-service.service';

describe('AmazonServiceController', () => {
  let controller: AmazonServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmazonServiceController],
      providers: [AmazonServiceService],
    }).compile();

    controller = module.get<AmazonServiceController>(AmazonServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
