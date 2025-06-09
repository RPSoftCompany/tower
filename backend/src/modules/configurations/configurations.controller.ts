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
import { ConfigurationsService } from './configurations.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TowerAuthGuard } from '../../auth/towerAuthGuard';
import {
  decryptPassword,
  encryptPassword,
} from '../../helpers/encryptionHelper';
import { Configuration } from './configuration.schema';
import { Roles } from '../../auth/roles.decorator';
import { CRUDExceptionWrapper } from '../../helpers/crudHelpers';
import { BaseModelStatementDto } from './dto/base-model-statement.dto';
import { AuditInterceptor } from '../../audit-interceptor/audit-interceptor.interceptor';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@ApiTags('Configurations')
@UseInterceptors(AuditInterceptor)
@Controller('configurations')
@Injectable({ scope: Scope.REQUEST })
export class ConfigurationsController {
  private readonly logger = new Logger(ConfigurationsController.name);

  constructor(
    private readonly configurationsService: ConfigurationsService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  @Post('/initialize')
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  @ApiQuery({ name: 'secret', required: true })
  async initialize(@Query('secret') secret: string) {
    if (secret.length === 32) {
      const initialized = await this.configurationsService.getInitialized();
      if (!initialized) {
        process.env.SECRET = secret;
        try {
          await this.configurationsService.initialize({
            booted: true,
            encryptionCheck: encryptPassword(secret),
          });
        } catch (e) {
          process.env.SECRET = null;
        }
      } else {
        if (initialized.booted) {
          throw new BadRequestException('Tower has already been initialized');
        } else {
          process.env.SECRET = secret;
          if (decryptPassword(initialized.encryptionCheck) !== secret) {
            process.env.SECRET = null;
            throw new BadRequestException('Invalid encryption key');
          }
        }
      }
    } else {
      throw new BadRequestException(
        'Encryption key should be 32 characters long',
      );
    }
  }

  @Get('initialized')
  async initialized() {
    const init = await this.configurationsService.getInitialized();
    return !!init && process.env.SECRET && process.env.SECRET.length === 32;
  }

  @Get('findVariable')
  @UseGuards(TowerAuthGuard)
  @Roles(['configuration.view'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  @ApiQuery({ name: 'searchText', required: true })
  @ApiQuery({ name: 'valueOrName', required: true })
  @ApiQuery({ name: 'isRegex', required: true })
  async findVariable(
    @Query('searchText') searchText: string,
    @Query('valueOrName') valueOrName: boolean,
    @Query('isRegex') isRegex: boolean,
  ) {
    return CRUDExceptionWrapper(async () => {
      if (typeof valueOrName !== 'boolean') {
        valueOrName = valueOrName === 'true';
      }

      if (typeof isRegex !== 'boolean') {
        isRegex = isRegex === 'true';
      }

      return this.configurationsService.findVariable(
        (this.request as any).__userData.__roles,
        searchText,
        valueOrName,
        isRegex,
      );
    });
  }

  @Post()
  @UseGuards(TowerAuthGuard)
  @Roles(['configuration.view', 'configuration.modify'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  async create(@Body() createConfigurationDto: CreateConfigurationDto) {
    return CRUDExceptionWrapper(async () => {
      return this.configurationsService.create(
        createConfigurationDto,
        (this.request as any).__userData.__roles,
        (this.request as any).__userData._id,
      );
    });
  }

  @Get('count')
  @UseGuards(TowerAuthGuard)
  @Roles(['configuration.view'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  @ApiQuery({ name: 'filter', required: false })
  async count(@Query('filter') filter?: string): Promise<number> {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return await this.configurationsService.count(
          (this.request as any).__userData.__roles,
          jFilter,
        );
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return await this.configurationsService.count(
        (this.request as any).__userData.__roles,
        undefined,
      );
    }
  }

  @Get()
  @UseGuards(TowerAuthGuard)
  @Roles(['configuration.view'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  @ApiQuery({ name: 'filter', required: false })
  findAll(@Query('filter') filter?: string): Promise<Configuration[]> {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return this.configurationsService.find(
          (this.request as any).__userData.__roles,
          jFilter,
        );
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return this.configurationsService.find(
        (this.request as any).__userData.__roles,
      );
    }
  }

  @Get('findByDate')
  @UseGuards(TowerAuthGuard)
  @Roles(['configuration.view'])
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'filter', required: true })
  @ApiBearerAuth()
  @ApiBasicAuth()
  findByDate(@Query('filter') filter: string, @Query('date') date?: Date) {
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
        return this.configurationsService.findByDate(
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

  @Get(':id')
  @UseGuards(TowerAuthGuard)
  @Roles(['configuration.view'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  findOne(@Param('id') id: string) {
    return this.configurationsService.findById(
      (this.request as any).__userData.__roles,
      id,
    );
  }

  @Get(':id/exists')
  @UseGuards(TowerAuthGuard)
  @Roles(['configuration.view'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  async exists(@Param('id') id: string) {
    const exists = await this.configurationsService.findById(
      (this.request as any).__userData.__roles,
      id,
    );
    return { exists: !!exists };
  }

  @Post('/promotionCandidates')
  @UseGuards(TowerAuthGuard)
  @Roles(['configuration.view'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  async findPromotionCandidates(
    @Body() configuration: BaseModelStatementDto,
  ): Promise<Configuration[]> {
    return await this.configurationsService.findPromotionCandidates(
      configuration as any,
      (this.request as any).__userData.__roles,
    );
  }

  @Post('/:id/promote')
  @UseGuards(TowerAuthGuard)
  @Roles(['configuration.view'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  async promoteConfiguration(@Param('id') id: string) {
    return await this.configurationsService.promoteConfiguration(
      id,
      (this.request as any).__userData.__roles,
    );
  }
}
