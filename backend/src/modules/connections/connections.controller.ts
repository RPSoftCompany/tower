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
  Query,
  Scope,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import {
  CreateAWSConnectionDto,
  CreateAzureConnectionDto,
  CreateLDAPConnectionDto,
  CreateSCPConnectionDto,
  CreateVaultConnectionDto,
} from './dto/create-connection.dto';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { TowerAuthGuard } from '../../auth/towerAuthGuard';
import { Roles } from '../../auth/roles.decorator';
import { CRUDExceptionWrapper } from '../../helpers/crudHelpers';
import { LDAP } from './ldapConnection.schema';
import { Vault } from './VaultConnection.schema';
import { SCP } from './ScpConnection.schema';
import { AuditInterceptor } from '../../audit-interceptor/audit-interceptor.interceptor';
import { AWSConnection } from './AWSConnection.schema';
import { AzureConnection } from './AzureConnection.schema';

@ApiTags('Connections')
@UseGuards(TowerAuthGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth()
@ApiBasicAuth()
@Controller('connections')
@Injectable({ scope: Scope.REQUEST })
export class ConnectionsController {
  private readonly logger = new Logger(ConnectionsController.name);

  constructor(private readonly connectionsService: ConnectionsService) {}

  @Patch()
  @Roles(['admin'])
  @ApiExtraModels(
    CreateLDAPConnectionDto,
    CreateSCPConnectionDto,
    CreateVaultConnectionDto,
    CreateAzureConnectionDto,
    CreateAWSConnectionDto,
  )
  @ApiBody({
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(CreateLDAPConnectionDto),
        },
        {
          $ref: getSchemaPath(CreateSCPConnectionDto),
        },
        {
          $ref: getSchemaPath(CreateVaultConnectionDto),
        },
        {
          $ref: getSchemaPath(CreateAWSConnectionDto),
        },
        {
          $ref: getSchemaPath(CreateAzureConnectionDto),
        },
      ],
    },
  })
  patch(
    @Body()
    createConnectionDto:
      | CreateLDAPConnectionDto
      | CreateSCPConnectionDto
      | CreateVaultConnectionDto
      | CreateAWSConnectionDto
      | CreateAzureConnectionDto,
  ) {
    return CRUDExceptionWrapper(async () => {
      return this.connectionsService.upsert(createConnectionDto);
    });
  }

  @Get()
  @Roles(['admin'])
  @UseGuards(TowerAuthGuard)
  @ApiQuery({ name: 'filter', required: false })
  findAll(@Query('filter') filter?: string) {
    if (filter) {
      try {
        const jFilter = JSON.parse(filter);
        return this.connectionsService.find(jFilter);
      } catch (e) {
        this.logger.error(e);
        throw new HttpException('Invalid filter', 400, { cause: e });
      }
    } else {
      return this.connectionsService.find();
    }
  }

  @Get(':id')
  @Roles(['admin'])
  findOne(@Param('id') id: string) {
    return this.connectionsService.findOne(id);
  }

  @Delete(':id')
  @Roles(['admin'])
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.connectionsService.remove(id);
  }

  @Post('/testConnection')
  @Roles(['admin'])
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  @ApiExtraModels(LDAP, Vault, SCP)
  @ApiBody({
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(LDAP),
        },
        {
          $ref: getSchemaPath(Vault),
        },
        {
          $ref: getSchemaPath(SCP),
        },
      ],
    },
  })
  @ApiQuery({ name: 'type', required: false })
  testConnection(
    @Body()
    connection: LDAP | Vault | SCP | AWSConnection | AzureConnection,
    @Query('type') type: string,
  ) {
    return this.connectionsService.testConnection(type, connection);
  }
}
