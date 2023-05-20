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
  Post,
  Put,
  Query,
  Scope,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HooksService } from './hooks.service';
import { UpdateHookDto } from './dto/update-hook.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TowerAuthGuard } from '../../auth/towerAuthGuard';
import { Roles } from '../../auth/roles.decorator';
import { AuditInterceptor } from '../../audit-interceptor/audit-interceptor.interceptor';
import { AddHookDto } from './dto/add-hook.dto';

@ApiTags('Hooks')
@UseGuards(TowerAuthGuard)
@ApiBearerAuth()
@ApiBasicAuth()
@UseInterceptors(AuditInterceptor)
@Controller('hooks')
@Injectable({ scope: Scope.REQUEST })
export class HooksController {
  private readonly logger = new Logger(HooksController.name);

  constructor(private readonly hooksService: HooksService) {}

  @Get()
  @Roles(['admin'])
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @ApiQuery({ name: 'filter', required: false })
  findAll(@Query('filter') filter?: string) {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return this.hooksService.find(jFilter);
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return this.hooksService.find();
    }
  }

  @Get('count')
  @Roles(['admin'])
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @ApiQuery({ name: 'filter', required: false })
  async count(@Query('filter') filter?: string) {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return this.hooksService.count(jFilter);
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return this.hooksService.count();
    }
  }

  @Get(':id')
  @Roles(['admin'])
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.hooksService.findById(id);
  }

  @Put(':id/hookObject')
  @Roles(['admin'])
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  replaceHookObject(
    @Param('id') id: string,
    @Body() updateHookDto: UpdateHookDto,
  ) {
    return this.hooksService.updateHookObject(id, updateHookDto);
  }

  @Post(':id/hookObject')
  @Roles(['admin'])
  @ApiResponse({ status: 201 })
  @HttpCode(201)
  addHookObject(@Param('id') id: string, @Body() addHookDto: AddHookDto) {
    return this.hooksService.addHookObject(id, addHookDto);
  }

  @Delete(':id/hookObject/:fk')
  @Roles(['admin'])
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  removeHookObject(@Param('id') id: string, @Param('fk') fk: string) {
    return this.hooksService.removeHookObject(id, fk);
  }
}
