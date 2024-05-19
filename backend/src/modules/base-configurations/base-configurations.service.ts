import { CreateBaseConfigurationDto } from './dto/create-base-configuration.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
   * create
   * @param createBaseConfigurationDto
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
   * find
   * @param filter
   */
  find(filter?: Statement): Promise<Array<BaseConfiguration>> {
    const newFilter = filterTranslator(filter);

    return this.baseConfigurationModel.find(newFilter.where, newFilter.fields, {
      sort: newFilter.order,
      limit: newFilter.limit,
      skip: newFilter.skip,
    });
  }

  /**
   * count
   * @param filter
   */
  count(filter?: Statement): Promise<number> {
    const newFilter = filterTranslator(filter);

    return this.baseConfigurationModel.countDocuments(newFilter.where);
  }

  /**
   * findAll
   */
  findAll() {
    return this.baseConfigurationModel.find();
  }

  /**
   * findById
   * @param id
   */
  findById(id: string): Promise<BaseConfiguration> {
    return this.baseConfigurationModel.findById(id);
  }

  /**
   * updatePartial
   * @param id
   * @param updatePartialBaseConfigurationDto
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
   * update
   * @param id
   * @param updateBaseConfigurationDto
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
   * remove
   * @param id
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
