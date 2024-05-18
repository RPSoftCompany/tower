import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { UpdateHookDto } from './dto/update-hook.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
   * onModuleInit
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
   * find
   *
   * @param filter
   */
  find(filter?: Statement): Promise<Array<Hook>> {
    const newFilter = filterTranslator(filter);

    return this.hookModel.find(newFilter.where, newFilter.fields, {
      sort: newFilter.order,
      limit: newFilter.limit,
      skip: newFilter.skip,
    });
  }

  /**
   * findById
   *
   * @param id
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

  async count(filter?: Statement) {
    const newFilter = filterTranslator(filter);

    return this.hookModel.countDocuments(newFilter.where);
  }

  /**
   * updateHookObject
   *
   * @param id
   * @param updateHookDto
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
   * addHookObject
   *
   * @param id
   * @param addHookDto
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
   * removeHookObject
   *
   * @param id
   * @param fk
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
   * executeHook
   *
   * @param method
   * @param model
   * @param objectVariables
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
