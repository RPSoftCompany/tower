import { forwardRef, Module } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection, ConnectionSchema } from './connections.schema';
import { LDAP, LDAPConnectionSchema } from './ldapConnection.schema';
import { Vault, VaultConnectionSchema } from './VaultConnection.schema';
import { SCP, SCPConnectionSchema } from './ScpConnection.schema';
import { Audit, AuditsSchema } from '../audits/audits.schema';
import {
  RestConfiguration,
  RestConfigurationSchema,
} from '../rest-configurations/rest-configurations.schema';
import { V1Module } from '../v1/v1.module';
import {
  BaseConfiguration,
  BaseConfigurationSchema,
} from '../base-configurations/base-configurations.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Connection.name,
        schema: ConnectionSchema,
        discriminators: [
          { name: LDAP.name, schema: LDAPConnectionSchema },
          { name: Vault.name, schema: VaultConnectionSchema },
          { name: SCP.name, schema: SCPConnectionSchema },
        ],
      },
      { name: Audit.name, schema: AuditsSchema },
      { name: RestConfiguration.name, schema: RestConfigurationSchema },
      { name: BaseConfiguration.name, schema: BaseConfigurationSchema },
    ]),
    forwardRef(() => V1Module),
  ],
  controllers: [ConnectionsController],
  providers: [ConnectionsService],
  exports: [ConnectionsService],
})
export class ConnectionsModule {}
