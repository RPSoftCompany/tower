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
  Patch,
  Post,
  Put,
  Query,
  Scope,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Member } from './member.schema';
import { LoginDto } from './dto/login.dto';
import { TowerAuthGuard } from '../../auth/towerAuthGuard';
import { Roles } from '../../auth/roles.decorator';
import { UpsertMemberDto } from './dto/upsert-member.dto';
import { REQUEST } from '@nestjs/core';
import { NewPasswordDto } from './dto/newPassword.dto';
import { Types } from 'mongoose';
import { AccessTokenService } from '../access-token/access-token.service';
import { AuditInterceptor } from '../../audit-interceptor/audit-interceptor.interceptor';

@Controller('members')
@ApiTags('Members')
@Injectable({ scope: Scope.REQUEST })
export class MembersController {
  private readonly logger = new Logger(MembersController.name);

  constructor(
    private readonly membersService: MembersService,
    private readonly accessTokenService: AccessTokenService,
    @Inject(REQUEST) private request: Record<string, unknown>,
  ) {}

  /**
   * PATCH /members
   *
   * @param upsertMemberDto
   */
  @Patch()
  @UseGuards(TowerAuthGuard)
  @UseInterceptors(AuditInterceptor)
  @Roles(['admin'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  upsert(@Body() upsertMemberDto: UpsertMemberDto) {
    if (upsertMemberDto._id) {
      return this.membersService.upsert(upsertMemberDto._id, upsertMemberDto);
    } else {
      return this.membersService.create({
        type: upsertMemberDto.type,
        display: upsertMemberDto.display,
        blocked: upsertMemberDto.blocked,
        groups: upsertMemberDto.groups,
        newUser: upsertMemberDto.newUser,
        password: upsertMemberDto.password,
        technicalUser: upsertMemberDto.technicalUser,
        username: upsertMemberDto.username,
      });
    }
  }

  /**
   * GET /members
   *
   * @param filter
   */
  @Get()
  @UseGuards(TowerAuthGuard)
  @Roles(['admin'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  @ApiQuery({ name: 'filter', required: false })
  findAll(@Query('filter') filter?: string): Promise<Array<Member>> {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return this.membersService.find(jFilter);
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return this.membersService.find();
    }
  }

  /**
   * POST /members
   *
   * @param createMemberDto
   */
  @Post()
  @UseGuards(TowerAuthGuard)
  @Roles(['admin'])
  @ApiResponse({ status: 201 })
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiBasicAuth()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  /**
   * PATCH /members/:id
   *
   * @param id
   * @param upsertMemberDto
   */
  @Patch(':id')
  @UseGuards(TowerAuthGuard)
  @Roles(['admin'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  update(@Param('id') id: string, @Body() upsertMemberDto: UpsertMemberDto) {
    return this.membersService.upsert(id, upsertMemberDto);
  }

  /**
   * getTechnicalUserToken
   *
   * @param userId
   */
  @Get('/getTechnicalUserToken')
  @UseGuards(TowerAuthGuard)
  @Roles(['admin'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  @ApiQuery({ name: 'userId', required: false })
  async getTechnicalUserToken(@Query('userId') userId?: string) {
    const user = await this.membersService.findOne(userId);
    if (user && user.technicalUser) {
      const token = await this.accessTokenService.find({
        where: {
          userId: new Types.ObjectId(userId),
          ttl: -1,
        },
      });

      if (token[0]) {
        return await this.accessTokenService.signTechnicalAccessToken(
          (token[0] as any)._id,
        );
      }
    }

    throw new BadRequestException('Invalid user');
  }

  /**
   * getUserRoles
   */
  @Get('/getUserRoles')
  @UseGuards(TowerAuthGuard)
  @Roles([])
  @ApiBearerAuth()
  @ApiBasicAuth()
  async getUserRoles() {
    return (this.request.__userData as any).__roles;
  }

  /**
   * GET /members/:id
   *
   * @param id
   */
  @Get(':id')
  @UseGuards(TowerAuthGuard)
  @Roles(['admin'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  async findOne(@Param('id') id: string): Promise<Member> {
    return await this.membersService.findOne(id);
  }

  /**
   * GET /members/:id/exists
   *
   * @param id
   */
  @Get(':id/exists')
  @UseGuards(TowerAuthGuard)
  @Roles(['admin'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  async checkIfExists(@Param('id') id: string) {
    const exists = await this.membersService.findOne(id);
    return { exists: !!exists };
  }

  /**
   * PUT /members/:id
   *
   * @param id
   * @param updateMemberDto
   */
  @Put(':id')
  @UseGuards(TowerAuthGuard)
  @ApiResponse({ status: 200 })
  @Roles(['admin'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  async replace(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.replace(id, updateMemberDto);
  }

  @Post('/changeUserPassword')
  @UseGuards(TowerAuthGuard)
  @Roles([])
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiBasicAuth()
  async changeUserPassword(@Body() newPassword: NewPasswordDto) {
    if (this.request.__userData && (this.request.__userData as any)._id) {
      const id = (this.request.__userData as any)._id;
      return this.membersService.upsert(id, {
        _id: id,
        password: newPassword.newPassword,
        newUser: false,
      });
    }
  }

  /**
   * login
   *
   * @param loginDto
   * @param include
   */
  @Post('/login')
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @ApiQuery({ name: 'include', required: false })
  async login(@Body() loginDto: LoginDto, @Query('include') include?: string) {
    return this.membersService.login(loginDto, true, include);
  }

  /**
   * logout
   */
  @Post('/logout')
  @UseGuards(TowerAuthGuard)
  @Roles([])
  @ApiBearerAuth()
  @ApiBasicAuth()
  @ApiResponse({ status: 204, description: 'Logout successful' })
  @HttpCode(204)
  async logout() {
    if (this.request.__accessToken) {
      await this.accessTokenService.logout(
        this.request.__accessToken as string,
      );
    }
  }

  /**
   * setAsTechnicalUser
   */
  @Post('/setAsTechnicalUser')
  @UseGuards(TowerAuthGuard)
  @Roles(['admin'])
  @ApiBearerAuth()
  @ApiBasicAuth()
  @ApiResponse({ status: 200 })
  @HttpCode(200)
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'isTechUser', required: true, type: Boolean })
  async setAsTechnicalUser(
    @Query('userId') userId: string,
    @Query('isTechUser') isTechUser: boolean,
  ) {
    return await this.membersService.setAsTechnicalUser(userId, isTechUser);
  }
}
