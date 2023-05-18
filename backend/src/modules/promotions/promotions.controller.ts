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
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TowerAuthGuard } from '../../auth/towerAuthGuard';
import { Roles } from '../../auth/roles.decorator';
import { PartialUpdatePromotionDto } from './dto/partial-update-promotion.dto';
import { FullUpdatePromotionDto } from './dto/full-update-promotion.dto';
import { AuditInterceptor } from '../../audit-interceptor/audit-interceptor.interceptor';

@ApiTags('Promotions')
@UseGuards(TowerAuthGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth()
@ApiBasicAuth()
@Controller('promotions')
@Injectable({ scope: Scope.REQUEST })
export class PromotionsController {
  private readonly logger = new Logger(PromotionsController.name);
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @Roles(['admin'])
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Get()
  @Roles(['admin'])
  @ApiQuery({ name: 'filter', required: false })
  findAll(@Query('filter') filter?: string) {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return this.promotionsService.find(jFilter);
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return this.promotionsService.find();
    }
  }

  @Get('/count')
  @Roles(['admin'])
  count() {
    return this.promotionsService.count();
  }

  @Get(':id')
  @Roles(['admin'])
  findOne(@Param('id') id: string) {
    return this.promotionsService.findById(id);
  }

  @Patch()
  @Roles(['admin'])
  partialUpdate(@Body() updatePromotionDto: PartialUpdatePromotionDto) {
    if (updatePromotionDto._id) {
      return this.promotionsService.partialUpdate(
        updatePromotionDto._id,
        updatePromotionDto,
      );
    } else {
      return this.promotionsService.create(
        updatePromotionDto as CreatePromotionDto,
      );
    }
  }

  @Patch(':id')
  @Roles(['admin'])
  partialUpdateWithId(
    @Param('id') id: string,
    @Body() updatePromotionDto: PartialUpdatePromotionDto,
  ) {
    return this.promotionsService.partialUpdate(id, updatePromotionDto);
  }

  @Put(':id')
  @Roles(['admin'])
  updateWithId(
    @Param('id') id: string,
    @Body() updatePromotionDto: FullUpdatePromotionDto,
  ) {
    return this.promotionsService.fullUpdate(id, updatePromotionDto);
  }

  @Get(':id/exists')
  @Roles(['admin'])
  async exists(@Param('id') id: string) {
    const exists = await this.promotionsService.findById(id);
    return { exists: !!exists };
  }

  @Put()
  @Roles(['admin'])
  fullUpdate(@Body() updatePromotionDto: FullUpdatePromotionDto) {
    if (updatePromotionDto._id) {
      return this.promotionsService.fullUpdate(
        updatePromotionDto._id,
        updatePromotionDto,
      );
    } else {
      return this.promotionsService.create(
        updatePromotionDto as CreatePromotionDto,
      );
    }
  }

  @Delete(':id')
  @Roles(['admin'])
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
