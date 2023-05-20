import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MembersModule } from './modules/members/members.module';
import { AuthModule } from './auth/auth.module';
import { AccessTokenModule } from './modules/access-token/access-token.module';
import { GroupsModule } from './modules/groups/groups.module';
import { RolesModule } from './modules/roles/roles.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigurationModelsModule } from './modules/configuration-models/configuration-models.module';
import { ConfigurationsModule } from './modules/configurations/configurations.module';
import { V1Module } from './modules/v1/v1.module';
import { ConstantVariablesModule } from './modules/constant-variables/constant-variables.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { AuditsModule } from './modules/audits/audits.module';
import { HooksModule } from './modules/hooks/hooks.module';
import { RestConfigurationsModule } from './modules/rest-configurations/rest-configurations.module';
import { BaseConfigurationsModule } from './modules/base-configurations/base-configurations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    ScheduleModule.forRoot(),
    V1Module,
    ConnectionsModule,
    MembersModule,
    AccessTokenModule,
    BaseConfigurationsModule,
    AuditsModule,
    AuthModule,
    ConfigurationModelsModule,
    ConfigurationsModule,
    ConstantVariablesModule,
    GroupsModule,
    HooksModule,
    PromotionsModule,
    RestConfigurationsModule,
    RolesModule,
  ],
  providers: [],
})
export class AppModule {}
