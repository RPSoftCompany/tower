import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationsController } from './configurations.controller';
import { ConfigurationsService } from './configurations.service';

describe('ConfigurationsController', () => {
  let controller: ConfigurationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigurationsController],
      providers: [ConfigurationsService],
    }).compile();

    controller = module.get<ConfigurationsController>(ConfigurationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
