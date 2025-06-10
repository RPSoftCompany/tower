import { Injectable } from '@nestjs/common';
import { CreateRestConfigurationDto } from './dto/create-rest-configuration.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, Types } from 'mongoose';
import {
  RestConfiguration,
  RestConfigurationDocument,
} from './rest-configurations.schema';
import { PartialUpdateRestConfigurationDto } from './dto/partial-update-rest-configuration.dto';
import { Statement } from '../../helpers/clauses';
import { Member } from '../members/member.schema';
import { filterTranslator } from '../../helpers/filterTranslator';
import { FullUpdateRestConfigurationDto } from './dto/full-update-rest-configuration.dto';

@Injectable()
export class RestConfigurationsService {
  constructor(
    @InjectModel(RestConfiguration.name)
    private restConfigurationModel: Model<RestConfigurationDocument>,
  ) {}

  /**
   * Creates a new rest configuration record in the database.
   *
   * @param {CreateRestConfigurationDto} createRestConfigurationDto - Data transfer object containing the details for creating a new rest configuration.
   * @return {Promise<Object>} A promise that resolves to the newly created rest configuration object.
   */
  create(createRestConfigurationDto: CreateRestConfigurationDto) {
    return this.restConfigurationModel.create(createRestConfigurationDto);
  }

  /**
   * Finds and retrieves an array of RestConfiguration objects based on the provided filter criteria.
   *
   * @param {Statement} [filter] - An optional filter object used to specify query conditions, field selection, sorting, limits, and offsets.
   * @return {Promise<Array<RestConfiguration>>} A promise that resolves to an array of RestConfiguration objects matching the filter criteria.
   */
  find(filter?: Statement): Promise<Array<RestConfiguration>> {
    const newFilter = filterTranslator(filter);

    return this.restConfigurationModel.find(
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
   * Finds a member by their unique identifier.
   *
   * @param {string} id - The unique identifier of the member to find.
   * @return {Promise<Member>} A promise that resolves to the member object matching the given ID.
   */
  findById(id: string): Promise<Member> {
    return this.restConfigurationModel.findById(id);
  }

  /**
   * Partially updates an existing rest configuration document by its ID with the provided partial data.
   *
   * @param {string} id - The unique identifier of the rest configuration document to update.
   * @param {PartialUpdateRestConfigurationDto} partialUpdateRestConfigurationDto - An object containing the partial data to update the document with.
   * @return {Promise<Object>} A promise resolving to the updated document if it exists, or an empty object if the document is not found.
   */
  async partialUpdate(
    id: string,
    partialUpdateRestConfigurationDto: PartialUpdateRestConfigurationDto,
  ) {
    const existingMember = await this.restConfigurationModel.findById(id);
    if (existingMember) {
      for (const key in partialUpdateRestConfigurationDto) {
        if (key !== 'id' && partialUpdateRestConfigurationDto[key]) {
          existingMember[key] = partialUpdateRestConfigurationDto[key];
        }
      }

      return await existingMember.save();
    }

    return {};
  }

  /**
   * Updates a REST configuration by its ID with the provided configuration data.
   *
   * @param {string} id - The unique identifier of the REST configuration to update.
   * @param {FullUpdateRestConfigurationDto} fullUpdateRestConfigurationDto - The data for the update operation.
   * @return {Promise<any>} The result of the update operation.
   */
  update(
    id: string,
    fullUpdateRestConfigurationDto: FullUpdateRestConfigurationDto,
  ) {
    return this.restConfigurationModel.findByIdAndUpdate(
      id,
      fullUpdateRestConfigurationDto,
    );
  }

  /**
   * Removes a document by its unique identifier.
   *
   * @param {string} id - The unique identifier of the document to remove.
   * @return {Promise<Object|null>} A promise that resolves to the removed document if found and deleted, or null if no document matches the provided identifier.
   */
  remove(id: string) {
    return this.restConfigurationModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
    });
  }
}
