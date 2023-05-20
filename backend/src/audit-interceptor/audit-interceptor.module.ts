import { Global, Module } from '@nestjs/common';
import { AuditsModule } from '../modules/audits/audits.module';
import { AuditInterceptor } from './audit-interceptor.interceptor';

@Global()
@Module({
  imports: [AuditsModule],
  providers: [AuditInterceptor],
})
export class AuthModule {}
