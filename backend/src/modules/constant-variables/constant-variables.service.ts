import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateConstantVariableDto } from './dto/create-constant-variable.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BaseConfiguration } from '../base-configurations/base-configurations.schema';
import { Model, QueryOptions, Types } from 'mongoose';
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
import { decryptPassword } from '../../helpers/encryptionHelper';
import { V1Service } from '../v1/v1.service';
import { ConnectionsService } from '../connections/connections.service';
import { MaxConstantVariable } from '../max-constant-variable/max-constant-variable.schema';
import { MaxConstantVariableModule } from '../max-constant-variable/max-constant-variable.module';
import { maxConfiguration } from '../max-configuration/max-configuration.schema';
import { MaxConfigurationModule } from '../max-configuration/max-configuration.module';
import { isNil } from '@nestjs/common/utils/shared.utils';

@Injectable()
export class ConstantVariablesService {
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
   * create
   *
   * @param userRoles
   * @param userId
   * @param createConstantVariableDto
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
   * remove (for testing purposes only)
   *
   * @param id
   */
  async remove(id: string) {
    await this.constantVariableModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
    });
  }

  /**
   * find
   *
   * @param userRoles
   * @param filter
   */
  async find(
    userRoles: string[],
    filter?: Statement,
  ): Promise<Array<ConstantVariable>> {
    const newFilter = filterTranslator(filter);

    if (userRoles.includes('admin')) {
      return this.constantVariableModel
        .find(newFilter.where, newFilter.fields, {
          sort: newFilter.order,
          limit: newFilter.limit,
          skip: newFilter.skip,
        })
        .populate('createdBy', 'username');
    } else {
      const match = await this.getRolesMatch(userRoles);

      const aggregation = prepareAggregateArray(
        match.$nor.length > 0 ? match : undefined,
        newFilter,
      );

      if (aggregation.length === 0) {
        return await this.constantVariableModel
          .find()
          .populate('createdBy', 'username')
          .exec();
      } else {
        const all: Configuration[] = await this.constantVariableModel
          .aggregate(aggregation)
          .exec();

        return await this.constantVariableModel.populate(all, {
          path: 'createdBy',
          select: 'username',
        });
      }
    }
  }

  /**
   * findById
   *
   * @param userRoles
   * @param id
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
   * findForDate
   *
   * @param userRoles
   * @param filter
   * @param date
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
   * getRolesMatch
   *
   * @private
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
   * onConstantVariablesChange
   *
   * @param userRoles
   * @param currentConstantVariables
   * @param previousConstantVariables
   * @param bases
   * @param allBases
   * @private
   */
  private async onConstantVariablesChange(
    userRoles: string[],
    currentConstantVariables: ConstantVariable,
    previousConstantVariables: ConstantVariable,
    bases: BaseModelStatement,
    allBases: BaseConfiguration[],
  ) {
    // Find differences
    const diff: Array<string> = [];
    let forceAll = false;

    if (
      previousConstantVariables.variables.length >
      currentConstantVariables.variables.length
    ) {
      for (const variable of previousConstantVariables.variables) {
        const found = currentConstantVariables.variables.some((el) => {
          return el.name === variable.name;
        });

        if (!found) {
          if (variable.addIfAbsent) {
            forceAll = true;
            break;
          }
          diff.push(variable.name);
        }
      }
    }

    if (!forceAll) {
      for (const variable of currentConstantVariables.variables) {
        const found = previousConstantVariables.variables.find((el) => {
          return el.name === variable.name;
        });

        if (found) {
          if (found.addIfAbsent !== variable.addIfAbsent) {
            forceAll = true;
            break;
          }

          const foundValue =
            found.type === 'password'
              ? decryptPassword(found.value)
              : found.value;

          if (
            found.forced !== variable.forced ||
            found.type !== variable.type ||
            foundValue !== variable.value
          ) {
            if (!variable.addIfAbsent) {
              forceAll = true;
              break;
            }
            diff.push(variable.name);
          }
        } else {
          diff.push(variable.name);
        }
      }
    }

    // Find all configurations
    for (const key in bases) {
      if (!bases[key]) {
        bases[key] = undefined;
        delete bases[key];
      }
    }

    const query: any = bases;

    if (!forceAll && diff.length > 0) {
      query['variables.name'] = {
        $in: diff,
      };
    }

    const all: Configuration[] = await this.maxConfigurationModel.find({
      query,
    });

    for (const configuration of all) {
      this.hooksService
        .executeHook('afterCreate', 'Configuration', configuration)
        .then(() => {
          // IGNORE
        });

      // SCP
      const bases: any = {};
      for (const base of allBases) {
        bases[base.name] = configuration[base.name];
      }

      const newConfig = await this.v1Service.incorporateConstantVariables(
        userRoles,
        allBases,
        configuration,
        new Date(),
      );

      this.connectionsService
        .executeSCPHook(userRoles, bases, newConfig)
        .then(() => {
          // IGNORE
        });
    }
  }

  /**
   * findLatest
   *
   * @param userRoles
   * @param filter
   */
  async findLatest(userRoles: string[], filter?: Statement) {
    const newFilter = filterTranslator(filter);

    if (userRoles.includes('admin')) {
      return this.maxConstantVariable
        .find(newFilter.where)
        .populate('createdBy', 'username');
    } else {
      const match = await this.getRolesMatch(userRoles);

      const aggregation = prepareAggregateArray(
        match.$nor.length > 0 ? match : undefined,
        newFilter,
      );

      if (aggregation.length === 0) {
        return await this.maxConstantVariable
          .find()
          .populate('createdBy', 'username')
          .exec();
      } else {
        const all: Array<MaxConstantVariable> = await this.maxConstantVariable
          .aggregate(aggregation)
          .exec();

        return await this.maxConstantVariable.populate(all, {
          path: 'createdBy',
          select: 'username',
        });
      }
    }
  }
}
