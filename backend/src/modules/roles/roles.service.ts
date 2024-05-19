import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Statement } from '../../helpers/clauses';
import { filterTranslator } from '../../helpers/filterTranslator';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from './roles.schema';

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  /**
   * constructor
   * @param roleModel
   */
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  /**
   * create
   * @param createRoleDto
   */
  async create(createRoleDto: CreateRoleDto) {
    return await this.roleModel.create(createRoleDto);
  }

  /**
   * count
   * @param filter
   */
  async count(filter?: Statement): Promise<number> {
    const newFilter = filterTranslator(filter);

    return this.roleModel.countDocuments(newFilter.where);
  }

  /**
   * onModuleInit
   */
  async onModuleInit() {
    const rolesList = [
      {
        name: 'admin',
      },
      {
        name: 'configuration.view',
      },
      {
        name: 'configuration.modify',
      },
      {
        name: 'configurationModel.view',
      },
      {
        name: 'configurationModel.modify',
      },
      {
        name: 'constantVariable.modify',
      },
    ];

    const allRoles: Role[] = await this.roleModel.find();
    for (const role of rolesList) {
      const exists = allRoles.some((el) => {
        return el.name === role.name;
      });

      if (!exists) {
        await this.roleModel.create({
          name: role.name,
        });
      }
    }

    this.logger.debug('Roles check finished');
  }

  /**
   * find
   * @param filter
   */
  async find(filter?: Statement): Promise<Array<Role>> {
    const newFilter = filterTranslator(filter);

    return this.roleModel.find(newFilter.where, newFilter.fields, {
      sort: newFilter.order,
      limit: newFilter.limit,
      skip: newFilter.skip,
    });
  }

  /**
   * findOne
   * @param id
   */
  async findOne(id: string): Promise<Role> {
    return this.roleModel.findById(id);
  }

  /**
   * findOneWithFilter
   * @param filter
   */
  async findOneWithFilter(filter?: Statement): Promise<Role> {
    const newFilter = filterTranslator(filter);

    return this.roleModel.findOne(newFilter.where);
  }

  /**
   * update
   * @param id
   * @param updateRoleDto
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    return this.roleModel.findByIdAndUpdate(id, updateRoleDto, { new: true });
  }

  /**
   * remove
   * @param id
   */
  async remove(id: string) {
    return this.roleModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
    });
  }
}
