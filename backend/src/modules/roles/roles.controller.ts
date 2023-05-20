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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { TowerAuthGuard } from '../../auth/towerAuthGuard';
import { Roles } from '../../auth/roles.decorator';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuditInterceptor } from '../../audit-interceptor/audit-interceptor.interceptor';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(TowerAuthGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth()
@ApiBasicAuth()
@Injectable({ scope: Scope.REQUEST })
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(private readonly rolesService: RolesService) {}

  @Patch()
  @Roles(['admin'])
  updateOrCreate(@Body() updateRoleDto: UpdateRoleDto) {
    if (updateRoleDto._id) {
      return this.rolesService.update(updateRoleDto._id, updateRoleDto);
    } else {
      return this.rolesService.create(updateRoleDto);
    }
  }

  @Post()
  @Roles(['admin'])
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Put()
  @Roles(['admin'])
  update(@Body() updateRoleDto: UpdateRoleDto) {
    if (updateRoleDto._id) {
      return this.rolesService.update(updateRoleDto._id, updateRoleDto);
    } else {
      return this.rolesService.create(updateRoleDto);
    }
  }

  @Get()
  @Roles(['admin'])
  @ApiQuery({ name: 'filter', required: false })
  findAll(@Query('filter') filter?: string) {
    if (filter) {
      let jFilter;
      try {
        jFilter = JSON.parse(filter);
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }

      return this.rolesService.find(jFilter);
    } else {
      return this.rolesService.find();
    }
  }

  @Get('/count')
  @Roles(['admin'])
  @ApiQuery({ name: 'where', required: false })
  async count(@Query('where') where?: string) {
    if (where) {
      try {
        const jFilter = JSON.parse(where);
        return await this.rolesService.count({ where: jFilter });
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return await this.rolesService.count();
    }
  }

  @Get('/findOne')
  @Roles(['admin'])
  @ApiQuery({ name: 'filter', required: false })
  findOneWithFilter(@Query('filter') filter?: string) {
    if (filter) {
      let jFilter;
      try {
        jFilter = JSON.parse(filter);
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }

      return this.rolesService.findOneWithFilter(jFilter);
    } else {
      return this.rolesService.findOneWithFilter();
    }
  }

  @Get(':id')
  @Roles(['admin'])
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Get(':id/exists')
  @Roles(['admin'])
  async checkIfExists(@Param('id') id: string) {
    const exists = await this.rolesService.findOne(id);
    return { exists: !!exists };
  }

  @Patch(':id')
  @Roles(['admin'])
  updateWithId(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Put(':id')
  @Roles(['admin'])
  upsertWithId(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Roles(['admin'])
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(id);
  }
}
