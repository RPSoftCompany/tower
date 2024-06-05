import { Test, TestingModule } from '@nestjs/testing';
import { MaxConstantVariableService } from './max-constant-variable.service';

describe('MaxConfigurationService', () => {
  let service: MaxConstantVariableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaxConstantVariableService],
    }).compile();

    service = module.get<MaxConstantVariableService>(
      MaxConstantVariableService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
