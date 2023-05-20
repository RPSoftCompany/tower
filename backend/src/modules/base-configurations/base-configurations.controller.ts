import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Injectable,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Scope,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BaseConfigurationsService } from './base-configurations.service';
import { CreateBaseConfigurationDto } from './dto/create-base-configuration.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TowerAuthGuard } from '../../auth/towerAuthGuard';
import { Roles } from '../../auth/roles.decorator';
import { UpdatePartialBaseConfigurationDto } from './dto/update-partial-base-configuration.dto';
import { CRUDExceptionWrapper } from '../../helpers/crudHelpers';
import { UpdateFullBaseConfigurationDto } from './dto/update-full-base-configuration.dto';
import { AuditInterceptor } from '../../audit-interceptor/audit-interceptor.interceptor';
import { BaseConfiguration } from './base-configurations.schema';

@ApiTags('Base Configurations')
@ApiBearerAuth()
@ApiBasicAuth()
@Controller('baseConfigurations')
@Injectable({ scope: Scope.REQUEST })
export class BaseConfigurationsController {
  private readonly logger = new Logger(BaseConfigurationsController.name);

  constructor(
    private readonly baseConfigurationsService: BaseConfigurationsService,
  ) {}

  @Patch()
  @Roles(['admin'])
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  async upsert(
    @Body()
    updatePartialBaseConfigurationDto: UpdatePartialBaseConfigurationDto,
  ) {
    return CRUDExceptionWrapper(async () => {
      if (updatePartialBaseConfigurationDto._id) {
        return this.baseConfigurationsService.updatePartial(
          updatePartialBaseConfigurationDto._id,
          updatePartialBaseConfigurationDto,
        );
      } else {
        return this.baseConfigurationsService.create(
          updatePartialBaseConfigurationDto as CreateBaseConfigurationDto,
        );
      }
    });
  }

  @Post()
  @Roles(['admin'])
  @ApiResponse({ status: 201 })
  @HttpCode(201)
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  create(@Body() createBaseConfigurationDto: CreateBaseConfigurationDto) {
    return CRUDExceptionWrapper(async () => {
      return this.baseConfigurationsService.create(createBaseConfigurationDto);
    });
  }

  @Put()
  @Roles(['admin'])
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  createOrReplace(
    @Body() updateFullBaseConfigurationDto: UpdateFullBaseConfigurationDto,
  ) {
    return CRUDExceptionWrapper(async () => {
      if (updateFullBaseConfigurationDto._id) {
        return this.baseConfigurationsService.update(
          updateFullBaseConfigurationDto._id,
          updateFullBaseConfigurationDto,
        );
      } else {
        return this.baseConfigurationsService.create(
          updateFullBaseConfigurationDto,
        );
      }
    });
  }

  @Get()
  @Roles([])
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @UseGuards(TowerAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @Roles([])
  @ApiQuery({ name: 'filter', required: false })
  findAll(@Query('filter') filter?: string): Promise<Array<BaseConfiguration>> {
    return CRUDExceptionWrapper(async () => {
      if (filter) {
        try {
          const jFilter = JSON.parse(filter);
          return this.baseConfigurationsService.find(jFilter);
        } catch (e) {
          this.logger.error(e);
          throw new HttpException('Invalid filter', 400, { cause: e });
        }
      } else {
        return this.baseConfigurationsService.find();
      }
    });
  }

  @Get('count')
  @Roles([])
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @UseGuards(TowerAuthGuard)
  @Roles([])
  @UseInterceptors(AuditInterceptor)
  @ApiQuery({ name: 'filter', required: false })
  count(@Query('filter') filter?: string): Promise<number> {
    return CRUDExceptionWrapper(async () => {
      if (filter) {
        try {
          const jFilter = JSON.parse(filter);
          return this.baseConfigurationsService.count(jFilter);
        } catch (e) {
          this.logger.error(e);
          throw new HttpException('Invalid filter', 400, { cause: e });
        }
      } else {
        return this.baseConfigurationsService.count();
      }
    });
  }

  @Get(':id')
  @Roles([])
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @Roles([])
  @UseGuards(TowerAuthGuard)
  @UseInterceptors(AuditInterceptor)
  findOne(@Param('id') id: string) {
    return CRUDExceptionWrapper(async () => {
      return this.baseConfigurationsService.findById(id);
    });
  }

  @Get(':id/exists')
  @Roles([])
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @UseGuards(TowerAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @Roles([])
  async exists(@Param('id') id: string) {
    return CRUDExceptionWrapper(async () => {
      const exists = await this.baseConfigurationsService.findById(id);
      return { exists: !!exists };
    });
  }

  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(TowerAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  upsertWithId(
    @Param('id') id: string,
    @Body()
    updatePartialBaseConfigurationDto: UpdatePartialBaseConfigurationDto,
  ) {
    return CRUDExceptionWrapper(async () => {
      return this.baseConfigurationsService.updatePartial(
        id,
        updatePartialBaseConfigurationDto,
      );
    });
  }

  @Put(':id')
  @Roles(['admin'])
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  updateWithId(
    @Param('id') id: string,
    @Body() updateFullBaseConfigurationDto: UpdateFullBaseConfigurationDto,
  ) {
    return CRUDExceptionWrapper(async () => {
      return this.baseConfigurationsService.update(
        id,
        updateFullBaseConfigurationDto,
      );
    });
  }

  @Delete(':id')
  @Roles(['admin'])
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    return CRUDExceptionWrapper(async () => {
      await this.baseConfigurationsService.remove(id);
    });
  }
}
