import { Module } from '@nestjs/common';
import { RestConfigurationsService } from './rest-configurations.service';
import { RestConfigurationsController } from './rest-configurations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Audit, AuditsSchema } from '../audits/audits.schema';
import {
  RestConfiguration,
  RestConfigurationSchema,
} from './rest-configurations.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RestConfiguration.name, schema: RestConfigurationSchema },
      { name: Audit.name, schema: AuditsSchema },
    ]),
  ],
  controllers: [RestConfigurationsController],
  providers: [RestConfigurationsService],
})
export class RestConfigurationsModule {}
