import { forwardRef, Module } from '@nestjs/common';
import { ConstantVariablesService } from './constant-variables.service';
import { ConstantVariablesController } from './constant-variables.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ConstantVariable,
  ConstantVariableSchema,
} from './constant-variables.schema';
import {
  ConfigurationModel,
  ConfigurationModelSchema,
} from '../configuration-models/configuration-models.schema';
import { Role, RoleSchema } from '../roles/roles.schema';
import {
  BaseConfiguration,
  BaseConfigurationSchema,
} from '../base-configurations/base-configurations.schema';
import { Audit, AuditsSchema } from '../audits/audits.schema';
import { HooksModule } from '../hooks/hooks.module';
import {
  Configuration,
  ConfigurationSchema,
} from '../configurations/configuration.schema';
import { V1Module } from '../v1/v1.module';
import { ConnectionsModule } from '../connections/connections.module';
import {
  MaxConstantVariable,
  MaxConstantVariableSchema,
} from '../max-constant-variable/max-constant-variable.schema';
import {
  maxConfiguration,
  MaxConfigurationSchema,
} from '../max-configuration/max-configuration.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConstantVariable.name, schema: ConstantVariableSchema },
      { name: ConfigurationModel.name, schema: ConfigurationModelSchema },
      { name: Role.name, schema: RoleSchema },
      { name: BaseConfiguration.name, schema: BaseConfigurationSchema },
      { name: Audit.name, schema: AuditsSchema },
      { name: Configuration.name, schema: ConfigurationSchema },
      { name: MaxConstantVariable.name, schema: MaxConstantVariableSchema },
      { name: maxConfiguration.name, schema: MaxConfigurationSchema },
    ]),
    HooksModule,
    forwardRef(() => V1Module),
    forwardRef(() => ConnectionsModule),
  ],
  controllers: [ConstantVariablesController],
  providers: [ConstantVariablesService],
  exports: [ConstantVariablesService],
})
export class ConstantVariablesModule {}
