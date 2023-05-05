import { Module } from '@nestjs/common';
import { ConfigurationModelsService } from './configuration-models.service';
import { ConfigurationModelsController } from './configuration-models.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ConfigurationModel,
  ConfigurationModelSchema,
} from './configuration-models.schema';
import { RolesModule } from '../roles/roles.module';
import { RoleSchema } from '../roles/roles.schema';
import {
  BaseConfiguration,
  BaseConfigurationSchema,
} from '../base-configurations/base-configurations.schema';
import { Audit, AuditsSchema } from '../audits/audits.schema';
import { HooksModule } from '../hooks/hooks.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConfigurationModel.name, schema: ConfigurationModelSchema },
      { name: RolesModule.name, schema: RoleSchema },
      { name: BaseConfiguration.name, schema: BaseConfigurationSchema },
      { name: Audit.name, schema: AuditsSchema },
    ]),
    HooksModule,
  ],
  controllers: [ConfigurationModelsController],
  providers: [ConfigurationModelsService],
})
export class ConfigurationModelsModule {}
