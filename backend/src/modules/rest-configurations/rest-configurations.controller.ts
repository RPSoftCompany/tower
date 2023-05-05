import {
  Body,
  Controller,
  Delete,
  Get,
  Head,
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
import { RestConfigurationsService } from './rest-configurations.service';
import { CreateRestConfigurationDto } from './dto/create-rest-configuration.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TowerAuthGuard } from '../../auth/towerAuthGuard';
import { AuditInterceptor } from '../../audit-interceptor/audit-interceptor.interceptor';
import { Roles } from '../../auth/roles.decorator';
import { PartialUpdateRestConfigurationDto } from './dto/partial-update-rest-configuration.dto';
import { RestConfiguration } from './rest-configurations.schema';
import { CRUDExceptionWrapper } from '../../helpers/crudHelpers';
import { FullUpdateRestConfigurationDto } from './dto/full-update-rest-configuration.dto';

@ApiTags('RestConfigurations')
@UseGuards(TowerAuthGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth()
@ApiBasicAuth()
@Controller('restConfigurations')
@Injectable({ scope: Scope.REQUEST })
export class RestConfigurationsController {
  private readonly logger = new Logger(RestConfigurationsController.name);

  constructor(
    private readonly restConfigurationsService: RestConfigurationsService,
  ) {}

  @Post()
  @Roles(['admin'])
  create(@Body() createRestConfigurationDto: CreateRestConfigurationDto) {
    return this.restConfigurationsService.create(createRestConfigurationDto);
  }

  @Get()
  @Roles(['admin'])
  @ApiQuery({ name: 'filter', required: false })
  findAll(@Query('filter') filter?: string): Promise<Array<RestConfiguration>> {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return this.restConfigurationsService.find(jFilter);
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return this.restConfigurationsService.find();
    }
  }

  @Get(':id')
  @Roles(['admin'])
  findOne(@Param('id') id: string) {
    return this.restConfigurationsService.findById(id);
  }

  @Head(':id')
  @Roles(['admin'])
  async exists(@Param('id') id: string) {
    const exists = await this.restConfigurationsService.findById(id);
    return { exists: !!exists };
  }

  @Patch()
  @Roles(['admin'])
  partialUpdate(
    @Body() updateRestConfigurationDto: PartialUpdateRestConfigurationDto,
  ) {
    return CRUDExceptionWrapper(async () => {
      if (updateRestConfigurationDto._id) {
        return this.restConfigurationsService.partialUpdate(
          updateRestConfigurationDto._id,
          updateRestConfigurationDto,
        );
      } else {
        return this.restConfigurationsService.create(
          updateRestConfigurationDto as CreateRestConfigurationDto,
        );
      }
    });
  }

  @Put()
  @Roles(['admin'])
  fullUpdate(
    @Body() fullUpdateRestConfigurationDto: FullUpdateRestConfigurationDto,
  ) {
    return CRUDExceptionWrapper(async () => {
      if (fullUpdateRestConfigurationDto._id) {
        return this.restConfigurationsService.update(
          fullUpdateRestConfigurationDto._id,
          fullUpdateRestConfigurationDto,
        );
      } else {
        return this.restConfigurationsService.create(
          fullUpdateRestConfigurationDto as CreateRestConfigurationDto,
        );
      }
    });
  }

  @Patch(':id')
  @Roles(['admin'])
  updateWithId(
    @Param('id') id: string,
    @Body() updateRestConfigurationDto: PartialUpdateRestConfigurationDto,
  ) {
    return CRUDExceptionWrapper(async () => {
      return this.restConfigurationsService.partialUpdate(
        id,
        updateRestConfigurationDto,
      );
    });
  }

  @Put(':id')
  @Roles(['admin'])
  fullUpdateWithId(
    @Param('id') id: string,
    @Body() fullUpdateRestConfigurationDto: FullUpdateRestConfigurationDto,
  ) {
    return CRUDExceptionWrapper(async () => {
      return this.restConfigurationsService.update(
        id,
        fullUpdateRestConfigurationDto,
      );
    });
  }

  @Delete(':id')
  @Roles(['admin'])
  remove(@Param('id') id: string) {
    return CRUDExceptionWrapper(async () => {
      return this.restConfigurationsService.remove(id);
    });
  }
}
