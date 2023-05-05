import { Test, TestingModule } from '@nestjs/testing';
import { ConstantVariablesService } from './constant-variables.service';

describe('ConstantVariablesService', () => {
  let service: ConstantVariablesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConstantVariablesService],
    }).compile();

    service = module.get<ConstantVariablesService>(ConstantVariablesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
