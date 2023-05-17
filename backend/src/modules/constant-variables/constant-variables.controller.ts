import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Inject,
  Injectable,
  Logger,
  Param,
  Post,
  Query,
  Scope,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConstantVariablesService } from './constant-variables.service';
import { CreateConstantVariableDto } from './dto/create-constant-variable.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TowerAuthGuard } from '../../auth/towerAuthGuard';
import { Roles } from '../../auth/roles.decorator';
import { ConstantVariable } from './constant-variables.schema';
import { CRUDExceptionWrapper } from '../../helpers/crudHelpers';
import { AuditInterceptor } from '../../audit-interceptor/audit-interceptor.interceptor';
import { REQUEST } from '@nestjs/core';
import { Statement } from '../../helpers/clauses';
import { Request } from 'express';

@ApiTags('Constant Variables')
@UseGuards(TowerAuthGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth()
@ApiBasicAuth()
@Controller('constantVariables')
@Injectable({ scope: Scope.REQUEST })
export class ConstantVariablesController {
  private readonly logger = new Logger(ConstantVariablesController.name);

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly constantVariablesService: ConstantVariablesService,
  ) {}

  @Post()
  @Roles(['configuration.view', 'constantVariable.modify'])
  @ApiResponse({ status: 201 })
  @HttpCode(201)
  create(@Body() createConstantVariableDto: CreateConstantVariableDto) {
    return this.constantVariablesService.create(
      (this.request as any).__userData.__roles,
      (this.request as any).__userData._id,
      createConstantVariableDto,
    );
  }

  @Get()
  @Roles(['configuration.view'])
  @ApiQuery({ name: 'filter', required: false })
  findAll(@Query('filter') filter?: string): Promise<ConstantVariable[]> {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return this.constantVariablesService.find(
          (this.request as any).__userData.__roles,
          jFilter,
        );
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return this.constantVariablesService.find(
        (this.request as any).__userData.__roles,
      );
    }
  }

  @Get('count')
  @Roles(['configuration.view'])
  @ApiQuery({ name: 'filter', required: false })
  async count(@Query('filter') filter?: string) {
    let all = [];
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        jFilter.fields = { _id: true };
        all = await this.constantVariablesService.find(
          (this.request as any).__userData.__roles,
          jFilter,
        );
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      const filter: Statement = {
        fields: { _id: true },
      };
      all = await this.constantVariablesService.find(
        (this.request as any).__userData.__roles,
        filter,
      );
    }

    return all.length;
  }

  @Get('/findByDate')
  @Roles(['configuration.view'])
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'filter', required: true })
  async findByDate(
    @Query('filter') filter: string,
    @Query('date') date?: Date,
  ): Promise<ConstantVariable[]> {
    try {
      if (!date) {
        date = new Date();
      } else {
        date = new Date(date);
      }
    } catch (e) {
      this.logger.error(e);
      throw new HttpException('Invalid date parameter', 400, { cause: e });
    }

    try {
      const jFilter = JSON.parse(filter);
      return CRUDExceptionWrapper(async () => {
        return this.constantVariablesService.findByDate(
          (this.request as any).__userData.__roles,
          jFilter,
          date,
        );
      });
    } catch (e) {
      this.logger.error(e);
      throw new HttpException('Invalid filter', 400, { cause: e });
    }
  }

  @Get('/findLatest')
  @Roles(['configuration.view'])
  @ApiQuery({ name: 'filter', required: true })
  async findLatest(
    @Query('filter') filter: string,
  ): Promise<ConstantVariable[]> {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return CRUDExceptionWrapper(async () => {
          return this.constantVariablesService.findByDate(
            (this.request as any).__userData.__roles,
            jFilter,
            new Date(),
          );
        });
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      throw new BadRequestException('Model filter is mandatory');
    }
  }

  @Get(':id')
  @Roles(['configuration.view'])
  async findOne(@Param('id') id: string) {
    return this.constantVariablesService.findById(
      (this.request as any).__userData.__roles,
      id,
    );
  }

  @Get(':id/exists')
  @Roles(['configuration.view'])
  async exists(@Param('id') id: string) {
    const exists = await this.constantVariablesService.findById(
      (this.request as any).__userData.__roles,
      id,
    );
    return { exists: !!exists };
  }
}
