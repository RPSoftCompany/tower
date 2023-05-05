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
  create(createGroupDto: CreateGroupDto) {
    return CRUDExceptionWrapper(async () => {
      return this.groupModel.create(createGroupDto);
    });
  }

  findAll(): Promise<Array<Group>> {
    return this.groupModel.find();
  }

  count(filter?: Statement): Promise<number> {
    const newFilter = filterTranslator(filter);

    return this.groupModel.count(newFilter.where);
  }

  find(filter?: Statement): Promise<Array<Group>> {
    const newFilter = filterTranslator(filter);

    return this.groupModel.find(newFilter.where, newFilter.fields, {
      sort: newFilter.order,
      limit: newFilter.limit,
      skip: newFilter.skip,
    });
  }

  async findWithMongoFilter(filter: MongoFilter) {
    return this.groupModel.find(filter.where, filter.fields, {
      sort: filter.order,
      limit: filter.limit,
      skip: filter.skip,
    });
  }

  findOne(filter?: Statement): Promise<Group> {
    const newFilter = filterTranslator(filter);

    return this.groupModel.findOne(newFilter.where, newFilter.fields);
  }

  findById(id: string): Promise<Group> {
    return this.groupModel.findById(id);
  }

  remove(id: string) {
    return CRUDExceptionWrapper(async () => {
      return this.groupModel.findByIdAndDelete(id);
    });
  }

  async addNewRole(id: string, role: string) {
    const group = await this.groupModel.findById(id);
    if (group) {
      const set = new Set(group.roles);
      set.add(role);
      group.roles = Array.from(set);

      return await group.save();
    }
  }

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
