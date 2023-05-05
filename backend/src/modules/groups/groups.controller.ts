import {
  BadRequestException,
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
  Post,
  Query,
  Scope,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TowerAuthGuard } from '../../auth/towerAuthGuard';
import { Roles } from '../../auth/roles.decorator';
import { REQUEST } from '@nestjs/core';
import { CRUDExceptionWrapper } from '../../helpers/crudHelpers';
import { RolesService } from '../roles/roles.service';
import { AuditInterceptor } from '../../audit-interceptor/audit-interceptor.interceptor';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(TowerAuthGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth()
@ApiBasicAuth()
@Injectable({ scope: Scope.REQUEST })
export class GroupsController {
  private readonly logger = new Logger(GroupsController.name);

  constructor(
    @Inject(REQUEST) private request: Record<string, unknown>,
    private readonly groupsService: GroupsService,
    private readonly rolesService: RolesService,
  ) {}

  /**
   * findAll
   *
   * @param filter
   */
  @Get()
  @Roles(['admin'])
  @ApiQuery({ name: 'filter', required: false })
  findAll(@Query('filter') filter?: string) {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return this.groupsService.find(jFilter);
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return this.groupsService.find();
    }
  }

  /**
   * findOne
   *
   * @param filter
   */
  @Get('/findOne')
  @Roles(['admin'])
  @ApiQuery({ name: 'filter', required: false })
  findOne(@Query('filter') filter?: string) {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return this.groupsService.findOne(jFilter);
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return this.groupsService.findOne();
    }
  }

  /**
   * count
   *
   * @param where
   */
  @Get('/count')
  @Roles(['admin'])
  @ApiQuery({ name: 'where', required: false })
  async count(@Query('where') where?: string) {
    if (where) {
      try {
        const jFilter = JSON.parse(where);
        return await this.groupsService.count({ where: jFilter });
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return await this.groupsService.count();
    }
  }

  /**
   * create
   *
   * @param createGroupDto
   */
  @Post()
  @Roles(['admin'])
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  /**
   * findById
   *
   * @param id
   */
  @Get(':id')
  @Roles(['admin'])
  findById(@Param('id') id: string) {
    return this.groupsService.findById(id);
  }

  /**
   * addNewRole
   *
   * @param id
   * @param role
   */
  @Post(':id/role')
  @Roles(['admin'])
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @ApiQuery({ name: 'role', required: true })
  async addNewRole(@Param('id') id: string, @Query('role') role: string) {
    return CRUDExceptionWrapper(async () => {
      const exists = await this.rolesService.find({
        where: {
          name: role,
        },
      });

      if (exists.length === 0) {
        throw new BadRequestException('Invalid role name');
      } else {
        return await this.groupsService.addNewRole(id, role);
      }
    });
  }

  /**
   * removeRoleFromGroup
   *
   * @param id
   * @param role
   */
  @Delete(':id/role')
  @Roles(['admin'])
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @ApiQuery({ name: 'role', required: true })
  async removeRoleFromGroup(
    @Param('id') id: string,
    @Query('role') role: string,
  ) {
    return CRUDExceptionWrapper(async () => {
      return await this.groupsService.removeRoleFromGroup(id, role);
    });
  }

  /**
   * remove
   *
   * @param id
   */
  @Delete(':id')
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  @Roles(['admin'])
  remove(@Param('id') id: string) {
    return CRUDExceptionWrapper(async () => {
      return this.groupsService.remove(id);
    });
  }
}
