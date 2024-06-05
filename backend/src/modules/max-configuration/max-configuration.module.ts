import { Module } from '@nestjs/common';
import { MaxConfigurationService } from './max-configuration.service';

@Module({
  providers: [MaxConfigurationService]
})
export class MaxConfigurationModule {}
