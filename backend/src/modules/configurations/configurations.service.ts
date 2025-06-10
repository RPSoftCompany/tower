import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, Types } from 'mongoose';
import { V1Module } from '../v1/v1.module';
import { V1 } from '../v1/v1.schema';
import { CreateV1Dto } from '../v1/dto/create-v1.dto';
import * as process from 'process';
import {
  decryptPassword,
  encryptPassword,
} from '../../helpers/encryptionHelper';
import { Configuration, ConfigurationDocument } from './configuration.schema';
import {
  filterTranslator,
  prepareAggregateArray,
} from '../../helpers/filterTranslator';
import { BaseModelStatement, Statement } from '../../helpers/clauses';
import { Role } from '../roles/roles.schema';
import { RolesModule } from '../roles/roles.module';
import { BaseConfiguration } from '../base-configurations/base-configurations.schema';
import { BaseConfigurationsModule } from '../base-configurations/base-configurations.module';
import { ConfigurationModel } from '../configuration-models/configuration-models.schema';
import { ConfigurationModelsModule } from '../configuration-models/configuration-models.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { Promotion } from '../promotions/promotions.schema';
import { HooksService } from '../hooks/hooks.service';
import { ConnectionsService } from '../connections/connections.service';
import { V1Service } from '../v1/v1.service';
import { maxConfiguration } from '../max-configuration/max-configuration.schema';
import { MaxConfigurationModule } from '../max-configuration/max-configuration.module';
import { MaxConstantVariableModule } from '../max-constant-variable/max-constant-variable.module';
import { MaxConstantVariable } from '../max-constant-variable/max-constant-variable.schema';

@Injectable()
export class ConfigurationsService implements OnModuleInit {
  private readonly logger = new Logger(ConfigurationsService.name);

  constructor(
    @InjectModel(V1.name) private v1Model: Model<V1Module>,
    @InjectModel(Role.name) private rolesModel: Model<RolesModule>,
    @InjectModel(BaseConfiguration.name)
    private baseConfigurationModel: Model<BaseConfigurationsModule>,
    @InjectModel(Configuration.name)
    private configurationModel: Model<ConfigurationDocument>,
    @InjectModel(Promotion.name)
    private promotionModel: Model<PromotionsModule>,
    @InjectModel(ConfigurationModel.name)
    private configurationModelModel: Model<ConfigurationModelsModule>,
    @InjectModel(maxConfiguration.name)
    private maxConfiguration: Model<MaxConfigurationModule>,
    @InjectModel(MaxConstantVariable.name)
    private maxConstantVariable: Model<MaxConstantVariableModule>,
    @Inject(HooksService)
    private readonly hooksService: HooksService,
    @Inject(forwardRef(() => ConnectionsService))
    private readonly connectionsService: ConnectionsService,
    @Inject(forwardRef(() => V1Service))
    private readonly v1Service: V1Service,
  ) {}

  /**
   * Initializes the module by performing necessary checks and setups, such as validating the encryption key, initializing
   * configurations, and creating indexes. If the environment variable `SECRET` is not properly configured with a 32-character
   * encryption key, the method logs and exits the initialization process.
   *
   * The method also manages reinitialization scenarios by checking the current state and comparing encryption keys.
   * If the encryption key mismatch is detected, the method logs an error and halts further execution.
   *
   * @return {Promise<void>} A promise that resolves when the module is successfully initialized, or rejects/logs errors
   * during the process if there are issues with the encryption key or other system checks.
   */
  async onModuleInit() {
    if (process.env.SECRET && process.env.SECRET.length !== 32) {
      process.env.SECRET = null;
      this.logger.error('================= ERROR ===================');
      this.logger.error('Encryption key should be 32 characters long');
      this.logger.error('===========================================');
      return;
    }

    const isInitialized = await this.getInitialized();

    if (!isInitialized) {
      if (process.env.SECRET && process.env.SECRET.length === 32) {
        await this.initialize({
          booted: true,
          encryptionCheck: encryptPassword(process.env.SECRET),
        });
      }
    } else {
      if (
        decryptPassword(isInitialized.encryptionCheck) !== process.env.SECRET
      ) {
        process.env.SECRET = null;
        this.logger.error('================= ERROR ===================');
        this.logger.error('         Invalid encryption key            ');
        this.logger.error('===========================================');
        return;
      }
    }

    this.logger.debug('Encryption key check finished');

    await this.createMaxConfigurationsCollection();

    await this.createIndexes();
  }

  /**
   * Generates a random string based on the specified length and character set.
   *
   * @param {number} length - The length of the random string to generate.
   * @param {string} chars - A string specifying the character groups to include.
   *                         Use 'a' for lowercase letters, 'A' for uppercase letters,
   *                         '#' for digits, and '!' for special characters.
   * @return {string} A random string composed of characters from the specified groups.
   */
  randomString(length: number, chars: string) {
    let mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    let result = '';
    for (let i = length; i > 0; --i)
      result += mask[Math.floor(Math.random() * mask.length)];
    return result;
  }

  async updateMetadata() {}

  /**
   * Creates or updates the 'maxConfiguration' collection in the database based on the existing configurations.
   * This method ensures the 'maxConfiguration' collection exists and is populated with documents
   * having the maximum version for each configuration group.
   *
   * Steps performed:
   * 1. Checks if the 'maxConfiguration' collection exists. If it does, verifies that it contains documents.
   * 2. Creates the 'maxConfiguration' collection if it does not exist or is empty.
   * 3. Retrieves all base configurations and constructs grouping criteria based on base configuration names.
   * 4. Updates documents in the main configuration collection by setting metadata.
   * 5. Runs an aggregation pipeline to determine the maximum version of configurations per group
   *    and writes the resulting documents to the 'maxConfiguration' collection.
   *
   * @return {Promise<void>} Returns a promise that resolves once the operation is complete.
   */
  async createMaxConfigurationsCollection() {
    const collections = await this.maxConfiguration.db.listCollections();
    let exists = collections.some((collection) => {
      return collection.name === 'maxConfiguration';
    });

    if (exists) {
      const count = await this.maxConfiguration.countDocuments();
      if (count === 0) {
        exists = false;
      }
    }

    if (!exists) {
      const allBases: BaseConfiguration[] =
        await this.baseConfigurationModel.find();

      await this.maxConfiguration.db.createCollection('maxConfiguration');

      if (allBases.length === 0) {
        return;
      }

      const groupId = {};
      const lookupLet = {
        maxVersion: '$maxVersion',
      };
      const lookupExp = [
        {
          $eq: ['$version', '$$maxVersion'],
        },
      ];
      for (const base of allBases) {
        groupId[base.name] = `$${base.name}`;
        const tempRandom = this.randomString(12, 'a');
        lookupLet[tempRandom] = `$_id.${base.name}`;
        lookupExp.push({
          $eq: [`$${base.name}`, `$$${tempRandom}`],
        });
      }

      await this.configurationModel.updateMany({ __metadata: null }, [
        {
          $set: {
            __metadata: groupId,
          },
        },
      ]);

      const aggregation = [
        {
          $group: {
            _id: groupId,
            maxVersion: {
              $max: '$version',
            },
          },
        },
        {
          $lookup: {
            from: 'configuration',
            let: lookupLet,
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: lookupExp,
                  },
                },
              },
            ],
            as: 'maxDoc',
          },
        },
        {
          $unwind: {
            path: '$maxDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $replaceRoot: {
            newRoot: '$maxDoc',
          },
        },
        {
          $out: {
            db: this.configurationModel.db.name,
            coll: 'maxConfiguration',
          },
        },
      ];

      await this.configurationModel.aggregate(aggregation).exec();

      await this.configurationModel.updateMany(
        { $expr: { __metadata: null } },
        [
          {
            $set: {
              __metadata: groupId,
            },
          },
        ],
      );
    }
  }

  /**
   * Creates and applies database indexes based on the configurations retrieved from the base configuration model.
   * This method dynamically generates indexes for several schemas based on the properties of each base configuration.
   *
   * @return {Promise<void>} A promise that resolves when all indexes have been created and synchronized successfully.
   */
  async createIndexes() {
    const allBases: BaseConfiguration[] =
      await this.baseConfigurationModel.find();

    const fullIndex: any = {};

    for (const base of allBases) {
      const index: any = {};
      index[`__metadata.${base.name}`] = 'ascending';
      fullIndex[base.name] = 1;
      this.configurationModel.schema.index(index);
      this.maxConstantVariable.schema.index(index);
      await this.maxConstantVariable.ensureIndexes(index);
      this.maxConfiguration.schema.index(index);
      await this.maxConfiguration.ensureIndexes(index);
    }

    if (allBases.length > 0) {
      this.configurationModel.schema.index(fullIndex);
    }

    this.configurationModel.schema.index(
      {
        __metadata: 1,
        version: 1,
      },
      {
        unique: true,
      },
    );

    await this.configurationModel.syncIndexes();
  }

  /**
   * Removes a specific index from the schema based on the provided name.
   *
   * @param {string} name - The name of the index to be removed.
   * @return {Promise<void>} A promise that resolves once the index has been removed and the indexes have been updated.
   */
  async removeIndex(name: string) {
    // const allIndexes = await this.configurationModel.listIndexes();

    (this.configurationModel.schema as any)._indexes = (
      this.configurationModel.schema as any
    )._indexes.filter((el: Array<any>) => {
      let includes = false;
      for (const index of el) {
        if (Object.keys(index).includes(name)) {
          includes = true;
        }
      }

      return !includes;
    });

    await this.createIndexes();
  }

  /**
   * Retrieves and returns an initialized instance of V1 from the data store.
   *
   * @return {Promise<V1>} A promise that resolves to an instance of V1.
   */
  async getInitialized(): Promise<V1> {
    return this.v1Model.findOne();
  }

  /**
   * Initializes the resource using the provided data transfer object.
   *
   * @param {CreateV1Dto} createV1Dto - The data transfer object containing initialization details.
   * @return {Promise<any>} A promise that resolves to the created resource if initialization is required, or undefined if already initialized.
   */
  async initialize(createV1Dto: CreateV1Dto) {
    const initialized = await this.getInitialized();
    if (!initialized) {
      return this.v1Model.create(createV1Dto);
    }
  }

  /**
   * Creates a new configuration based on the provided details and validates it using various constraints and rules.
   *
   * @param {CreateConfigurationDto} createConfigurationDto - The data transfer object containing configuration details such as variables, draft status, and comments.
   * @param {string[]} userRoles - An array of roles assigned to the current user, used for permissions validation.
   * @param {string} userId - The ID of the user creating the configuration, used for auditing and metadata purposes.
   * @return {Promise<Configuration>} A promise that resolves to the newly created configuration object.
   * @throws {BadRequestException} Throws an exception if the configuration validation fails or required inputs are missing.
   * @throws {UnauthorizedException} Throws an exception if the user lacks proper permissions to perform the operation.
   */
  async create(
    createConfigurationDto: CreateConfigurationDto,
    userRoles: string[],
    userId: string,
  ) {
    await this.hooksService.executeHook(
      'beforeCreate',
      'Configuration',
      createConfigurationDto,
    );

    const allRoles: Array<Role> = await this.rolesModel.find({
      name: /^configurationModel\.[^.]+\.[^.]+\.view$/,
    });

    const allRolesString = [];
    allRoles.forEach((role) => {
      allRolesString.push(role.name);
    });

    const allBases: Array<BaseConfiguration> =
      await this.baseConfigurationModel.find();

    const newConfigurationObject: CreateConfigurationDto = {
      variables: createConfigurationDto.variables,
      draft: createConfigurationDto.draft
        ? createConfigurationDto.draft
        : false,
    };

    let numberOfModelsUsed = 0;

    let metaData = {};
    const queryObject = {};

    for (const base of allBases) {
      if (createConfigurationDto[base.name]) {
        const modelExists: ConfigurationModel =
          await this.configurationModelModel.findOne({
            base: `${base.name}`,
            name: `${createConfigurationDto[base.name]}`,
          });

        // Validate if comment is present (if required)
        if (modelExists?.options.forceComment === true) {
          if (!createConfigurationDto.comment) {
            throw new BadRequestException(
              `Configuration validation failed. No comment provided`,
            );
          }
        }

        metaData[`${base.name}`] = `${createConfigurationDto[base.name]}`;

        if (modelExists) {
          // Validate roles
          const currentRole = `configurationModel.${base.name}.${
            createConfigurationDto[base.name]
          }`;
          if (allRolesString.includes(`${currentRole}.view`)) {
            if (
              !userRoles.includes('admin') &&
              !userRoles.includes(`${currentRole}.view`)
            ) {
              throw new UnauthorizedException();
            }
          }

          let validationOk = false;

          // Validate restrictions
          if (
            modelExists.restrictions.length > 0 &&
            modelExists.options.hasRestrictions
          ) {
            for (const restriction of modelExists.restrictions) {
              let isOk = true;
              for (const key in restriction) {
                if (key !== '__id' && restriction[key]) {
                  if (restriction[key] !== createConfigurationDto[key]) {
                    isOk = false;
                  }
                }
              }

              if (isOk) {
                validationOk = true;
                break;
              }
            }
          } else {
            validationOk = true;
          }

          if (!validationOk) {
            throw new BadRequestException(
              `Configuration validation failed. Provided configuration violates ${
                createConfigurationDto[base.name]
              } restrictions`,
            );
          }

          if (modelExists.rules) {
            for (const rule of modelExists.rules) {
              const findRuleVariables = newConfigurationObject.variables.filter(
                (variable) => {
                  if (!rule.targetRegEx) {
                    return variable[rule.targetType] === rule.targetValue;
                  } else {
                    const regex = new RegExp(rule.targetValue);
                    return regex.test(variable[rule.targetType]);
                  }
                },
              );

              for (const variable of findRuleVariables) {
                let valid = true;
                if (!rule.conditionRegEx) {
                  valid = variable[rule.conditionType] === rule.conditionValue;
                } else {
                  const regex = new RegExp(rule.conditionValue);
                  valid = regex.test(variable[rule.conditionType]);
                }

                if (!valid) {
                  throw new BadRequestException(
                    `Variable ${variable.name} violates one of ${
                      createConfigurationDto[base.name]
                    } rules: ${rule.error}`,
                  );
                }
              }
            }
          }

          numberOfModelsUsed++;
          newConfigurationObject[base.name] = createConfigurationDto[base.name];
          queryObject[base.name] = createConfigurationDto[base.name];
        } else {
          throw new BadRequestException(
            `Invalid base model name: ${base.name}: ${
              createConfigurationDto[base.name]
            }`,
          );
        }
      } else {
        queryObject[base.name] = null;
        newConfigurationObject[base.name] = null;
      }
    }

    if (numberOfModelsUsed === 0) {
      throw new BadRequestException('At least one base model has to be used');
    }

    const max = await this.configurationModel.findOne(
      queryObject,
      { version: true },
      {
        sort: { version: -1 },
      },
    );

    if (max) {
      newConfigurationObject.version = max.version + 1;
    } else {
      newConfigurationObject.version = 1;
    }

    newConfigurationObject.createdBy = userId;
    newConfigurationObject.comment = createConfigurationDto.comment;
    newConfigurationObject.__metadata = metaData;

    const retValue: Configuration = await this.configurationModel.create(
      newConfigurationObject,
    );

    newConfigurationObject.effectiveDate = retValue.effectiveDate;

    await this.maxConfiguration.updateOne(
      queryObject,
      { $set: newConfigurationObject },
      { upsert: true },
    );

    setTimeout(() => {
      this.hooksService
        .executeHook('afterCreate', 'Configuration', retValue)
        .then(() => {
          // IGNORE
        })
        .catch((e) => {
          this.logger.error(e);
        });

      this.connectionsService
        .executeSCPHook(userRoles, queryObject, retValue)
        .then(() => {
          // IGNORE
        })
        .catch((e) => {
          this.logger.error(e);
        });

      this.connectionsService
        .executeKubernetesHook(queryObject, retValue)
        .then(() => {
          // IGNORE
        })
        .catch((e) => {
          this.logger.error(e);
        });
    }, 100);

    return retValue;
  }

  /**
   * Finds configurations based on user roles and applied filters.
   *
   * @param {string[]} userRoles - An array of roles assigned to the user.
   * @param {Statement} [filter] - An optional filter object to refine the search query.
   * @param {boolean} [populate=true] - Indicates whether to populate certain fields in the results.
   * @return {Promise<Array<Configuration>>} A promise that resolves to an array of resulting configurations.
   */
  async find(
    userRoles: string[],
    filter?: Statement,
    populate?: boolean,
  ): Promise<Array<Configuration>> {
    populate ??= true;

    const newFilter = filterTranslator(filter);

    if (userRoles.includes('admin')) {
      const all = this.configurationModel.find(
        newFilter.where,
        newFilter.fields as ProjectionType<any>,
        {
          sort: newFilter.order,
          limit: newFilter.limit,
          skip: newFilter.skip,
        },
      );

      if (populate) {
        return all.populate('createdBy', ['username', 'type', 'display']);
      } else {
        return all;
      }
    } else {
      const allRoles: Array<Role> = await this.rolesModel.find({
        name: /^configurationModel\.[^.]+\.[^.]+\.view/,
      });

      const rolesNin = [];
      allRoles.forEach((el) => {
        if (!userRoles.includes(el.name)) {
          let name = el.name.replace(/^configurationModel\.[^.]+\./, '');
          name = name.replace(/.view$/, '');

          let base = el.name.replace(/^configurationModel\./, '');
          base = base.replace(/\.[^.]+\.view$/, '');

          const obj: any = {};
          obj[base] = name;

          rolesNin.push(obj);
        }
      });

      const match = {
        $nor: rolesNin,
      };

      const aggregation = prepareAggregateArray(
        match.$nor.length > 0 ? match : undefined,
        newFilter,
      );

      if (aggregation.length === 0) {
        if (populate) {
          return await this.configurationModel
            .find()
            .populate('createdBy', ['username', 'type', 'display'])
            .exec();
        } else {
          return await this.configurationModel.find().exec();
        }
      } else {
        const all: Configuration[] = await this.configurationModel
          .aggregate(aggregation)
          .exec();

        if (populate) {
          return await this.configurationModel.populate(all, {
            path: 'createdBy',
            select: ['username', 'type', 'display'],
          });
        } else {
          return all;
        }
      }
    }
  }

  /**
   * Finds the latest configuration information based on user roles, filters, and whether to populate related data.
   *
   * @param {string[]} userRoles - An array of user roles determining the access level of the user.
   * @param {Statement} [filter] - Optional filtering criteria to narrow down the search results.
   * @param {boolean} [populate=true] - Whether to fetch and include related fields (e.g., createdBy details).
   * @return {Promise<Object|null>} A Promise that resolves to the latest configuration object, or null if no matching result is found.
   */
  async findLatest(
    userRoles: string[],
    filter?: Statement,
    populate?: boolean,
  ) {
    populate ??= true;

    const newFilter = filterTranslator(filter);

    if (userRoles.includes('admin')) {
      const all = this.maxConfiguration.findOne(
        newFilter.where,
        newFilter.fields,
        {
          sort: newFilter.order,
          limit: newFilter.limit,
          skip: newFilter.skip,
        },
      );

      if (populate) {
        return all.populate('createdBy', ['username', 'type', 'display']);
      } else {
        return all;
      }
    } else {
      const allRoles: Array<Role> = await this.rolesModel.find({
        name: /^configurationModel\.[^.]+\.[^.]+\.view/,
      });

      const rolesNin = [];
      allRoles.forEach((el) => {
        if (!userRoles.includes(el.name)) {
          let name = el.name.replace(/^configurationModel\.[^.]+\./, '');
          name = name.replace(/.view$/, '');

          let base = el.name.replace(/^configurationModel\./, '');
          base = base.replace(/\.[^.]+\.view$/, '');

          const obj: any = {};
          obj[base] = name;

          rolesNin.push(obj);
        }
      });

      const match = {
        $nor: rolesNin,
      };

      const aggregation = prepareAggregateArray(
        match.$nor.length > 0 ? match : undefined,
        newFilter,
      );

      if (aggregation.length === 0) {
        if (populate) {
          return await this.maxConfiguration
            .findOne()
            .populate('createdBy', ['username', 'type', 'display'])
            .exec();
        } else {
          return await this.maxConfiguration.find().exec();
        }
      } else {
        const all: Array<maxConfiguration> = await this.maxConfiguration
          .aggregate(aggregation)
          .exec();

        if (!all || all.length === 0) {
          return null;
        }

        if (populate) {
          return await this.maxConfiguration.populate(all[0], {
            path: 'createdBy',
            select: ['username', 'type', 'display'],
          });
        } else {
          return all[0];
        }
      }
    }
  }

  /**
   * Counts the number of documents in the configuration model based on the specified user roles and optional filter criteria.
   * If the user has an "admin" role, the count is unrestricted. Otherwise, permissions are checked against user roles.
   *
   * @param {string[]} userRoles - An array of roles assigned to the user, which determine access restrictions.
   * @param {Statement} [filter] - An optional filter object used to specify search conditions, sorting, limits, and skips.
   * @return {Promise<number>} The total count of documents that match the specified criteria and role restrictions.
   */
  async count(userRoles: string[], filter?: Statement): Promise<number> {
    const newFilter = filterTranslator(filter);

    if (userRoles.includes('admin')) {
      return this.configurationModel.countDocuments(newFilter.where, {
        sort: newFilter.order,
        limit: newFilter.limit,
        skip: newFilter.skip,
      });
    } else {
      const allRoles: Array<Role> = await this.rolesModel.find({
        name: /^configurationModel\.[^.]+\.[^.]+\.view/,
      });

      const rolesNin = [];
      allRoles.forEach((el) => {
        if (!userRoles.includes(el.name)) {
          let name = el.name.replace(/^configurationModel\.[^.]+\./, '');
          name = name.replace(/.view$/, '');

          let base = el.name.replace(/^configurationModel\./, '');
          base = base.replace(/\.[^.]+\.view$/, '');

          const obj: any = {};
          obj[base] = name;

          rolesNin.push(obj);
        }
      });

      const match = {
        $nor: rolesNin,
      };

      const aggregation = prepareAggregateArray(
        match.$nor.length > 0 ? match : undefined,
        newFilter,
      );

      aggregation.push({
        $count: 'count',
      });

      if (aggregation.length === 0) {
        return await this.configurationModel.countDocuments().exec();
      } else {
        return (await this.configurationModel.aggregate(aggregation).exec())[0]
          .count;
      }
    }
  }

  /**
   * Retrieves a single document by its identifier if it exists.
   *
   * @param {string[]} userRoles - The roles of the user requesting the data, used for authorization purposes.
   * @param {string} id - The unique identifier of the document to find.
   * @return {Promise<Object|null>} A promise that resolves to the found document object if it exists, or null if not found.
   */
  async findById(userRoles: string[], id: string) {
    const found = await this.find(userRoles, {
      where: {
        _id: new Types.ObjectId(id),
      },
    });

    if (found.length > 0) {
      return found[0];
    } else {
      return null;
    }
  }

  /**
   * Removes a document from the database by its unique identifier.
   *
   * @param {string} id - The unique identifier of the document to be removed.
   * @return {Promise<Object|null>} A promise that resolves to the deleted document if found and removed, or null if no document was found with the given ID.
   */
  async remove(id: string) {
    return this.configurationModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
    });
    // return this.configurationModel.findByIdAndRemove(id);
  }

  /**
   * Retrieves a configuration by filtering based on effective date and user roles.
   *
   * @param {string[]} userRoles - An array of user roles to determine applicable configurations.
   * @param {BaseModelStatement} filter - The base filter object for constructing the query.
   * @param {Date} date - The reference date to filter the configurations by effective date.
   * @return {Promise<any|null>} A promise that resolves to the processed configuration or null if no configuration matches.
   */
  async findByDate(
    userRoles: string[],
    filter: BaseModelStatement,
    date: Date,
  ) {
    const allBases: Array<BaseConfiguration> =
      await this.baseConfigurationModel.find();

    const tempFilter: any = { ...filter };
    tempFilter['effectiveDate'] = { $lt: date };

    const newFilter = {
      where: tempFilter,
      order: 'version DESC',
      limit: 1,
    };

    const config = await this.find(userRoles, newFilter, true);

    if (config.length > 0) {
      return await this.v1Service.incorporateConstantVariables(
        userRoles,
        allBases,
        config[0],
        date,
      );
    } else {
      return null;
    }
  }

  /**
   * Promotes a specific configuration by setting its promoted status to true.
   *
   * @param {string} id - The unique identifier of the configuration to be promoted.
   * @param {string[]} userRoles - The roles of the user performing the operation, used to verify access permissions.
   * @return {Promise<void>} Resolves when the configuration is successfully promoted, or does nothing if not found.
   */
  async promoteConfiguration(id: string, userRoles: string[]) {
    const configuration = await this.findById(userRoles, id);
    if (configuration) {
      await this.configurationModel.updateOne(
        { _id: new Types.ObjectId(id) },
        {
          promoted: true,
        },
      );
    }
  }

  /**
   * Finds promotion candidates based on the provided filter and user roles.
   *
   * @param {BaseModelStatement} filter - The filter criteria used to identify potential promotion candidates.
   * @param {string[]} userRoles - An array of user roles that will determine access permissions and applicable configurations.
   * @return {Promise<Configuration[]>} A promise that resolves to an array of configurations that match the criteria for promotion candidates.
   */
  async findPromotionCandidates(
    filter: BaseModelStatement,
    userRoles: string[],
  ) {
    const allBases: Array<BaseConfiguration> =
      await this.baseConfigurationModel.find();

    let whereFilter: any = { $or: [] };

    // Validate filter
    const filterKeys = Object.keys(filter);

    for (let i = 0; i < allBases.length; i++) {
      if (!filterKeys.includes(allBases[i].name)) {
        filter[`${allBases[i].name}`] = undefined;
      } else {
        whereFilter.$or.push({
          base: allBases[i].name,
          toModels: filter[allBases[i].name],
        });
      }
    }

    const candidates: Promotion[] = await this.promotionModel.aggregate([
      {
        $match: {
          $or: whereFilter['$or'],
        },
      },
    ]);

    if (candidates.length === 0) {
      return [];
    }

    whereFilter = { $or: [] };

    for (const cand of candidates) {
      const base = cand.base;
      const value = cand.fromModel;
      const newFilter: any = {};
      for (const key in filter) {
        if (key !== base) {
          newFilter[key] = filter[key];
        }
      }

      newFilter[base] = value;
      newFilter['promoted'] = true;

      whereFilter.$or.push(newFilter);
    }

    const allRoles: Array<Role> = await this.rolesModel.find({
      name: /^configurationModel\.[^.]+\.[^.]+\.view/,
    });

    const rolesNin = [];
    allRoles.forEach((el) => {
      if (!userRoles.includes(el.name) && !userRoles.includes('admin')) {
        let name = el.name.replace(/^configurationModel\.[^.]+\./, '');
        name = name.replace(/.view$/, '');

        let base = el.name.replace(/^configurationModel\./, '');
        base = base.replace(/\.[^.]+\.view$/, '');

        const obj: any = {};
        obj[base] = name;

        rolesNin.push(obj);
      }
    });

    const match = {
      $nor: rolesNin,
    };

    const aggregation = prepareAggregateArray(
      match.$nor.length > 0 ? match : undefined,
      { where: whereFilter },
    );

    aggregation.push({
      $sort: {
        version: 1,
      },
    });

    const all: Configuration[] =
      await this.configurationModel.aggregate(aggregation);

    return all;
  }

  /**
   * Finds variables based on user roles, search criteria, and specific conditions.
   *
   * @param {string[]} userRoles - Array of roles assigned to the user, used to filter accessible data.
   * @param {string} searchText - The text to search for within the variables, either in their values or names.
   * @param {boolean} valueOrName - A boolean indicating whether to search in the variable's value (true) or name (false).
   * @param {boolean} isRegex - A boolean indicating whether the searchText should be interpreted as a regular expression.
   * @return {Promise<{variables: any[], constantVariables: any[]}>} An object containing two arrays: `variables` with configuration variables and `constantVariables` with constant variables matching the search criteria.
   */
  async findVariable(
    userRoles: string[],
    searchText: string,
    valueOrName: boolean,
    isRegex: boolean,
  ) {
    const allBases: BaseConfiguration[] =
      await this.baseConfigurationModel.find();

    const valOrName = valueOrName === true ? 'stringVariable' : 'name';
    const cond =
      isRegex === true
        ? {
            $regexMatch: {
              input: `$$variable.${valOrName}`,
              regex: new RegExp(searchText),
              options: 'i',
            },
          }
        : { $eq: [`$$variable.${valOrName}`, `${searchText}`] };

    const groupId = {};
    const addFields = {};

    for (const base of allBases) {
      groupId[base.name] = `$${base.name}`;
      addFields[base.name] = `$_id.${base.name}`;
    }

    let matchRole = {
      $nor: [],
    };

    if (!userRoles.includes('admin')) {
      const allRoles: Array<Role> = await this.rolesModel.find({
        name: /^configurationModel\.[^.]+\.[^.]+\.view/,
      });

      const rolesNin = [];
      allRoles.forEach((el) => {
        if (!userRoles.includes(el.name)) {
          let name = el.name.replace(/^configurationModel\.[^.]+\./, '');
          name = name.replace(/.view$/, '');

          let base = el.name.replace(/^configurationModel\./, '');
          base = base.replace(/\.[^.]+\.view$/, '');

          const obj: any = {};
          obj[base] = name;

          rolesNin.push(obj);
        }
      });

      matchRole = {
        $nor: rolesNin,
      };
    }

    const filter: any[] = [
      {
        $addFields: {
          variables: {
            $map: {
              input: '$variables',
              as: 'variable',
              in: {
                $cond: {
                  if: {
                    $ne: ['$$variable.type', 'list'],
                  },
                  then: {
                    $mergeObjects: [
                      '$$variable',
                      {
                        stringVariable: {
                          $convert: {
                            input: '$$variable.value',
                            to: 'string',
                            onError: '',
                          },
                        },
                      },
                    ],
                  },
                  else: {
                    $mergeObjects: [
                      '$$variable',
                      {
                        stringVariable: {
                          $reduce: {
                            input: '$$variable.value',
                            initialValue: '',
                            in: {
                              $concat: ['$$value', ',', '$$this'],
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          __metadata: '$__metadata',
          variables: {
            $filter: {
              input: '$variables',
              as: 'variable',
              cond: cond,
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $gt: [{ $size: '$variables' }, 0],
          },
        },
      },
      {
        $addFields: addFields,
      },
    ];

    if (matchRole.$nor.length > 0) {
      filter.push({ $match: matchRole });
    }

    const configurationOut = await this.maxConfiguration
      .aggregate(filter)
      .exec();

    const constantOut = await this.maxConstantVariable.aggregate(filter);

    return {
      variables: configurationOut,
      constantVariables: constantOut,
    };
  }
}
