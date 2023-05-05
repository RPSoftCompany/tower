import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  CreateLDAPConnectionDto,
  CreateSCPConnectionDto,
  CreateVaultConnectionDto,
} from './dto/create-connection.dto';
import { Statement } from '../../helpers/clauses';
import { filterTranslator } from '../../helpers/filterTranslator';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Connection, ConnectionDocument } from './connections.schema';
import { LDAP } from './ldapConnection.schema';
import { SCP } from './ScpConnection.schema';
import { Vault } from './VaultConnection.schema';
import sftp from 'ssh2-sftp-client';
import axios from 'axios';
import { authenticate } from 'ldap-authentication';
import { decryptPassword } from '../../helpers/encryptionHelper';
import {
  RestConfiguration,
  RestConfigurationDocument,
} from '../rest-configurations/rest-configurations.schema';
import { Readable } from 'stream';
import { Configuration } from '../configurations/configuration.schema';
import { V1Service } from '../v1/v1.service';
import {
  BaseConfiguration,
  BaseConfigurationDocument,
} from '../base-configurations/base-configurations.schema';

@Injectable()
export class ConnectionsService implements OnModuleInit {
  private readonly logger = new Logger(ConnectionsService.name);

  constructor(
    @InjectModel(Connection.name)
    private connectionModel: Model<ConnectionDocument>,
    @InjectModel(RestConfiguration.name)
    private restModel: Model<RestConfigurationDocument>,
    @InjectModel(BaseConfiguration.name)
    private baseConfigurationModel: Model<BaseConfigurationDocument>,
    @Inject(forwardRef(() => V1Service)) private readonly v1Service: V1Service,
  ) {}

  async onModuleInit() {
    await this.checkIfLDAPExists();
    await this.checkIfVaultExists();

    this.logger.debug('Connections check finished');
  }

  async checkIfLDAPExists() {
    const connection = await this.connectionModel.findOne({
      system: 'LDAP',
    });

    if (!connection) {
      const newLDAP: LDAP = {
        system: 'LDAP',
        bindDN: '',
        bindCredentials: '',
        defaultGroups: [],
        enabled: false,
        url: '',
        displayAttribute: '',
        usernameAttribute: '',
        searchBase: '',
      };
      await this.connectionModel.create(newLDAP);
    }
  }

  async checkIfVaultExists() {
    const connection = await this.connectionModel.findOne({
      system: 'Vault',
    });

    if (!connection) {
      const newVault: Vault = {
        system: 'Vault',
        enabled: false,
        url: '',
        globalToken: '',
        tokens: [],
        useGlobalToken: false,
      };

      await this.connectionModel.create(newVault);
    }
  }

  /**
   * upsert
   *
   * @param createConnectionDto
   */
  async upsert(
    createConnectionDto:
      | CreateLDAPConnectionDto
      | CreateSCPConnectionDto
      | CreateVaultConnectionDto,
  ) {
    if (!!createConnectionDto._id) {
      if (createConnectionDto.system === 'LDAP') {
        const ldapConnection = createConnectionDto as CreateLDAPConnectionDto;

        const existingConnection = await this.connectionModel.findOne({
          system: 'LDAP',
        });

        for (const key in existingConnection) {
          if (key !== '_id' && ldapConnection[key]) {
            existingConnection[key] = ldapConnection[key];
          }
        }

        return await existingConnection.save();
      } else if (createConnectionDto.system === 'Vault') {
        const VaultConnection = createConnectionDto as CreateVaultConnectionDto;

        const existingConnection = await this.connectionModel.findOne({
          system: 'Vault',
        });

        for (const key in VaultConnection) {
          if (key !== '_id') {
            existingConnection[key] = VaultConnection[key];
          }
        }

        return await existingConnection.save();
      } else if (createConnectionDto.system === 'SCP') {
        const SCPConnection = createConnectionDto as CreateSCPConnectionDto;

        const existingConnection = await this.connectionModel.findById(
          SCPConnection._id,
        );

        if (existingConnection) {
          for (const key in existingConnection) {
            if (key !== 'id' && SCPConnection[key]) {
              existingConnection[key] = SCPConnection[key];
            }
          }

          return await existingConnection.save();
        } else {
          throw new BadRequestException('Invalid system id');
        }
      } else {
        throw new BadRequestException('Invalid system name');
      }
    } else if (createConnectionDto.system === 'SCP') {
      const SCPConnection = createConnectionDto as CreateSCPConnectionDto;
      return await this.connectionModel.create(SCPConnection);
    }

    throw new BadRequestException('Invalid connection details');
  }

  /**
   * find
   *
   * @param filter
   */
  find(filter?: Statement): Promise<Array<Connection | LDAP | SCP | Vault>> {
    const newFilter = filterTranslator(filter);

    return this.connectionModel.find(newFilter.where, newFilter.fields, {
      sort: newFilter.order,
      limit: newFilter.limit,
      skip: newFilter.skip,
    });
  }

  /**
   * findOne
   *
   * @param id
   */
  async findOne(id: string) {
    const connection = await this.connectionModel.find({
      _id: new Types.ObjectId(id),
    });

    if (connection.length > 0) {
      return connection[0];
    }

    return {};
  }

  /**
   * remove
   *
   * @param id
   */
  async remove(id: string) {
    const connection = await this.connectionModel.find({
      _id: new Types.ObjectId(id),
    });

    if (connection.length > 0) {
      if ((connection[0] as any).system !== 'SCP') {
        throw new BadRequestException("Can't delete this connection");
      }

      await this.connectionModel.findByIdAndDelete(id);
    }
  }

  /**
   * test connection
   *
   * @param type
   * @param body
   */
  async testConnection(type: string, body?: LDAP | Vault | SCP) {
    if (type === 'SCP') {
      //====================================================
      // SCP
      //====================================================
      let scpConnection;
      if (body) {
        scpConnection = body as SCP;
      } else {
        throw new BadRequestException('Connection not provided');
      }

      const sftpConnection = new sftp();

      try {
        if (scpConnection.authType === 'userpass') {
          await sftpConnection.connect({
            port: 22,
            host: scpConnection.host,
            username: scpConnection.username,
            password: scpConnection.password,
            readyTimeout: 3000,
          });
        } else {
          await sftpConnection.connect({
            port: 22,
            host: scpConnection.host,
            username: scpConnection.username,
            privateKey: scpConnection.key,
            readyTimeout: 3000,
          });
        }
      } catch (e) {
        throw new ServiceUnavailableException(e.message);
      }
    } else if (type === 'Vault') {
      let vaultConnection;
      if (body) {
        vaultConnection = body as Vault;
      } else {
        throw new BadRequestException('Connection not provided');
      }

      try {
        const response = await axios.get(vaultConnection.url);
        if (response.status === 200) {
          return;
        }
      } catch (e) {
        throw new ServiceUnavailableException(e.message);
      }
    } else if (type === 'LDAP') {
      let ldapConnection;
      if (body) {
        ldapConnection = body as LDAP;
      } else {
        throw new BadRequestException('Connection not provided');
      }

      try {
        await authenticate({
          ldapOpts: { url: ldapConnection.url },
          userDn: ldapConnection.bindDN,
          userPassword: ldapConnection.bindCredentials,
        });
      } catch (e) {
        throw new ServiceUnavailableException(e.message);
      }
    }
  }

  /**
   * getVaultVariable
   *
   * @param configurationBases
   * @param variableName
   */
  async getVaultVariable(configurationBases: any, variableName: string) {
    const connection: Vault = await this.connectionModel.findOne({
      system: 'Vault',
    });

    const vaultVariableName = variableName.replace(/.*\//, '');
    const vaultVariablePath = variableName.replace(
      new RegExp(`/${vaultVariableName}$`),
      '',
    );

    if (!connection.enabled) {
      return '';
    }

    if (connection.useGlobalToken) {
      const token = decryptPassword(connection.globalToken);
      return await this.requestVault(
        token,
        `${connection.url}/v1/${vaultVariablePath}`,
        vaultVariableName,
      );
    } else {
      for (const key in configurationBases) {
        const found = connection.tokens.find((el) => {
          return el.base === key && el.name === configurationBases[key];
        });

        if (found && found.token) {
          const token = decryptPassword(found.token);

          const value = await this.requestVault(
            token,
            `${connection.url}/v1/${vaultVariablePath}`,
            vaultVariableName,
          );

          if (value) {
            return value;
          }
        }
      }
    }

    return '';
  }

  /**
   * executeSCPHook
   *
   * @param userRoles
   * @param configurationBases
   * @param configuration
   */
  async executeSCPHook(
    userRoles: string[],
    configurationBases: any,
    configuration: Configuration,
  ) {
    const filter = {
      input: '$items',
      as: 'item',
      cond: { $and: [] },
    };

    const project: any = {
      authType: 1,
      key: 1,
      host: 1,
      username: 1,
      password: 1,
    };

    for (const key in configurationBases) {
      filter.cond.$and.push({
        $eq: [`$$item.${key}`, configurationBases[key]],
      });
    }

    project.items = {
      $filter: filter,
    };

    const aggregation = [
      {
        $match: {
          system: 'SCP',
          items: { $elemMatch: configurationBases },
        },
      },
      {
        $project: project,
      },
    ];

    const connections: SCP[] = await this.connectionModel.aggregate(
      aggregation,
    );

    const allBases = await this.baseConfigurationModel.find();

    for (const connection of connections) {
      for (const connectionItem of connection.items) {
        if (connectionItem.template.id) {
          const template: RestConfiguration = await this.restModel.findById(
            connectionItem.template.id,
          );

          if (template) {
            const sftpConnection = new sftp();

            try {
              if (connection.authType === 'userpass') {
                await sftpConnection.connect({
                  port: connection.port,
                  host: connection.host,
                  username: connection.username,
                  password: decryptPassword(connection.password),
                  readyTimeout: 3000,
                });
              } else {
                await sftpConnection.connect({
                  port: connection.port,
                  host: connection.host,
                  username: connection.username,
                  privateKey: decryptPassword(connection.key),
                  readyTimeout: 3000,
                });
              }

              configuration.variables = configuration.variables.map((el) => {
                if (el.type === 'password') {
                  el.value = decryptPassword(el.value);
                }

                return el;
              });

              const all = await this.v1Service.compileConfiguration(
                userRoles,
                configuration,
                allBases,
                template,
              );

              const stream = new Readable();
              stream.push(all.template);
              stream.push(null);

              await sftpConnection.put(stream, connectionItem.path);
            } catch (e) {
              this.logger.error(
                `Error during the SCP connection: ${e.message}`,
              );
            }
          }
        }
      }
    }
  }

  /**
   * requestVault
   *
   * @param token
   * @param url
   * @param variableName
   * @private
   */
  private async requestVault(token: string, url: string, variableName) {
    let vaultResponse = null;
    try {
      vaultResponse = await axios({
        url: url,
        method: 'GET',
        headers: {
          'X-Vault-Token': token,
        },
      });
    } catch (e) {
      // Ignore
    }

    if (
      vaultResponse &&
      vaultResponse?.status === 200 &&
      vaultResponse?.data?.data?.data
    ) {
      const output = vaultResponse.data.data.data;
      if (output[variableName]) {
        return output[variableName];
      }
    }

    return '';
  }
}
