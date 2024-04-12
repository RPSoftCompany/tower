import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateMemberDto, memberType } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member, MemberDocument } from './member.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { compareSync } from 'bcrypt';
import { AccessTokenService } from '../access-token/access-token.service';
import { LDAP } from '../connections/ldapConnection.schema';
import { authenticate } from 'ldap-authentication';
import { CRUDExceptionWrapper } from '../../helpers/crudHelpers';
import { filterTranslator } from '../../helpers/filterTranslator';
import { Statement } from '../../helpers/clauses';
import { UpsertMemberDto } from './dto/upsert-member.dto';
import { Connection } from '../connections/connections.schema';
import { ConnectionsModule } from '../connections/connections.module';

@Injectable()
export class MembersService implements OnModuleInit {
  private readonly logger = new Logger(MembersService.name);
  private ldapConnection: null | LDAP;
  private ldapInitialized: boolean;

  /**
   * constructor
   *
   * @param memberModel
   * @param connectionsModel
   * @param accessTokenService
   */
  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    @InjectModel(Connection.name)
    private connectionsModel: Model<ConnectionsModule>,
    @Inject(AccessTokenService)
    private readonly accessTokenService: AccessTokenService,
  ) {
    this.ldapConnection = null;
    this.ldapInitialized = false;

    this.initializeLdap();
  }

  /**
   * onModuleInit
   */
  async onModuleInit() {
    await this.checkIfAdminUserExists();
    this.logger.debug('Admin check finished');
  }

  /**
   * checkIfAdminUserExists
   */
  async checkIfAdminUserExists() {
    const exists = await this.find({
      where: {
        username: 'admin',
      },
    });

    if (exists.length === 0) {
      await this.create({
        type: memberType.LOCAL,
        username: 'admin',
        technicalUser: false,
        display: 'admin',
        newUser: true,
        password: 'admin',
        groups: [],
        blocked: false,
      });
    }
  }

  /**
   * initializeLdap
   */
  async initializeLdap() {
    const connections: LDAP[] = await this.connectionsModel.find({
      system: 'LDAP',
    });

    if (connections && connections.length > 0) {
      const connection = connections[0];

      if (connection.enabled) {
        this.ldapConnection = connection;
      }
    }

    this.ldapInitialized = true;
  }

  /**
   * ldapLogin
   *
   * @param username
   * @param password
   */
  async ldapLogin(username: string, password: string) {
    this.logger.debug('LDAP');

    await this.initializeLdap();

    if (!this.ldapConnection) {
      this.logger.debug('LDAP connection not initialized');
      return false;
    }

    try {
      return await authenticate({
        ldapOpts: { url: this.ldapConnection.url },
        adminDn: this.ldapConnection.bindDN,
        adminPassword: this.ldapConnection.bindCredentials,
        username: username,
        userPassword: password,
        userSearchBase: this.ldapConnection.searchBase,
        usernameAttribute: this.ldapConnection.usernameAttribute,
      });
    } catch (e) {
      // ignore
    }

    // Try with user data as adminDn
    return await authenticate({
      ldapOpts: { url: this.ldapConnection.url },
      adminDn: username,
      adminPassword: password,
      username: username,
      userPassword: password,
      userSearchBase: this.ldapConnection.searchBase,
      usernameAttribute: this.ldapConnection.usernameAttribute,
    });
  }

  async create(createMemberDto: CreateMemberDto) {
    return CRUDExceptionWrapper(async () => {
      return await this.memberModel.create(createMemberDto);
    });
  }

  find(filter?: Statement): Promise<Array<Member>> {
    const newFilter = filterTranslator(filter);

    return this.memberModel.find(newFilter.where, newFilter.fields, {
      sort: newFilter.order,
      limit: newFilter.limit,
      skip: newFilter.skip,
    });
  }

  findOne(id: string): Promise<Member> {
    return this.memberModel.findById(id);
  }

  /**
   * update
   *
   * @param id
   * @param upsertMemberDto
   */
  async upsert(id: string, upsertMemberDto: UpsertMemberDto) {
    return CRUDExceptionWrapper(async () => {
      const existingMember = await this.memberModel.findById(id);
      if (existingMember) {
        for (const key in upsertMemberDto) {
          if (key !== '_id') {
            existingMember[key] = upsertMemberDto[key];
          }
        }

        return await existingMember.save();
      } else {
        return await this.memberModel.create(upsertMemberDto);
      }
    });
  }

  /**
   * setAsTechnicalUser
   *
   * @param id
   * @param techUser
   */
  async setAsTechnicalUser(id: string, techUser: boolean) {
    await this.upsert(id, {
      technicalUser: techUser,
    });

    return await this.accessTokenService.createTechnicalUserToken(id, techUser);
  }

  /**
   * update
   *
   * @param id
   * @param updateMemberDto
   */
  async update(id: string, updateMemberDto: UpdateMemberDto) {
    return CRUDExceptionWrapper(async () => {
      const existingMember = await this.memberModel.findById(id);
      if (existingMember) {
        for (const key in updateMemberDto) {
          if (key !== 'id' && updateMemberDto[key]) {
            existingMember[key] = updateMemberDto[key];
          }
        }

        return await existingMember.save();
      }

      return {};
    });
  }

  /**
   * replace
   *
   * @param id
   * @param updateMemberDto
   */
  async replace(id: string, updateMemberDto: UpdateMemberDto) {
    return CRUDExceptionWrapper(async () => {
      return this.memberModel.findByIdAndUpdate(id, updateMemberDto, {
        new: true,
      });
    });
  }

  /**
   * login
   *
   * @param loginDto
   * @param issueToken
   * @param include
   */
  async login(loginDto: LoginDto, issueToken?: boolean, include?: string) {
    let member = await this.memberModel
      .findOne({
        username: loginDto.username,
      })
      .exec();

    let validLdapAuth = false;

    if (!member) {
      await this.initializeLdap();
    }

    if (
      this.ldapConnection &&
      loginDto.username !== 'admin' &&
      (!member || member.type === 'ldap')
    ) {
      try {
        validLdapAuth = await this.ldapLogin(
          loginDto.username,
          loginDto.password,
        );

        this.logger.debug(
          `LDAP login output: ${JSON.stringify(validLdapAuth)}`,
        );
      } catch (e) {
        this.logger.error(e);
      }
    }

    if (validLdapAuth && !member) {
      this.logger.debug('Creating LDAP user');
      member = await this.memberModel.create({
        type: 'ldap',
        blocked: false,
        display: Array.isArray(
          validLdapAuth[this.ldapConnection.displayAttribute],
        )
          ? validLdapAuth[this.ldapConnection.displayAttribute][0]
          : validLdapAuth[this.ldapConnection.displayAttribute],
        groups: this.ldapConnection.defaultGroups,
        username: loginDto.username,
        newUser: false,
      });
    }

    if (member && !member.blocked) {
      if (!validLdapAuth && member.type === 'ldap') {
        throw new HttpException(
          'Invalid username or password',
          HttpStatus.UNAUTHORIZED,
        );
      }

      let passwordValid = true;

      try {
        if (!validLdapAuth) {
          passwordValid = compareSync(loginDto.password, member.password);
        }
      } catch (e) {
        this.logger.error(e);
        throw new HttpException(
          'Invalid username or password',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!passwordValid) {
        throw new HttpException(
          'Invalid username or password',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (issueToken === false) {
        return member;
      }

      const token = await this.accessTokenService.createAccessToken(
        +process.env.TTL,
        member.id,
      );

      const output: any = {
        ttl: +process.env.TTL,
        userId: member.id,
        id: token,
      };

      if (include === 'user') {
        output.user = {
          username: member.username,
          groups: member.groups,
          newUser: member.newUser,
          type: member.type,
          display: member.display,
          blocked: member.blocked ? member.blocked : false,
        };
      }

      return output;
    } else if (member && member.blocked) {
      throw new HttpException('User blocked', HttpStatus.UNAUTHORIZED);
    } else {
      throw new HttpException(
        'Invalid username or password',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * deleteUser FOR TESTING PURPOSES ONLY
   *
   * @param userId
   */
  async deleteUser(userId: string) {
    await this.memberModel.findOneAndDelete({
      _id: new Types.ObjectId(userId),
    });
  }
}
