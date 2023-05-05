import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationModelsService } from './configuration-models.service';

describe('ConfigurationModelsService', () => {
  let service: ConfigurationModelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigurationModelsService],
    }).compile();

    service = module.get<ConfigurationModelsService>(ConfigurationModelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
