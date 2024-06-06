import { Test, TestingModule } from '@nestjs/testing';
import { MaxConfigurationService } from './max-configuration.service';

describe('MaxConfigurationService', () => {
  let service: MaxConfigurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaxConfigurationService],
    }).compile();

    service = module.get<MaxConfigurationService>(MaxConfigurationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
