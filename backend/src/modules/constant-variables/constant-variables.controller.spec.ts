import { Test, TestingModule } from '@nestjs/testing';
import { ConstantVariablesController } from './constant-variables.controller';
import { ConstantVariablesService } from './constant-variables.service';

describe('ConstantVariablesController', () => {
  let controller: ConstantVariablesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConstantVariablesController],
      providers: [ConstantVariablesService],
    }).compile();

    controller = module.get<ConstantVariablesController>(ConstantVariablesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
