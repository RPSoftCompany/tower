import { Test, TestingModule } from '@nestjs/testing';
import { V1Service } from './v1.service';

describe('V1Service', () => {
  let service: V1Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [V1Service],
    }).compile();

    service = module.get<V1Service>(V1Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
