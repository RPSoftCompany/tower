import { Module } from '@nestjs/common';
import { BaseConfigurationsService } from './base-configurations.service';
import { BaseConfigurationsController } from './base-configurations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BaseConfiguration,
  BaseConfigurationSchema,
} from './base-configurations.schema';
import { Audit, AuditsSchema } from '../audits/audits.schema';
import {
  ConfigurationModel,
  ConfigurationModelSchema,
} from '../configuration-models/configuration-models.schema';
import { ConfigurationsModule } from '../configurations/configurations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BaseConfiguration.name, schema: BaseConfigurationSchema },
      { name: ConfigurationModel.name, schema: ConfigurationModelSchema },
      { name: Audit.name, schema: AuditsSchema },
    ]),
    ConfigurationsModule,
  ],
  controllers: [BaseConfigurationsController],
  providers: [BaseConfigurationsService],
})
export class BaseConfigurationsModule {}
