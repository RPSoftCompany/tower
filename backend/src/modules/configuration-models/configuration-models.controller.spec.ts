import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationModelsController } from './configuration-models.controller';
import { ConfigurationModelsService } from './configuration-models.service';

describe('ConfigurationModelsController', () => {
  let controller: ConfigurationModelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigurationModelsController],
      providers: [ConfigurationModelsService],
    }).compile();

    controller = module.get<ConfigurationModelsController>(
      ConfigurationModelsController,
    );
  });

  it('should be defined', () => {
    console.log(controller.find());
  });
});
