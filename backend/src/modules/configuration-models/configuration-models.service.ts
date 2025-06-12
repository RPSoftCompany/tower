import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateConfigurationModelDto } from './dto/create-configuration-model.dto';
import { UpdateConfigurationModelDto } from './dto/update-configuration-model.dto';
import { Statement } from '../../helpers/clauses';
import {
  filterTranslator,
  prepareAggregateArray,
} from '../../helpers/filterTranslator';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, Types } from 'mongoose';
import {
  ConfigurationModel,
  ConfigurationModelDocument,
} from './configuration-models.schema';
import { RolesModule } from '../roles/roles.module';
import { Role } from '../roles/roles.schema';
import {
  BaseConfiguration,
  BaseConfigurationDocument,
} from '../base-configurations/base-configurations.schema';
import { PartialUpdateConfigurationModelDto } from './dto/partial-update-configuration-model.dto';
import { HooksService } from '../hooks/hooks.service';
import { assign } from 'lodash';

@Injectable()
export class ConfigurationModelsService {
  constructor(
    @InjectModel(ConfigurationModel.name)
    private configurationModel: Model<ConfigurationModelDocument>,
    @InjectModel(RolesModule.name) private rolesModel: Model<RolesModule>,
    @InjectModel(BaseConfiguration.name)
    private baseConfigurationModel: Model<BaseConfigurationDocument>,
    private readonly hooksService: HooksService,
  ) {}

  /**
   * Creates a new configuration model based on the provided data.
   * Executes hooks before and after the creation process.
   *
   * @param {CreateConfigurationModelDto} createConfigurationModelDto - The data transfer object containing the details for creating a configuration model.
   * @return {Promise<Object>} The created configuration model object.
   * @throws {BadRequestException} If the base model specified in the data transfer object does not exist.
   */
  async create(createConfigurationModelDto: CreateConfigurationModelDto) {
    await this.hooksService.executeHook(
      'beforeCreate',
      'ConfigurationModel',
      createConfigurationModelDto,
    );

    const exists = await this.baseConfigurationModel.findOne({
      name: createConfigurationModelDto.base,
    });

    if (exists) {
      const created = await this.configurationModel.create(
        createConfigurationModelDto,
      );

      setTimeout(async () => {
        await this.hooksService.executeHook(
          'afterCreate',
          'ConfigurationModel',
          created,
        );
      }, 100);

      return created;
    } else {
      throw new BadRequestException('Invalid base model');
    }
  }

  /**
   * Finds and retrieves configuration models based on user roles and an optional filter.
   *
   * @param {string[]} userRoles - An array of user roles that determine access permissions.
   * @param {Statement} [filter] - Optional filter conditions to apply to the query.
   * @return {Promise<Array<ConfigurationModel>>} A promise that resolves to an array of configuration models.
   */
  async find(
    userRoles: string[],
    filter?: Statement,
  ): Promise<Array<ConfigurationModel>> {
    const newFilter = filterTranslator(filter);

    if (userRoles.includes('admin')) {
      return this.configurationModel.find(
        newFilter.where,
        newFilter.fields as ProjectionType<any>,
        {
          sort: newFilter.order,
          limit: newFilter.limit,
          skip: newFilter.skip,
        },
      );
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

          rolesNin.push({
            name: name,
            base: base,
          });
        }
      });

      const match = {
        $nor: rolesNin,
      };

      const aggregation = prepareAggregateArray(
        match.$nor.length > 0 ? match : undefined,
        newFilter,
      );

      if (aggregation.length > 0) {
        return this.configurationModel.aggregate(aggregation);
      } else {
        return this.configurationModel.find();
      }
    }
  }

  /**
   * Finds an entity by its unique identifier and user roles.
   *
   * @param {string[]} userRoles - An array of user roles used to filter the search criteria.
   * @param {string} id - The unique identifier of the entity to find.
   * @return {Promise<Object|null>} A promise that resolves to the found entity object if it exists, or null if no entity is found.
   */
  async findById(userRoles: string[], id: string) {
    const array = await this.find(userRoles, {
      where: {
        _id: new Types.ObjectId(id),
      },
    });

    if (array.length > 0) {
      return array[0];
    } else {
      return null;
    }
  }

  /**
   * Updates a configuration model based on the provided update data, user roles, and ID.
   * This method performs access control checks and executes hooks before and after the update operation.
   *
   * @param {string[]} userRoles - Array of roles assigned to the user performing the update.
   * @param {string} id - Unique identifier of the configuration model to be updated.
   * @param {UpdateConfigurationModelDto} updateConfigurationModelDto - Data Transfer Object containing the updated configuration details.
   * @return {Promise<ConfigurationModel>} - Returns the updated configuration model if successful, or null if the model is not found.
   * @throws {UnauthorizedException} - If the user does not have sufficient permissions to update the configuration model.
   */
  async update(
    userRoles: string[],
    id: string,
    updateConfigurationModelDto: UpdateConfigurationModelDto,
  ): Promise<ConfigurationModel> {
    await this.hooksService.executeHook(
      'beforeUpdate',
      'ConfigurationModel',
      updateConfigurationModelDto,
    );

    const candidate = await this.findById(userRoles, id);
    if (candidate) {
      const role: Array<Role> = await this.rolesModel.find({
        name: `configurationModel.${updateConfigurationModelDto.base}.${updateConfigurationModelDto.name}.modify`,
      });

      if (role.length > 0) {
        if (
          !userRoles.includes(
            `configurationModel.${updateConfigurationModelDto.base}.${updateConfigurationModelDto.name}.modify`,
          ) &&
          !userRoles.includes('admin')
        ) {
          throw new UnauthorizedException();
        }
      }

      assign(candidate, updateConfigurationModelDto);

      const updated: ConfigurationModel =
        await this.configurationModel.findByIdAndUpdate(id, candidate, {
          new: true,
        });

      await this.hooksService.executeHook(
        'afterUpdate',
        'ConfigurationModel',
        updated,
      );

      return updated;
    }

    return null;
  }

  /**
   * Partially updates a configuration model by merging the provided values into the existing entity.
   * Executes hooks before and after the update operation and enforces role-based access control.
   *
   * @param {string[]} userRoles - An array of roles assigned to the current user.
   * @param {string} id - The unique identifier of the configuration model to update.
   * @param {PartialUpdateConfigurationModelDto} updateConfigurationModelDto - The data containing partial updates to the configuration model.
   * @return {Promise<ConfigurationModel>} A promise that resolves to the updated configuration model.
   * @throws {UnauthorizedException} If the user does not have the appropriate permissions to update.
   */
  async partialUpdate(
    userRoles: string[],
    id: string,
    updateConfigurationModelDto: PartialUpdateConfigurationModelDto,
  ) {
    await this.hooksService.executeHook(
      'beforeUpdate',
      'ConfigurationModel',
      updateConfigurationModelDto,
    );

    const candidate = await this.findById(userRoles, id);

    if (candidate) {
      const role: Array<Role> = await this.rolesModel.find({
        name: `configurationModel.${candidate.base}.${candidate.name}.modify`,
      });

      if (role.length > 0) {
        if (
          !userRoles.includes(
            `configurationModel.${candidate.base}.${candidate.name}.modify`,
          ) &&
          !userRoles.includes('admin')
        ) {
          throw new UnauthorizedException();
        }
      }

      for (const key in candidate) {
        if (key !== 'id' && updateConfigurationModelDto[key]) {
          candidate[key] = updateConfigurationModelDto[key];
        }
      }

      const updated: ConfigurationModel =
        await this.configurationModel.findByIdAndUpdate(id, candidate, {
          new: true,
        });

      await this.hooksService.executeHook(
        'afterUpdate',
        'ConfigurationModel',
        updated,
      );

      return updated;
    }
  }

  /**
   * Removes a configuration and associated roles for the specified identifier.
   *
   * @param {string[]} userRoles - An array of roles associated with the user performing the operation.
   * @param {string} id - The unique identifier of the configuration to be removed.
   * @return {Promise<void>} A promise that resolves when the operation is completed.
   * @throws {UnauthorizedException} If the user does not have the required permissions to perform the operation.
   */
  async remove(userRoles: string[], id: string) {
    const candidate = await this.findById(userRoles, id);

    if (candidate) {
      const role: Array<Role> = await this.rolesModel.find({
        name: `configurationModel.${candidate.base}.${candidate.name}.modify`,
      });

      if (role.length > 0) {
        if (
          !userRoles.includes(
            `configurationModel.${candidate.base}.${candidate.name}.modify`,
          ) &&
          !userRoles.includes('admin')
        ) {
          throw new UnauthorizedException();
        }
      }

      await this.rolesModel.deleteMany({
        name: {
          $regex: RegExp(
            `constantVariable\.${candidate.base}\.${candidate.name}\.(view|modify)`,
          ),
        },
      });

      await this.rolesModel.deleteMany({
        name: `constantVariable\.${candidate.base}\.${candidate.name}\.modify`,
      });

      await this.configurationModel.findOneAndDelete({
        _id: new Types.ObjectId(id),
      });
    }
  }
}
