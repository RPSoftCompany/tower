import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateConstantVariableDto } from './dto/create-constant-variable.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BaseConfiguration } from '../base-configurations/base-configurations.schema';
import { Model, ProjectionType, Types } from 'mongoose';
import { BaseConfigurationsModule } from '../base-configurations/base-configurations.module';
import { ConfigurationModel } from '../configuration-models/configuration-models.schema';
import { ConfigurationModelsModule } from '../configuration-models/configuration-models.module';
import { Role } from '../roles/roles.schema';
import { RolesModule } from '../roles/roles.module';
import {
  ConstantVariable,
  ConstantVariableDocument,
  ConstantVariableObject,
} from './constant-variables.schema';
import { BaseModelStatement, Statement } from '../../helpers/clauses';
import { Configuration } from '../configurations/configuration.schema';
import {
  filterTranslator,
  prepareAggregateArray,
} from '../../helpers/filterTranslator';
import { HooksService } from '../hooks/hooks.service';
import { ConfigurationsModule } from '../configurations/configurations.module';
import { V1Service } from '../v1/v1.service';
import { ConnectionsService } from '../connections/connections.service';
import { MaxConstantVariable } from '../max-constant-variable/max-constant-variable.schema';
import { MaxConstantVariableModule } from '../max-constant-variable/max-constant-variable.module';
import { maxConfiguration } from '../max-configuration/max-configuration.schema';
import { MaxConfigurationModule } from '../max-configuration/max-configuration.module';

@Injectable()
export class ConstantVariablesService implements OnModuleInit {
  private readonly logger = new Logger(ConstantVariablesService.name);

  constructor(
    @InjectModel(ConstantVariable.name)
    private constantVariableModel: Model<ConstantVariableDocument>,
    @InjectModel(BaseConfiguration.name)
    private baseConfigurationModel: Model<BaseConfigurationsModule>,
    @InjectModel(Role.name) private rolesModel: Model<RolesModule>,
    @InjectModel(ConfigurationModel.name)
    private configurationModelModel: Model<ConfigurationModelsModule>,
    @InjectModel(Configuration.name)
    private configurationModel: Model<ConfigurationsModule>,
    @InjectModel(MaxConstantVariable.name)
    private maxConstantVariable: Model<MaxConstantVariableModule>,
    @InjectModel(maxConfiguration.name)
    private maxConfigurationModel: Model<MaxConfigurationModule>,
    @Inject(forwardRef(() => V1Service))
    private readonly v1Service: V1Service,
    @Inject(forwardRef(() => ConnectionsService))
    private readonly connectionsService: ConnectionsService,
    private readonly hooksService: HooksService,
  ) {}

  /**
   * Generates a random string based on the specified length and character set.
   *
   * @param {number} length - The desired length of the random string.
   * @param {string} chars - A string containing characters to define the character set.
   *                         Use 'a' for lowercase letters, 'A' for uppercase letters,
   *                         '#' for digits, and '!' for special characters.
   * @return {string} A randomly generated string of the specified length using the given character set.
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

  /**
   * Initializes the module by performing setup processes such as checking,
   * aggregating, and creating/updating the 'maxConstantVariable' collection.
   * If the collection already exists and contains data, no further actions are taken.
   * Otherwise, the method performs calculations and inserts aggregated data.
   *
   * @return {Promise<void>} Resolves when the initialization process completes successfully.
   */
  async onModuleInit() {
    const collections = await this.constantVariableModel.db.listCollections();
    let exists = collections.some((collection) => {
      return collection.name === 'maxConstantVariable';
    });

    if (exists) {
      const count = await this.maxConstantVariable.countDocuments();
      if (count === 0) {
        exists = false;
      }
    }

    if (exists) {
      return;
    }

    const allBases: BaseConfiguration[] =
      await this.baseConfigurationModel.find();

    const groupId = {};
    const lookupLet = {
      maxVersion: '$maxVersion',
    };
    const lookupExp = [
      {
        $eq: ['$effectiveDate', '$$maxVersion'],
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

    const aggregation = [
      {
        $group: {
          _id: groupId,
          maxVersion: {
            $max: '$effectiveDate',
          },
        },
      },
      {
        $lookup: {
          from: 'constantVariable',
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
          coll: 'maxConstantVariable',
        },
      },
    ];

    await this.constantVariableModel.aggregate(aggregation).exec();

    await this.constantVariableModel.updateMany({ __metadata: null }, [
      {
        $set: {
          __metadata: groupId,
        },
      },
    ]);
  }

  /**
   * Creates a new constant variable based on the provided data and performs required validations and hooks.
   *
   * @param {string[]} userRoles - Array of roles assigned to the user.
   * @param {string} userId - The ID of the user making the request.
   * @param {CreateConstantVariableDto} createConstantVariableDto - Data Transfer Object containing the information to create a constant variable.
   * @return {Promise<ConstantVariable>} A promise that resolves to the newly created constant variable.
   * @throws {UnauthorizedException} If the user lacks appropriate permissions to create or modify the constant variable.
   * @throws {BadRequestException} If the validation of the provided configuration fails or no base models are used.
   */
  async create(
    userRoles: string[],
    userId: string,
    createConstantVariableDto: CreateConstantVariableDto,
  ) {
    await this.hooksService.executeHook(
      'beforeCreate',
      'ConstantVariable',
      createConstantVariableDto,
    );

    const allRoles: Array<Role> = await this.rolesModel.find({
      name: /^(configurationModel|constantVariable)\.[^.]+\.[^.]+\.(view|modify)/,
    });

    const allRolesString = [];
    allRoles.forEach((role) => {
      allRolesString.push(role.name);
    });

    const allBases: Array<BaseConfiguration> =
      await this.baseConfigurationModel.find();

    const newConfigurationObject: CreateConstantVariableDto = {
      variables: createConstantVariableDto.variables,
    };

    let numberOfModelsUsed = 0;
    const changeFilter: any = {};

    const __metadata = {};

    for (const base of allBases) {
      if (createConstantVariableDto[base.name]) {
        __metadata[base.name] = `${createConstantVariableDto[base.name]}`;

        const modelExists: ConfigurationModel =
          await this.configurationModelModel.findOne({
            base: `${base.name}`,
            name: `${createConstantVariableDto[base.name]}`,
          });

        changeFilter[`__metadata.${base.name}`] = createConstantVariableDto[
          base.name
        ]
          ? createConstantVariableDto[base.name]
          : null;

        if (modelExists) {
          // Validate roles
          let currentRole = `configurationModel.${base.name}.${
            createConstantVariableDto[base.name]
          }`;
          if (allRolesString.includes(`${currentRole}.view`)) {
            if (
              !userRoles.includes('admin') &&
              !userRoles.includes(`${currentRole}.view`)
            ) {
              throw new UnauthorizedException();
            }
          }

          currentRole = `constantVariable.${base.name}.${
            createConstantVariableDto[base.name]
          }`;
          if (allRolesString.includes(`${currentRole}.modify`)) {
            if (
              !userRoles.includes('admin') &&
              !userRoles.includes(`${currentRole}.modify`)
            ) {
              throw new UnauthorizedException();
            }
          }

          let validationOk = false;

          // Validate restrictions
          if (modelExists.restrictions.length > 0) {
            for (const restriction of modelExists.restrictions) {
              let isOk = true;
              for (const key in restriction) {
                if (key !== '__id' && restriction[key]) {
                  if (restriction[key] !== createConstantVariableDto[key]) {
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
              `Constant variable validation failed. Provided configuration violates ${
                createConstantVariableDto[base.name]
              } restrictions`,
            );
          }

          numberOfModelsUsed++;
          newConfigurationObject[base.name] =
            createConstantVariableDto[base.name];
        } else {
          throw new BadRequestException(
            `Invalid base model name: ${base.name}: ${
              createConstantVariableDto[base.name]
            }`,
          );
        }
      } else {
        changeFilter[`__metadata.${base.name}`] = null;
      }
    }

    if (numberOfModelsUsed === 0) {
      throw new BadRequestException('At least one base model has to be used');
    }

    const previousVariables: MaxConstantVariable =
      await this.maxConstantVariable.findOne(changeFilter);

    let version = 1;
    if (previousVariables !== null) {
      version = previousVariables.version + 1;
    }

    createConstantVariableDto.createdBy = userId;
    createConstantVariableDto.version = version;
    createConstantVariableDto.__metadata = __metadata;

    const created: ConstantVariable = await this.constantVariableModel.create(
      createConstantVariableDto,
    );

    await this.maxConstantVariable.updateOne(
      changeFilter,
      { $set: createConstantVariableDto },
      { upsert: true },
    );

    setTimeout(async () => {
      await this.hooksService.executeHook(
        'afterCreate',
        'ConstantVariable',
        created,
      );

      if (previousVariables === null) {
        return;
      } else {
        await this.onConstantVariablesChange(
          userRoles,
          created,
          previousVariables,
          changeFilter,
          allBases,
        );
      }
    }, 100);

    return created;
  }

  /**
   * Removes a document from the database based on the provided identifier.
   *
   * @param {string} id - The unique identifier of the document to be removed.
   * @return {Promise<void>} A promise that resolves when the document is successfully removed.
   */
  async remove(id: string) {
    await this.constantVariableModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
    });
  }

  /**
   * Retrieves a list of ConstantVariable objects based on the provided user roles and filter criteria.
   *
   * @param {string[]} userRoles - Array of roles assigned to the user. Determines access privileges.
   * @param {Statement} [filter] - Optional filter criteria to narrow down the search results.
   * @return {Promise<Array<ConstantVariable>>} A promise that resolves to an array of ConstantVariable objects.
   */
  async find(
    userRoles: string[],
    filter?: Statement,
  ): Promise<Array<ConstantVariable>> {
    const newFilter = filterTranslator(filter);

    if (userRoles.includes('admin')) {
      return this.constantVariableModel
        .find(newFilter.where, newFilter.fields as ProjectionType<any>, {
          sort: newFilter.order,
          limit: newFilter.limit,
          skip: newFilter.skip,
        })
        .populate('createdBy', ['username', 'type', 'display']);
    } else {
      const match = await this.getRolesMatch(userRoles);

      const aggregation = prepareAggregateArray(
        match.$nor.length > 0 ? match : undefined,
        newFilter,
      );

      if (aggregation.length === 0) {
        return await this.constantVariableModel
          .find()
          .populate('createdBy', ['username', 'type', 'display'])
          .exec();
      } else {
        const all: Configuration[] = await this.constantVariableModel
          .aggregate(aggregation)
          .exec();

        return await this.constantVariableModel.populate(all, {
          path: 'createdBy',
          select: ['username', 'type', 'display'],
        });
      }
    }
  }

  /**
   * Retrieves a specific record by its unique identifier if it matches the provided user roles.
   *
   * @param {string[]} userRoles - The roles associated with the user that will be used to filter the data.
   * @param {string} id - The unique identifier of the record to retrieve.
   * @return {Promise<ConstantVariable>} The matching record if found, otherwise null.
   */
  async findById(userRoles: string[], id: string): Promise<ConstantVariable> {
    const value = await this.find(userRoles, {
      where: {
        _id: new Types.ObjectId(id),
      },
    });

    if (value.length > 0) {
      return value[0];
    } else {
      return null;
    }
  }

  /**
   * Fetches constant variables based on the provided user roles, filters, and date criteria,
   * returning the matched data either as the latest or full dataset.
   *
   * @param {string[]} userRoles - Array of user roles to determine role-based access.
   * @param {BaseModelStatement} filter - Filter object to specify the base conditions of the query.
   * @param {Date} date - The date to query up to, filtering by effective date.
   * @param {boolean} [latest] - Optional flag to indicate whether to return only the latest records.
   * @return {Promise<Array<ConstantVariableObject>>} A promise resolving to an array of matched constant variable objects.
   */
  async findByDate(
    userRoles: string[],
    filter: BaseModelStatement,
    date: Date,
    latest?: boolean,
  ) {
    latest = latest !== undefined;
    const allBases: BaseConfiguration[] =
      await this.baseConfigurationModel.find({}, undefined, {
        sort: { sequenceNumber: 1 },
      });

    let queryFilter = [];

    // Validate filter
    const filterKeys = Object.keys(filter);

    for (let i = 0; i < allBases.length; i++) {
      if (!filterKeys.includes(allBases[i].name)) {
        filter[`${allBases[i].name}`] = undefined;
      }
    }

    // add roles
    const rolesMatch = await this.getRolesMatch(userRoles);

    const newFilter: any = {};

    const newWhere: BaseModelStatement[] = [];

    for (let i = 0; i < allBases.length; i++) {
      const obj: BaseModelStatement = {};

      for (let j = 0; j < allBases.length; j++) {
        const baseName = allBases[j].name;

        if (i >= j) {
          obj[baseName] = filter[baseName] ? filter[baseName] : null;
        } else {
          obj[baseName] = null;
        }
      }

      newWhere.push(obj);
    }

    newFilter.where = { $or: newWhere };

    const aggregation = prepareAggregateArray(
      rolesMatch.$nor.length > 0 ? rolesMatch : undefined,
      newFilter,
    );

    queryFilter = [...aggregation];

    queryFilter.push({
      $sort: {
        effectiveDate: -1,
      },
    });

    const match = [];

    for (let i = 0; i < allBases.length - 1; i++) {
      const __filter: any = {};
      if (date) {
        __filter.effectiveDate = { $lte: new Date(date) };
      }
      for (const base of allBases) {
        __filter[`__metadata.${base.name}`] = null;
      }
      match.push(__filter);
      for (let j = 0; j < i + 1; j++) {
        match[i][`__metadata.${allBases[j].name}`] = filter[allBases[j].name];
      }
    }

    const __matchFilter = [];
    for (const row of match) {
      __matchFilter.push({ $and: [row] });
    }

    if (__matchFilter.length > 0) {
      queryFilter.push({
        $match: {
          $or: __matchFilter,
        },
      });
    }

    const __partitionBy = {};
    for (const base of allBases) {
      __partitionBy[base.name] = `$${base.name}`;
    }

    queryFilter.push({
      $setWindowFields: {
        partitionBy: __partitionBy,
        output: {
          maxDate: {
            $max: '$effectiveDate',
            window: {
              documents: ['unbounded', 'unbounded'],
            },
          },
        },
      },
    });

    const __projectFilter: any = {};
    Object.assign(__projectFilter, __partitionBy);
    __projectFilter.variables = 1;
    __projectFilter.show = { $eq: ['$effectiveDate', '$maxDate'] };
    __projectFilter.effectiveDate = 1;

    queryFilter.push({ $project: __projectFilter });
    queryFilter.push({ $match: { show: true } });

    let output: ConstantVariable[] = [];

    if (latest) {
      output = await this.maxConstantVariable.aggregate(queryFilter).exec();
    } else {
      output = await this.constantVariableModel.aggregate(queryFilter).exec();
    }

    const currentSequence: BaseModelStatement = {};
    for (const base of allBases) {
      currentSequence[base.name] = undefined;
    }

    const allContVariables: Array<ConstantVariableObject> = [];

    for (const base of allBases) {
      currentSequence[base.name] = filter[base.name];

      const found = output.find((el) => {
        for (const validFilter in currentSequence) {
          if (el[validFilter] !== currentSequence[validFilter]) {
            return false;
          }
        }

        return true;
      });

      if (found) {
        for (const variable of found.variables) {
          const index = allContVariables.findIndex((el) => {
            return el.name === variable.name;
          });

          if (index >= 0) {
            const old = allContVariables[index];
            if (!old.forced) {
              allContVariables[index] = variable;
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              for (const key in currentSequence) {
                allContVariables[index].sourceBase = base.name;
                allContVariables[index].sourceModel =
                  currentSequence[base.name];
              }
            }
          } else {
            variable.sourceBase = base.name;
            variable.sourceModel = currentSequence[base.name];
            allContVariables.push(variable);
          }
        }
      }
    }

    return allContVariables;
  }

  /**
   * Generates a query condition based on the roles provided by the user.
   *
   * @param {string[]} userRoles - An array of role names associated with the user.
   * @return {Promise<{ $nor: Object[] }>} A promise that resolves to a query object containing a `$nor` condition with roles to exclude.
   */
  private async getRolesMatch(userRoles: string[]) {
    if (userRoles.includes('admin')) {
      return {
        $nor: [],
      };
    }

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

    return {
      $nor: rolesNin,
    };
  }

  /**
   * Handles changes in constant variables by updating configurations, executing hooks,
   * and managing connections. This method performs operations such as querying configurations,
   * incorporating updates, and executing specific service hooks.
   *
   * @param {string[]} userRoles An array of user roles used for authorization and scoping actions.
   * @param {ConstantVariable} currentConstantVariables The current state of constant variables.
   * @param {ConstantVariable} previousConstantVariables The previous state of constant variables before the change.
   * @param {BaseModelStatement} bases Base model statement object used to filter configurations.
   * @param {BaseConfiguration[]} allBases A collection of base configurations affecting the behavior of the method.
   * @return {Promise<void>} A promise that resolves when all operations have been successfully executed.
   */
  private async onConstantVariablesChange(
    userRoles: string[],
    currentConstantVariables: ConstantVariable,
    previousConstantVariables: ConstantVariable,
    bases: BaseModelStatement,
    allBases: BaseConfiguration[],
  ) {
    // Find all configurations
    for (const key in bases) {
      if (!bases[key]) {
        bases[key] = null;
        delete bases[key];
      }
    }

    const query: any = bases;

    const all: Configuration[] = await this.maxConfigurationModel.find(query);

    for (const configuration of all) {
      this.hooksService
        .executeHook('afterCreate', 'Configuration', configuration)
        .then(() => {
          // IGNORE
        })
        .catch((e) => {
          this.logger.error(e);
        });

      // SCP
      const bases: any = {};
      for (const base of allBases) {
        bases[base.name] = configuration[base.name];
      }

      const newConfig = await this.v1Service.incorporateAll(
        userRoles,
        allBases,
        configuration,
      );

      // Kubernetes
      this.connectionsService
        .executeSCPHook(userRoles, bases, newConfig)
        .then(() => {
          // IGNORE
        })
        .catch((e) => {
          // IGNORE
        });

      this.connectionsService
        .executeKubernetesHook(bases, newConfig)
        .then(() => {
          // IGNORE
        })
        .catch((e) => {
          // IGNORE
        });
    }
  }

  /**
   * Finds and retrieves the latest filtered records based on user roles and an optional filter condition.
   *
   * @param {string[]} userRoles - An array of user roles to determine access and filtering rules.
   * @param {Statement} [filter] - An optional filter condition used to narrow down the data retrieval.
   * @return {Promise<Array>} A promise that resolves to an array of records, populated with the 'createdBy' field.
   */
  async findLatest(userRoles: string[], filter?: Statement) {
    const newFilter = filterTranslator(filter);

    if (userRoles.includes('admin')) {
      return this.maxConstantVariable
        .find(newFilter.where)
        .populate('createdBy', ['username', 'type', 'display']);
    } else {
      const match = await this.getRolesMatch(userRoles);

      const aggregation = prepareAggregateArray(
        match.$nor.length > 0 ? match : undefined,
        newFilter,
      );

      if (aggregation.length === 0) {
        return await this.maxConstantVariable
          .find()
          .populate('createdBy', ['username', 'type', 'display'])
          .exec();
      } else {
        const all: Array<MaxConstantVariable> = await this.maxConstantVariable
          .aggregate(aggregation)
          .exec();

        return await this.maxConstantVariable.populate(all, {
          path: 'createdBy',
          select: ['username', 'type', 'display'],
        });
      }
    }
  }
}
