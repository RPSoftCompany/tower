import { Global, Module } from '@nestjs/common';
import { AccessTokenModule } from '../modules/access-token/access-token.module';
import { TowerAuthGuard } from './towerAuthGuard';
import { MongooseModule } from '@nestjs/mongoose';
import { Audit, AuditsSchema } from '../modules/audits/audits.schema';

@Global()
@Module({
  imports: [
    AccessTokenModule,
    MongooseModule.forFeature([{ name: Audit.name, schema: AuditsSchema }]),
  ],
  providers: [TowerAuthGuard],
})
export class AuthModule {}
