import {
  Controller,
  Get,
  Inject,
  Injectable,
  Res,
  Scope,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { V1Service } from './v1.service';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TowerAuthGuard } from '../../auth/towerAuthGuard';
import { Roles } from '../../auth/roles.decorator';
import { AuditInterceptor } from '../../audit-interceptor/audit-interceptor.interceptor';
import { REQUEST } from '@nestjs/core';
import { CRUDExceptionWrapper } from '../../helpers/crudHelpers';
import { Request, Response } from 'express';

@ApiTags('V1')
@UseGuards(TowerAuthGuard)
@ApiBearerAuth()
@ApiBasicAuth()
@Controller('v1')
@UseInterceptors(AuditInterceptor)
@Injectable({ scope: Scope.REQUEST })
export class V1Controller {
  constructor(
    private readonly v1Service: V1Service,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  @Get('/**')
  @Roles(['configuration.view'])
  async v1(@Res() response: Response) {
    return CRUDExceptionWrapper(async () => {
      const url = (this.request as any)._parsedUrl.pathname;
      const params = this.request.query;
      const userRoles = (this.request as any).__userData.__roles;
      const rendered = await this.v1Service.matchUrl(
        userRoles,
        url,
        undefined,
        params,
      );

      response
        .setHeader('Content-Type', rendered.contentType)
        .send(rendered.template);
    });
  }
}
