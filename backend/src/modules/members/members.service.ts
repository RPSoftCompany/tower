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
import { Model, ProjectionType, Types } from 'mongoose';
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
   * Constructor for initializing the service with required models and services.
   *
   * @param {Model<MemberDocument>} memberModel - The model representing the Member collection.
   * @param {Model<ConnectionsModule>} connectionsModel - The model representing the Connections collection.
   * @param {AccessTokenService} accessTokenService - The service handling access token-related operations.
   *
   * @return {void} Initializes the LDAP connection and state for the class instance.
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
   * Initializes the module by performing necessary setup tasks.
   * This method checks for the existence of an admin user and logs the completion of the check.
   *
   * @return {Promise<void>} A promise that resolves when the initialization logic is completed.
   */
  async onModuleInit() {
    await this.checkIfAdminUserExists();
    this.logger.debug('Admin check finished');
  }

  /**
   * Checks if an admin user exists in the system. If no admin user is found,
   * it will create a default admin user with predefined properties.
   *
   * @return {Promise<void>} A promise that resolves when the operation is complete.
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
   * Initializes the LDAP connection by retrieving the configuration from the connection model.
   * If available and enabled, sets the connection as the active LDAP connection.
   * Sets a flag indicating that the LDAP initialization process is complete.
   *
   * @return {Promise<void>} A promise that resolves when the LDAP initialization is complete.
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
   * Authenticates a user with LDAP credentials.
   *
   * @param {string} username - The username of the user attempting to log in.
   * @param {string} password - The password of the user attempting to log in.
   * @return {Promise<boolean>} A promise that resolves to `true` if the authentication succeeds, and `false` otherwise.
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

  /**
   * Creates a new member in the database using the provided data transfer object.
   *
   * @param {CreateMemberDto} createMemberDto - The data transfer object containing the details of the member to be created.
   * @return {Promise<Object>} A promise that resolves with the created member object.
   */
  async create(createMemberDto: CreateMemberDto) {
    return CRUDExceptionWrapper(async () => {
      return await this.memberModel.create(createMemberDto);
    });
  }

  /**
   * Finds and retrieves an array of members based on the provided filter criteria.
   *
   * @param {Statement} [filter] - The optional filter criteria used to narrow down the search results.
   * @return {Promise<Array<Member>>} A promise that resolves to an array of members matching the filter criteria.
   */
  find(filter?: Statement): Promise<Array<Member>> {
    const newFilter = filterTranslator(filter);

    return this.memberModel.find(
      newFilter.where,
      newFilter.fields as ProjectionType<any>,
      {
        sort: newFilter.order,
        limit: newFilter.limit,
        skip: newFilter.skip,
      },
    );
  }

  /**
   * Retrieves a single member by its unique identifier.
   *
   * @param {string} id - The unique identifier of the member to be retrieved.
   * @return {Promise<Member>} A promise that resolves to the member if found, or rejects if not found.
   */
  findOne(id: string): Promise<Member> {
    return this.memberModel.findById(id);
  }

  /**
   * Inserts or updates a member in the database. If a member with the specified ID exists,
   * it updates the member's details. Otherwise, creates a new member record.
   *
   * @param {string} id - The ID of the member to be inserted or updated.
   * @param {UpsertMemberDto} upsertMemberDto - The data transfer object containing the member's details.
   * @return {Promise<Object>} A promise that resolves to the updated or newly created member object.
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
   * Sets a user as a technical user or non-technical user and generates a technical user token.
   *
   * @param {string} id - The unique identifier of the user.
   * @param {boolean} techUser - A boolean indicating whether the user should be set as a technical user.
   * @return {Promise<any>} A promise that resolves with the created technical user token.
   */
  async setAsTechnicalUser(id: string, techUser: boolean) {
    await this.upsert(id, {
      technicalUser: techUser,
    });

    return await this.accessTokenService.createTechnicalUserToken(id, techUser);
  }

  /**
   * Updates an existing member in the database with the provided data.
   *
   * @param {string} id - The unique identifier of the member to update.
   * @param {UpdateMemberDto} updateMemberDto - An object containing the updated properties for the member.
   * @return {Promise<Object>} A promise that resolves to the updated member object, or an empty object if the member was not found.
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
   * Replaces an existing member's data with the provided updated data.
   *
   * @param {string} id - The unique identifier of the member to be updated.
   * @param {UpdateMemberDto} updateMemberDto - The object containing the updated member data.
   * @return {Promise<Member>} A promise that resolves to the updated member object.
   */
  async replace(id: string, updateMemberDto: UpdateMemberDto) {
    return CRUDExceptionWrapper(async () => {
      return this.memberModel.findByIdAndUpdate(id, updateMemberDto, {
        new: true,
      });
    });
  }

  /**
   * Handles the login process for a user, supports both regular and LDAP-based authentication.
   * It validates user credentials, manages LDAP-specific logic, and generates access tokens if requested.
   *
   * @param {LoginDto} loginDto - The login details including username and password provided by the user.
   * @param {boolean} [issueToken] - Optional flag to indicate whether an access token should be issued. Defaults to true if not provided.
   * @param {string} [include] - Optional string to specify additional user information to include in the output, e.g., 'user'.
   * @return {Promise<Object>} Returns a promise that resolves to the login response, which may include user details, a generated token, and token TTL.
   * @throws {HttpException} Throws an exception if the user is blocked or if the login credentials are invalid.
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
   * Deletes a user from the database by their user ID. (FOR TESTING ONLY)
   *
   * @param {string} userId - The unique identifier of the user to be deleted.
   * @return {Promise<void>} A promise that resolves when the user is successfully deleted.
   */
  async deleteUser(userId: string) {
    await this.memberModel.findOneAndDelete({
      _id: new Types.ObjectId(userId),
    });
  }
}
