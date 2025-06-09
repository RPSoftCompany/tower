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
  create(createRestConfigurationDto: CreateRestConfigurationDto) {
    return this.restConfigurationModel.create(createRestConfigurationDto);
  }

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

  findById(id: string): Promise<Member> {
    return this.restConfigurationModel.findById(id);
  }

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

  update(
    id: string,
    fullUpdateRestConfigurationDto: FullUpdateRestConfigurationDto,
  ) {
    return this.restConfigurationModel.findByIdAndUpdate(
      id,
      fullUpdateRestConfigurationDto,
    );
  }

  remove(id: string) {
    return this.restConfigurationModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
    });
  }
}
