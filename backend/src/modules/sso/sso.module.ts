import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SsoController } from './sso.controller';
import { AccessTokenModule } from '../access-token/access-token.module';
import { MembersModule } from '../members/members.module';
import { requiresAuth } from 'express-openid-connect';

@Module({
  imports: [AccessTokenModule, MembersModule],
  controllers: [SsoController],
})
export class SsoModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(requiresAuth());
  }
}
