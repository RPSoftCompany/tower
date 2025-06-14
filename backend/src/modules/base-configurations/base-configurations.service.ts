import { CreateBaseConfigurationDto } from './dto/create-base-configuration.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, Types } from 'mongoose';
import {
  BaseConfiguration,
  BaseConfigurationDocument,
} from './base-configurations.schema';
import { UpdatePartialBaseConfigurationDto } from './dto/update-partial-base-configuration.dto';
import { UpdateFullBaseConfigurationDto } from './dto/update-full-base-configuration.dto';
import { Statement } from '../../helpers/clauses';
import { filterTranslator } from '../../helpers/filterTranslator';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigurationsService } from '../configurations/configurations.service';

@Injectable()
export class BaseConfigurationsService {
  constructor(
    @InjectModel(BaseConfiguration.name)
    private baseConfigurationModel: Model<BaseConfigurationDocument>,
    @Inject(forwardRef(() => ConfigurationsService))
    private readonly configurationsService: ConfigurationsService,
  ) {}

  /**
   * Creates a new base configuration record in the database.
   *
   * @param {CreateBaseConfigurationDto} createBaseConfigurationDto - The data transfer object containing the details of the configuration to be created.
   * @return {Promise<Object>} A promise that resolves to the created base configuration object.
   */
  async create(createBaseConfigurationDto: CreateBaseConfigurationDto) {
    const created = await this.baseConfigurationModel.create(
      createBaseConfigurationDto,
    );

    setTimeout(() => {
      this.configurationsService.createIndexes();
    }, 100);

    return created;
  }

  /**
   * Finds and retrieves an array of BaseConfiguration objects based on the provided filter criteria.
   *
   * @param {Statement} [filter] - An optional filter object used to query the BaseConfiguration model.
   *                               It can contain conditions, fields, order, limit, and skip.
   * @return {Promise<Array<BaseConfiguration>>} - A promise that resolves to an array of BaseConfiguration objects
   *                                                matching the provided filter criteria.
   */
  find(filter?: Statement): Promise<Array<BaseConfiguration>> {
    const newFilter = filterTranslator(filter);

    return this.baseConfigurationModel.find(
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
   * Counts the number of documents that satisfy the given filter criteria.
   *
   * @param {Statement} [filter] - Optional filter object to specify query conditions.
   * @return {Promise<number>} A promise that resolves to the number of matching documents.
   */
  count(filter?: Statement): Promise<number> {
    const newFilter = filterTranslator(filter);

    return this.baseConfigurationModel.countDocuments(newFilter.where);
  }

  /**
   * Retrieves all records from the base configuration model.
   *
   * @return {Promise<Array<Object>>} A promise that resolves to an array of objects representing all records.
   */
  findAll() {
    return this.baseConfigurationModel.find();
  }

  /**
   * Retrieves a BaseConfiguration object by its unique identifier.
   *
   * @param {string} id - The unique identifier of the BaseConfiguration to retrieve.
   * @return {Promise<BaseConfiguration>} A promise that resolves to the BaseConfiguration object if found, otherwise resolves to null or rejects with an error.
   */
  findById(id: string): Promise<BaseConfiguration> {
    return this.baseConfigurationModel.findById(id);
  }

  /**
   * Updates a partial set of fields in an existing base configuration record.
   * Specifically updates only the fields provided in the updatePartialBaseConfigurationDto,
   * ignoring the "_id" field.
   *
   * @param {string} id - The unique identifier of the base configuration to be updated.
   * @param {UpdatePartialBaseConfigurationDto} updatePartialBaseConfigurationDto - An object containing only the fields to be updated in the existing base configuration.
   * @return {Promise<Object>} A promise that resolves to the updated configuration object after the changes have been saved, or undefined if the record does not exist.
   */
  async updatePartial(
    id: string,
    updatePartialBaseConfigurationDto: UpdatePartialBaseConfigurationDto,
  ) {
    const existingMember = await this.baseConfigurationModel.findById(id);
    if (existingMember) {
      for (const key in updatePartialBaseConfigurationDto) {
        if (key !== '_id') {
          existingMember[key] = updatePartialBaseConfigurationDto[key];
        }
      }

      return await existingMember.save();
    }
  }

  /**
   * Updates a base configuration document in the database.
   *
   * @param {string} id - The unique identifier of the base configuration to be updated.
   * @param {UpdateFullBaseConfigurationDto} updateBaseConfigurationDto - The data transfer object containing updated properties.
   * @return {Promise<Object|null>} The updated base configuration document if successful, or null if not found.
   */
  async update(
    id: string,
    updateBaseConfigurationDto: UpdateFullBaseConfigurationDto,
  ) {
    return this.baseConfigurationModel.findByIdAndUpdate(
      id,
      updateBaseConfigurationDto,
      { new: true },
    );
  }

  /**
   * Removes a base configuration and its related index by the given ID.
   *
   * @param {string} id - The unique identifier of the base configuration to be removed.
   * @return {Promise<void>} A promise that resolves when the removal process is complete.
   */
  async remove(id: string) {
    const baseConfiguration: BaseConfiguration =
      await this.baseConfigurationModel.findById(id);

    await this.baseConfigurationModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
    });

    setTimeout(async () => {
      await this.configurationsService.removeIndex(baseConfiguration.name);
    }, 100);
  }
}
