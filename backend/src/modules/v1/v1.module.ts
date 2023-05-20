import { forwardRef, Module } from '@nestjs/common';
import { V1Service } from './v1.service';
import { V1Controller } from './v1.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { V1, V1Schema } from './v1.schema';
import { Audit, AuditsSchema } from '../audits/audits.schema';
import {
  RestConfiguration,
  RestConfigurationSchema,
} from '../rest-configurations/rest-configurations.schema';
import {
  BaseConfiguration,
  BaseConfigurationSchema,
} from '../base-configurations/base-configurations.schema';
import { ConfigurationsModule } from '../configurations/configurations.module';
import { ConstantVariablesModule } from '../constant-variables/constant-variables.module';
import { ConnectionsModule } from '../connections/connections.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: V1.name, schema: V1Schema },
      { name: Audit.name, schema: AuditsSchema },
      { name: RestConfiguration.name, schema: RestConfigurationSchema },
      { name: BaseConfiguration.name, schema: BaseConfigurationSchema },
    ]),
    ConfigurationsModule,
    ConstantVariablesModule,
    forwardRef(() => ConnectionsModule),
  ],
  controllers: [V1Controller],
  providers: [V1Service],
  exports: [V1Service],
})
export class V1Module {}
