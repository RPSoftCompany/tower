import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { Statement } from '../../helpers/clauses';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './groups.schema';
import { filterTranslator, MongoFilter } from '../../helpers/filterTranslator';
import { CRUDExceptionWrapper } from '../../helpers/crudHelpers';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  /**
   * create
   *
   * @param createGroupDto
   */
  create(createGroupDto: CreateGroupDto) {
    return CRUDExceptionWrapper(async () => {
      return this.groupModel.create(createGroupDto);
    });
  }

  /**
   * findAll
   */
  findAll(): Promise<Array<Group>> {
    return this.groupModel.find();
  }

  /**
   * count
   *
   * @param filter
   */
  count(filter?: Statement): Promise<number> {
    const newFilter = filterTranslator(filter);

    return this.groupModel.count(newFilter.where);
  }

  /**
   * find
   *
   * @param filter
   */
  find(filter?: Statement): Promise<Array<Group>> {
    const newFilter = filterTranslator(filter);

    return this.groupModel.find(newFilter.where, newFilter.fields, {
      sort: newFilter.order,
      limit: newFilter.limit,
      skip: newFilter.skip,
    });
  }

  /**
   * findWithMongoFilter
   *
   * @param filter
   */
  async findWithMongoFilter(filter: MongoFilter) {
    return this.groupModel.find(filter.where, filter.fields, {
      sort: filter.order,
      limit: filter.limit,
      skip: filter.skip,
    });
  }

  /**
   * findOne
   *
   * @param filter
   */
  findOne(filter?: Statement): Promise<Group> {
    const newFilter = filterTranslator(filter);

    return this.groupModel.findOne(newFilter.where, newFilter.fields);
  }

  /**
   * findById
   *
   * @param id
   */
  findById(id: string): Promise<Group> {
    return this.groupModel.findById(id);
  }

  /**
   * remove
   *
   * @param id
   */
  remove(id: string) {
    return CRUDExceptionWrapper(async () => {
      return this.groupModel.findByIdAndDelete(id);
    });
  }

  /**
   * addNewRole
   *
   * @param id
   * @param role
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
   * removeRoleFromGroup
   *
   * @param id
   * @param role
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
