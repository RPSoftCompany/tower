import { forwardRef, Module } from '@nestjs/common';
import { ConfigurationsService } from './configurations.service';
import { ConfigurationsController } from './configurations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { V1, V1Schema } from '../v1/v1.schema';
import { Configuration, ConfigurationSchema } from './configuration.schema';
import { Role, RoleSchema } from '../roles/roles.schema';
import {
  BaseConfiguration,
  BaseConfigurationSchema,
} from '../base-configurations/base-configurations.schema';
import {
  ConfigurationModel,
  ConfigurationModelSchema,
} from '../configuration-models/configuration-models.schema';
import { Promotion, PromotionSchema } from '../promotions/promotions.schema';
import { Audit, AuditsSchema } from '../audits/audits.schema';
import {
  ConstantVariable,
  ConstantVariableSchema,
} from '../constant-variables/constant-variables.schema';
import { HooksModule } from '../hooks/hooks.module';
import { ConnectionsModule } from '../connections/connections.module';
import { V1Module } from '../v1/v1.module';
import {
  maxConfiguration,
  MaxConfigurationSchema,
} from '../max-configuration/max-configuration.schema';
import {
  MaxConstantVariable,
  MaxConstantVariableSchema,
} from '../max-constant-variable/max-constant-variable.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Configuration.name, schema: ConfigurationSchema },
      { name: ConfigurationModel.name, schema: ConfigurationModelSchema },
      { name: V1.name, schema: V1Schema },
      { name: Role.name, schema: RoleSchema },
      { name: BaseConfiguration.name, schema: BaseConfigurationSchema },
      { name: Promotion.name, schema: PromotionSchema },
      { name: Audit.name, schema: AuditsSchema },
      { name: ConstantVariable.name, schema: ConstantVariableSchema },
      { name: maxConfiguration.name, schema: MaxConfigurationSchema },
      { name: MaxConstantVariable.name, schema: MaxConstantVariableSchema },
    ]),
    HooksModule,
    forwardRef(() => ConnectionsModule),
    forwardRef(() => V1Module),
  ],
  controllers: [ConfigurationsController],
  providers: [ConfigurationsService],
  exports: [ConfigurationsService],
})
export class ConfigurationsModule {}
