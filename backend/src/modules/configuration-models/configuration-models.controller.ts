import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Inject,
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
import { ConfigurationModelsService } from './configuration-models.service';
import { CreateConfigurationModelDto } from './dto/create-configuration-model.dto';
import { UpdateConfigurationModelDto } from './dto/update-configuration-model.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TowerAuthGuard } from '../../auth/towerAuthGuard';
import { Roles } from '../../auth/roles.decorator';
import { CRUDExceptionWrapper } from '../../helpers/crudHelpers';
import { PartialUpdateConfigurationModelDto } from './dto/partial-update-configuration-model.dto';
import { AuditInterceptor } from '../../audit-interceptor/audit-interceptor.interceptor';
import { REQUEST } from '@nestjs/core';
import { ReplaceConfigurationModelDto } from './dto/replace-configuration-model.dto';
import { Request } from 'express';

@ApiTags('Configuration Models')
@ApiBearerAuth()
@ApiBasicAuth()
@Controller('configurationModels')
@Injectable({ scope: Scope.REQUEST })
export class ConfigurationModelsController {
  private readonly logger = new Logger(ConfigurationModelsController.name);

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly configurationModelsService: ConfigurationModelsService,
  ) {}

  @Post()
  @ApiResponse({ status: 201 })
  @HttpCode(201)
  @Roles(['configurationModel.view', 'configurationModel.modify'])
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  create(@Body() createConfigurationModelDto: CreateConfigurationModelDto) {
    return CRUDExceptionWrapper(async () => {
      return this.configurationModelsService.create(
        createConfigurationModelDto,
      );
    });
  }

  @Patch()
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @Roles(['configurationModel.view', 'configurationModel.modify'])
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  update(
    @Body() updateConfigurationModelDto: PartialUpdateConfigurationModelDto,
  ) {
    return CRUDExceptionWrapper(async () => {
      if (updateConfigurationModelDto._id) {
        return this.configurationModelsService.partialUpdate(
          (this.request as any).__userData?.__roles,
          updateConfigurationModelDto._id,
          updateConfigurationModelDto,
        );
      } else {
        return this.configurationModelsService.create(
          updateConfigurationModelDto as CreateConfigurationModelDto,
        );
      }
    });
  }

  @Put()
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  @Roles(['configurationModel.view', 'configurationModel.modify'])
  upsert(@Body() updateConfigurationModelDto: UpdateConfigurationModelDto) {
    return CRUDExceptionWrapper(async () => {
      if (updateConfigurationModelDto._id) {
        return this.configurationModelsService.update(
          (this.request as any).__userData?.__roles,
          updateConfigurationModelDto._id,
          updateConfigurationModelDto,
        );
      } else {
        return this.configurationModelsService.create(
          updateConfigurationModelDto as CreateConfigurationModelDto,
        );
      }
    });
  }

  @Get()
  @Roles(['configurationModel.view'])
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  @ApiQuery({ name: 'filter', required: false })
  find(@Query('filter') filter?: string) {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return this.configurationModelsService.find(
          (this.request as any).__userData?.__roles,
          jFilter,
        );
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return this.configurationModelsService.find(
        (this.request as any).__userData?.__roles,
      );
    }
  }

  @Get('/count')
  @Roles(['configurationModel.view'])
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  @ApiQuery({ name: 'filter', required: false })
  async count(@Query('filter') filter?: string) {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return (await this.configurationModelsService.find(jFilter)).length;
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return (
        await this.configurationModelsService.find(
          (this.request as any).__userData?.__roles,
        )
      ).length;
    }
  }

  @Get(':id')
  @Roles(['configurationModel.view'])
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  findOne(@Param('id') id: string) {
    return this.configurationModelsService.findById(
      (this.request as any).__userData?.__roles,
      id,
    );
  }

  @Get(':id/exists')
  @Roles(['configurationModel.view'])
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  async exists(@Param('id') id: string) {
    const exists = this.configurationModelsService.findById(
      (this.request as any).__userData?.__roles,
      id,
    );
    return { exists: !!exists };
  }

  @Patch(':id')
  @Roles(['configurationModel.view', 'configurationModel.modify'])
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  updateWithId(
    @Param('id') id: string,
    @Body() updateConfigurationModelDto: UpdateConfigurationModelDto,
  ) {
    return CRUDExceptionWrapper(async () => {
      return this.configurationModelsService.update(
        (this.request as any).__userData?.__roles,
        id,
        updateConfigurationModelDto,
      );
    });
  }

  @Put(':id')
  @Roles(['configurationModel.view', 'configurationModel.modify'])
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  replaceWithId(
    @Param('id') id: string,
    @Body() replaceConfigurationModelDto: ReplaceConfigurationModelDto,
  ) {
    return CRUDExceptionWrapper(async () => {
      return this.configurationModelsService.update(
        (this.request as any).__userData?.__roles,
        id,
        replaceConfigurationModelDto,
      );
    });
  }

  @Delete(':id')
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  @UseInterceptors(AuditInterceptor)
  @UseGuards(TowerAuthGuard)
  @Roles(['configurationModel.view', 'configurationModel.modify'])
  remove(@Param('id') id: string) {
    return this.configurationModelsService.remove(
      (this.request as any).__userData?.__roles,
      id,
    );
  }
}
