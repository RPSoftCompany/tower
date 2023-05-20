import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { ServerResponse } from 'http';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Audit } from '../modules/audits/audits.schema';
import { AuditsModule } from '../modules/audits/audits.module';

@Injectable({ scope: Scope.REQUEST })
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    @InjectModel(Audit.name) private auditModel: Model<AuditsModule>,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    return next.handle().pipe(
      tap(() => {
        const serverResponse: ServerResponse = context
          .switchToHttp()
          .getResponse();
        if (serverResponse) {
          const pathname = (serverResponse.req as any)?._parsedUrl.pathname;

          const obj: Audit = {
            entity: pathname.match(/^\/[^\/]+/, '')[0].replace(/^./, ''),
            method: serverResponse.req.method,
            query: JSON.stringify((serverResponse as any).req.query),
            status: 'SUCCESS',
            url: pathname,
            body: !!(serverResponse?.req as any)?.body
              ? JSON.stringify((serverResponse?.req as any)?.body)
              : undefined,
            userId: (serverResponse.req as any)?.__userData?._id,
            statusCode: serverResponse.statusCode,
          };

          this.auditModel.create(obj);
        }
      }),
      catchError((err) => {
        const serverResponse: ServerResponse = context
          .switchToHttp()
          .getResponse();
        if (serverResponse) {
          const pathname = (serverResponse.req as any)?._parsedUrl.pathname;
          let error = err.response?.message
            ? err.response?.message
            : err.message;

          error = typeof error === 'object' ? JSON.stringify(error) : error;

          const obj: Audit = {
            entity: pathname.match(/^\/[^\/]+/, '')[0].replace(/^./, ''),
            method: serverResponse.req.method,
            query: JSON.stringify((serverResponse as any).req.query),
            status: 'ERROR',
            body: !!(serverResponse?.req as any)?.body
              ? JSON.stringify((serverResponse?.req as any)?.body)
              : undefined,
            url: pathname,
            userId: (serverResponse.req as any)?.__userData?._id,
            statusCode: err.status ? err.status : -1,
            errorDescription: error,
          };

          this.auditModel.create(obj);
        }

        this.logger.error(err);

        throw err;
      }),
    );
  }
}
