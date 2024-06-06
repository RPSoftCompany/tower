import { Module } from '@nestjs/common';
import { MaxConstantVariableService } from './max-constant-variable.service';

@Module({
  providers: [MaxConstantVariableService],
})
export class MaxConstantVariableModule {}
