import { Test, TestingModule } from '@nestjs/testing';
import { RestConfigurationsService } from './rest-configurations.service';

describe('RestConfigurationsService', () => {
  let service: RestConfigurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestConfigurationsService],
    }).compile();

    service = module.get<RestConfigurationsService>(RestConfigurationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
