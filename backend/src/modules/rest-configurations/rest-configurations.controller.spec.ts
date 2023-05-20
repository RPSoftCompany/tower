import { Test, TestingModule } from '@nestjs/testing';
import { RestConfigurationsController } from './rest-configurations.controller';
import { RestConfigurationsService } from './rest-configurations.service';

describe('RestConfigurationsController', () => {
  let controller: RestConfigurationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestConfigurationsController],
      providers: [RestConfigurationsService],
    }).compile();

    controller = module.get<RestConfigurationsController>(RestConfigurationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
