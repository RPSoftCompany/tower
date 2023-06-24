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
import { Model, Types } from 'mongoose';
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
import { ConstantVariable } from '../constant-variables/constant-variables.schema';
import { ConstantVariablesModule } from '../constant-variables/constant-variables.module';
import { HooksService } from '../hooks/hooks.service';
import { ConnectionsService } from '../connections/connections.service';
import { V1Service } from '../v1/v1.service';

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
    @InjectModel(ConstantVariable.name)
    private constantVariablesModel: Model<ConstantVariablesModule>,
    @Inject(HooksService)
    private readonly hooksService: HooksService,
    @Inject(forwardRef(() => ConnectionsService))
    private readonly connectionsService: ConnectionsService,
    @Inject(forwardRef(() => V1Service))
    private readonly v1Service: V1Service,
  ) {}

  /**
   * onModuleInit
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

    await this.createIndexes();
  }

  /**
   * createIndexes
   */
  async createIndexes() {
    const allBases: BaseConfiguration[] =
      await this.baseConfigurationModel.find();

    const fullIndex: any = {};

    for (const base of allBases) {
      const index: any = {};
      index[base.name] = 1;
      fullIndex[base.name] = 1;
      await this.configurationModel.schema.index(index);
    }

    if (allBases.length > 0) {
      await this.configurationModel.schema.index(fullIndex);
    }

    await this.configurationModel.syncIndexes();
  }

  /**
   * removeIndex
   *
   * @param name
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
   * getInitialized
   */
  async getInitialized(): Promise<V1> {
    return this.v1Model.findOne();
  }

  /**
   * initialize
   *
   * @param createV1Dto
   */
  async initialize(createV1Dto: CreateV1Dto) {
    const initialized = await this.getInitialized();
    if (!initialized) {
      return this.v1Model.create(createV1Dto);
    }
  }

  /**
   * create - creates new configuration
   *
   * @param createConfigurationDto
   * @param userRoles
   * @param userId
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

    const queryObject = {};

    for (const base of allBases) {
      if (createConfigurationDto[base.name]) {
        const modelExists: ConfigurationModel =
          await this.configurationModelModel.findOne({
            base: `${base.name}`,
            name: `${createConfigurationDto[base.name]}`,
          });

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

    const retValue: Configuration = await this.configurationModel.create(
      newConfigurationObject,
    );

    setTimeout(() => {
      this.hooksService
        .executeHook('afterCreate', 'Configuration', retValue)
        .then(() => {
          // IGNORE
        });

      this.connectionsService
        .executeSCPHook(userRoles, queryObject, retValue)
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
   * find
   *
   * @param userRoles
   * @param filter
   * @param populate
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
        newFilter.fields,
        {
          sort: newFilter.order,
          limit: newFilter.limit,
          skip: newFilter.skip,
        },
      );

      if (populate) {
        return all.populate('createdBy', 'username');
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
            .populate('createdBy', 'username')
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
            select: 'username',
          });
        } else {
          return all;
        }
      }
    }
  }

  /**
   * findById
   *
   * @param userRoles
   * @param id
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
   * remove (for test purposes only)
   *
   * @param id
   */
  async remove(id: string) {
    return this.configurationModel.findByIdAndRemove(id);
  }

  /**
   * findByDate
   *
   * @param userRoles
   * @param filter
   * @param date
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
   * findPromotionCandidates
   *
   * @param filter
   * @param userRoles
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
        throw new BadRequestException(
          `Invalid model filter, it lacks of ${allBases[i].name} model`,
        );
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

    const all: Configuration[] = await this.configurationModel.aggregate(
      aggregation,
    );

    return all;
  }

  /**
   * findVariable
   *
   * @param userRoles
   * @param searchText
   * @param valueOrName
   * @param isRegex
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
        $sort: {
          version: -1,
        },
      },
      {
        $group: {
          _id: groupId,
          maxVersion: {
            $max: '$version',
          },
          variables: {
            $first: '$variables',
          },
        },
      },
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

    const configurationOut = await this.configurationModel.aggregate(filter, {
      allowDiskUse: true,
    });

    filter[0] = {
      $sort: {
        effectiveDate: -1,
      },
    };
    filter[1] = {
      $group: {
        _id: groupId,
        maxVersion: {
          $max: '$effectiveDate',
        },
        variables: {
          $first: '$variables',
        },
      },
    };

    const constantOut = await this.constantVariablesModel.aggregate(filter, {
      allowDiskUse: true,
    });

    return {
      variables: configurationOut,
      constantVariables: constantOut,
    };
  }
}
