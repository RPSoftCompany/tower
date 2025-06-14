import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Statement } from '../../helpers/clauses';
import { filterTranslator } from '../../helpers/filterTranslator';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, Types } from 'mongoose';
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
   * Creates a new role using the provided data transfer object.
   *
   * @param {CreateRoleDto} createRoleDto - The data transfer object containing the details of the role to be created.
   * @return {Promise<Role>} A promise that resolves to the newly created role.
   */
  async create(createRoleDto: CreateRoleDto) {
    return await this.roleModel.create(createRoleDto);
  }

  /**
   * Counts the number of documents in the database that match the given filter condition.
   *
   * @param {Statement} [filter] - The optional filter object used to specify conditions for the count query.
   * @return {Promise<number>} A promise that resolves to the count of documents matching the filter.
   */
  async count(filter?: Statement): Promise<number> {
    const newFilter = filterTranslator(filter);

    return this.roleModel.countDocuments(newFilter.where);
  }

  /**
   * Handles the initialization process for the module by ensuring predefined roles exist in the database.
   * If any roles from the predefined list are not found, they will be created.
   *
   * @return {Promise<void>} A promise that resolves when the initialization process completes.
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
   * Finds and retrieves an array of Role objects based on the specified filter.
   *
   * @param {Statement} [filter] - Optional parameter to specify query constraints such as conditions, fields, sorting, limits, and offsets.
   * @return {Promise<Array<Role>>} A promise that resolves to an array of Role objects matching the filter criteria.
   */
  async find(filter?: Statement): Promise<Array<Role>> {
    const newFilter = filterTranslator(filter);

    return this.roleModel.find(
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
   * Finds a single role by its unique identifier.
   *
   * @param {string} id - The unique identifier of the role to find.
   * @return {Promise<Role>} A promise that resolves to the role object if found, or null if not found.
   */
  async findOne(id: string): Promise<Role> {
    return this.roleModel.findById(id);
  }

  /**
   * Finds a single role document that matches the specified filter criteria.
   *
   * @param {Statement} [filter] - Optional filter criteria to query the role document.
   *                               If not provided, a default filter will be applied.
   * @return {Promise<Role>} A promise that resolves to a single role document matching the filter criteria.
   */
  async findOneWithFilter(filter?: Statement): Promise<Role> {
    const newFilter = filterTranslator(filter);

    return this.roleModel.findOne(newFilter.where);
  }

  /**
   * Updates a role with the provided data.
   *
   * @param {string} id - The unique identifier of the role to update.
   * @param {UpdateRoleDto} updateRoleDto - The data to update the role with.
   * @return {Promise<Role>} A promise that resolves to the updated role.
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    return this.roleModel.findByIdAndUpdate(id, updateRoleDto, { new: true });
  }

  /**
   * Removes a document from the role collection based on the provided ID.
   *
   * @param {string} id - The unique identifier of the document to be removed.
   * @return {Promise<Object|null>} A promise that resolves to the removed document or null if no document was found.
   */
  async remove(id: string) {
    return this.roleModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
    });
  }
}
