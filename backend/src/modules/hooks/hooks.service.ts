import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { UpdateHookDto } from './dto/update-hook.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, Types } from 'mongoose';
import { Hook, HookDocument, HookObject } from './hooks.schema';
import { Statement } from '../../helpers/clauses';
import { filterTranslator } from '../../helpers/filterTranslator';
import { Liquid } from 'liquidjs';
import axios from 'axios';
import { AddHookDto } from './dto/add-hook.dto';

@Injectable()
export class HooksService implements OnModuleInit {
  private readonly logger = new Logger(HooksService.name);

  constructor(@InjectModel(Hook.name) private hookModel: Model<HookDocument>) {}

  /**
   * Initializes module-specific configurations by setting up model hooks.
   * The method checks for predefined hooks for various models and their associated methods
   * (e.g., beforeCreate, afterCreate, beforeUpdate, afterUpdate). If the hooks do not already
   * exist in the database, they are created and persisted.
   * Additionally, a debug log is generated to report the completion of the hook setup process.
   *
   * @return {Promise<void>} A promise that resolves when the initialization routine is complete.
   */
  async onModuleInit() {
    const allHooks: Hook[] = [];
    allHooks.push({
      hooks: [],
      method: 'beforeCreate',
      model: 'Configuration',
    });
    allHooks.push({
      hooks: [],
      method: 'afterCreate',
      model: 'Configuration',
    });
    allHooks.push({
      hooks: [],
      method: 'beforeCreate',
      model: 'ConfigurationModel',
    });
    allHooks.push({
      hooks: [],
      method: 'afterCreate',
      model: 'ConfigurationModel',
    });
    allHooks.push({
      hooks: [],
      method: 'beforeUpdate',
      model: 'ConfigurationModel',
    });
    allHooks.push({
      hooks: [],
      method: 'afterUpdate',
      model: 'ConfigurationModel',
    });
    allHooks.push({
      hooks: [],
      method: 'beforeCreate',
      model: 'ConstantVariable',
    });
    allHooks.push({
      hooks: [],
      method: 'afterCreate',
      model: 'ConstantVariable',
    });

    const existingHooks: Hook[] = await this.hookModel.find();

    for (const hook of allHooks) {
      const exists = existingHooks.some((el) => {
        return el.method === hook.method && el.model === hook.model;
      });

      if (!exists) {
        await this.hookModel.create(hook);
      }
    }

    this.logger.debug('Hooks check finished');
  }

  /**
   * Finds and retrieves an array of hooks based on the provided filter criteria.
   *
   * @param {Statement} [filter] - An optional filter object specifying the query criteria, fields to project, sorting, and pagination.
   * @return {Promise<Array<Hook>>} A promise resolving to an array of hooks matching the filter criteria.
   */
  find(filter?: Statement): Promise<Array<Hook>> {
    const newFilter = filterTranslator(filter);

    return this.hookModel.find(
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
   * Finds a document by its unique identifier.
   *
   * @param {string} id - The unique identifier of the document to find.
   * @return {Promise<Object|null>} A promise that resolves to the found document or null if no document is found.
   */
  async findById(id: string) {
    const array = await this.find({
      where: {
        _id: new Types.ObjectId(id),
      },
    });

    if (array && array.length > 0) {
      return array[0];
    } else {
      return null;
    }
  }

  /**
   * Counts the number of documents that match the given filter criteria.
   *
   * @param {Statement} [filter] - Optional filter criteria for counting documents. If not provided, all documents are counted.
   * @return {Promise<number>} A promise that resolves with the count of matching documents.
   */
  async count(filter?: Statement) {
    const newFilter = filterTranslator(filter);

    return this.hookModel.countDocuments(newFilter.where);
  }

  /**
   * Updates an existing hook object in the database.
   * Searches for a hook object by its ID, updates its properties with the given data, and saves the changes.
   *
   * @param {string} id - The ID of the parent hook object to update.
   * @param {UpdateHookDto} updateHookDto - The data transfer object containing the updated hook information.
   * @return {Promise<HookObject>} A promise that resolves to the updated hook object if found and updated successfully.
   * @throws {BadRequestException} If the given hook object ID is invalid.
   * @throws {null} If the parent hook object is not found.
   */
  async updateHookObject(
    id: string,
    updateHookDto: UpdateHookDto,
  ): Promise<HookObject> {
    const hook = await this.hookModel.findOne({
      _id: new Types.ObjectId(id),
    });

    if (hook) {
      const index = hook.hooks.findIndex((el) => {
        return el._id === updateHookDto._id;
      });

      if (index >= 0) {
        hook.hooks[index] = updateHookDto;
        await hook.save();
        return hook.hooks[index];
      }

      throw new BadRequestException('Invalid hook object id');
    }

    return null;
  }

  /**
   * Adds a hook object to an existing hook model identified by the given ID.
   *
   * @param {string} id - The unique identifier of the hook model to which the hook object should be added.
   * @param {AddHookDto} addHookDto - Data Transfer Object (DTO) containing the details of the hook object to be added.
   * @return {Promise<HookObject>} A promise that resolves to the newly added hook object if successful, or null if the hook model does not exist.
   */
  async addHookObject(id: string, addHookDto: AddHookDto): Promise<HookObject> {
    const hook = await this.hookModel.findOne({
      _id: new Types.ObjectId(id),
    });

    if (hook) {
      const newLength = hook.hooks.push(addHookDto);

      await hook.save();

      return hook.hooks[newLength - 1];
    }

    return null;
  }

  /**
   * Removes a specific hook object from the hooks array of a given document.
   *
   * @param {string} id - The ID of the document from which the hook object will be removed.
   * @param {string} fk - The ID of the hook object to be removed from the hooks array.
   * @return {Promise<Object|null>} Returns the updated document after removing the hook object, or null if the document was not found.
   */
  async removeHookObject(id: string, fk: string) {
    const hook = await this.hookModel.findOne({
      _id: new Types.ObjectId(id),
    });

    if (hook) {
      hook.hooks = hook.hooks.filter((el) => {
        return el._id !== fk;
      });

      return hook.save();
    }

    return null;
  }

  /**
   * Executes a specified hook for a given method and model with the provided variables.
   *
   * @param {string} method - The method name for which the hook is triggered (e.g., 'create', 'update').
   * @param {string} model - The name of the model associated with the hook.
   * @param {any} objectVariables - The set of variables used to parse templates and configure the hook execution.
   * @return {Promise<void>} A promise that resolves when the hook has been executed.
   * @throws {BadRequestException} If there is an error while executing the hook in the `before` phase.
   */
  async executeHook(method: string, model: string, objectVariables: any) {
    const hook = await this.hookModel.findOne({
      model: model,
      method: method,
    });

    if (hook) {
      const engine = new Liquid();

      const clone: any = {};
      for (const key in objectVariables) {
        if (key !== '_id' && key !== 'variables') {
          clone[key] = objectVariables[key];
        } else if (key === 'variables') {
          clone[key] = [...objectVariables[key]];
        }
      }

      for (const hookObject of hook.hooks) {
        let body = null;
        if (['POST', 'PUT', 'PATCH'].includes(hookObject.method)) {
          try {
            body = await engine.parseAndRender(hookObject.template, clone);
          } catch (e) {
            this.logger.error(
              `Error parsing body for ${model} ${method} hook: ${e.message}`,
            );
          }
        }

        const headers = {};
        for (const header of hookObject.headers) {
          headers[header.name] = header.value;
        }

        if (method.startsWith('after')) {
          try {
            await axios({
              method: hookObject.method,
              headers: headers,
              data: body,
              url: hookObject.url,
            });
          } catch (e) {
            this.logger.error(
              `Error executing ${model} ${method} hook: ${e.message}`,
            );
          }
        } else {
          try {
            await axios({
              method: hookObject.method,
              headers: headers,
              data: body,
              url: hookObject.url,
            });
          } catch (e) {
            throw new BadRequestException(
              `Error executing ${model} ${method} hook: ${e.message}`,
            );
          }
        }
      }
    }
  }
}
