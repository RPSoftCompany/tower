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
import { Model } from 'mongoose';
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

  constructor(
    @InjectModel(Member.name) private memberModel: Model<MemberDocument>,
    @InjectModel(Connection.name)
    private connectionsModel: Model<ConnectionsModule>,
    @Inject(AccessTokenService)
    private readonly accessTokenService: AccessTokenService,
  ) {
    this.ldapConnection = null;
    this.ldapInitialized = false;
  }

  async onModuleInit() {
    await this.checkIfAdminUserExists();
    this.logger.debug('Admin check finished');
  }

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

  async initializeLdap() {
    const connections: LDAP[] = await this.connectionsModel.find({
      where: {
        system: 'LDAP',
      },
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
    await this.initializeLdap();

    if (!this.ldapConnection) {
      return false;
    }

    return await authenticate({
      ldapOpts: { url: this.ldapConnection.url },
      adminDn: this.ldapConnection.bindDN,
      adminPassword: this.ldapConnection.bindCredentials,
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

  async setAsTechnicalUser(id: string, techUser: boolean) {
    await this.upsert(id, {
      technicalUser: techUser,
    });

    return await this.accessTokenService.createTechnicalUserToken(id, techUser);
  }

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

  async replace(id: string, updateMemberDto: UpdateMemberDto) {
    return CRUDExceptionWrapper(async () => {
      this.memberModel.findByIdAndUpdate(id, updateMemberDto);
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
      } catch (e) {
        this.logger.error(e);
      }
    }

    if (validLdapAuth && !member) {
      member = await this.memberModel.create({
        type: 'ldap',
        blocked: false,
        display: Array.isArray(
          validLdapAuth[this.ldapConnection.usernameAttribute],
        )
          ? validLdapAuth[this.ldapConnection.usernameAttribute][0]
          : validLdapAuth[this.ldapConnection.usernameAttribute],
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
  async deleteUser(userId) {
    await this.memberModel.findByIdAndRemove(userId);
  }
}