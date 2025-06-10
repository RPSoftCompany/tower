import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { Statement } from '../../helpers/clauses';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType } from 'mongoose';
import { Group, GroupDocument } from './groups.schema';
import { filterTranslator, MongoFilter } from '../../helpers/filterTranslator';
import { CRUDExceptionWrapper } from '../../helpers/crudHelpers';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  /**
   * Creates a new group using the provided data.
   *
   * @param {CreateGroupDto} createGroupDto - The data transfer object containing the details of the group to be created.
   * @return {Promise<Group>} A promise that resolves to the created group instance.
   */
  create(createGroupDto: CreateGroupDto) {
    return CRUDExceptionWrapper(async () => {
      return this.groupModel.create(createGroupDto);
    });
  }

  /**
   * Retrieves all groups from the data source.
   *
   * @return {Promise<Array<Group>>} A promise that resolves to an array of Group objects.
   */
  findAll(): Promise<Array<Group>> {
    return this.groupModel.find();
  }

  /**
   * Counts the number of documents in the database that match the given filter.
   *
   * @param {Statement} [filter] - An optional filter object to specify the query conditions.
   * @return {Promise<number>} - A promise that resolves to the number of matching documents.
   */
  count(filter?: Statement): Promise<number> {
    const newFilter = filterTranslator(filter);

    return this.groupModel.countDocuments(newFilter.where);
  }

  /**
   * Searches and retrieves a list of groups based on the given filter criteria.
   *
   * @param {Statement} [filter] - Optional filter object describing the conditions, fields, order, limit, and skip for the query.
   * @return {Promise<Array<Group>>} A promise that resolves to an array of groups matching the specified criteria.
   */
  find(filter?: Statement): Promise<Array<Group>> {
    const newFilter = filterTranslator(filter);

    return this.groupModel.find(
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
   * Finds documents in the groupModel collection based on the provided MongoDB filter.
   *
   * @param {MongoFilter} filter - The MongoDB filter containing query parameters such as where clauses, fields, sort order, limit, and skip values.
   * @return {Promise<Array>} A promise that resolves to an array of documents matching the filter criteria.
   */
  async findWithMongoFilter(filter: MongoFilter) {
    return this.groupModel.find(
      filter.where,
      filter.fields as ProjectionType<any>,
      {
        sort: filter.order,
        limit: filter.limit,
        skip: filter.skip,
      },
    );
  }

  /**
   * Finds a single group based on the provided filter.
   *
   * @param {Statement} [filter] - Optional filter object to specify the search criteria.
   * @return {Promise<Group>} A promise that resolves to a single group matching the filter, or null if no group is found.
   */
  findOne(filter?: Statement): Promise<Group> {
    const newFilter = filterTranslator(filter);

    return this.groupModel.findOne(
      newFilter.where,
      newFilter.fields as ProjectionType<any>,
    );
  }

  /**
   * Retrieves a group by its identifier.
   *
   * @param {string} id - The unique identifier of the group to retrieve.
   * @return {Promise<Group>} A promise that resolves with the group if found.
   */
  findById(id: string): Promise<Group> {
    return this.groupModel.findById(id);
  }

  /**
   * Removes a group entity by its unique identifier.
   *
   * @param {string} id - The unique identifier of the group to be removed.
   * @return {Promise<Object|null>} - A promise that resolves to the deleted group object if found and deleted, or null if no matching group is found.
   */
  remove(id: string) {
    return CRUDExceptionWrapper(async () => {
      return this.groupModel.findByIdAndDelete(id);
    });
  }

  /**
   * Adds a new role to a group's roles list if it does not already exist.
   *
   * @param {string} id - The unique identifier of the group.
   * @param {string} role - The role to be added to the group.
   * @return {Promise<Object|undefined>} A promise that resolves with the updated group document if found and modified, or `undefined` if the group is not found.
   */
  async addNewRole(id: string, role: string) {
    const group = await this.groupModel.findById(id);
    if (group) {
      const set = new Set(group.roles);
      set.add(role);
      group.roles = Array.from(set);

      return await group.save();
    }
  }

  /**
   * Removes a role from the specified group's list of roles.
   *
   * @param {string} id - The unique identifier of the group.
   * @param {string} role - The role to be removed from the group.
   * @return {Promise<Object|undefined>} A promise that resolves to the updated group object if found and modified, or undefined if the group does not exist.
   */
  async removeRoleFromGroup(id: string, role: string) {
    const group = await this.groupModel.findById(id);
    if (group) {
      const set = new Set(group.roles);
      set.delete(role);
      group.roles = Array.from(set);

      return await group.save();
    }
  }
}
