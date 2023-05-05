import {
  Controller,
  Get,
  HttpException,
  Injectable,
  Logger,
  Query,
  Scope,
  UseGuards,
} from '@nestjs/common';
import { AuditsService } from './audits.service';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TowerAuthGuard } from '../../auth/towerAuthGuard';
import { Roles } from '../../auth/roles.decorator';

@ApiTags('Audits')
@UseGuards(TowerAuthGuard)
@Roles(['admin'])
@ApiBearerAuth()
@ApiBasicAuth()
@Controller('audits')
@Injectable({ scope: Scope.REQUEST })
export class AuditsController {
  private readonly logger = new Logger(AuditsController.name);

  constructor(private readonly auditService: AuditsService) {}

  @Get()
  @Roles(['admin'])
  @ApiQuery({ name: 'filter', required: false })
  async find(@Query('filter') filter?: string) {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return this.auditService.find(jFilter);
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return this.auditService.find();
    }
  }

  @Get('/count')
  @Roles(['admin'])
  @ApiQuery({ name: 'filter', required: false })
  async count(@Query('filter') filter?: string) {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        const count = await this.auditService.count(jFilter);
        return { count: count };
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      const count = await this.auditService.count();
      return { count: count };
    }
  }
}
