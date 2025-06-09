import { Injectable } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ProjectionType, Types } from 'mongoose';
import { Promotion, PromotionDocument } from './promotions.schema';
import { Statement } from '../../helpers/clauses';
import { filterTranslator } from '../../helpers/filterTranslator';
import { PartialUpdatePromotionDto } from './dto/partial-update-promotion.dto';
import { FullUpdatePromotionDto } from './dto/full-update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(Promotion.name)
    private promotionModel: Model<PromotionDocument>,
  ) {}

  create(createPromotionDto: CreatePromotionDto) {
    return this.promotionModel.create(createPromotionDto);
  }

  find(filter?: Statement): Promise<Array<Promotion>> {
    const newFilter = filterTranslator(filter);

    return this.promotionModel.find(
      newFilter.where,
      newFilter.fields as ProjectionType<any>,
      {
        sort: newFilter.order,
        limit: newFilter.limit,
        skip: newFilter.skip,
      },
    );
  }

  findById(id: string) {
    return this.find({
      where: {
        _id: new Types.ObjectId(id),
      },
    });
  }

  count() {
    return this.promotionModel.countDocuments();
  }

  async partialUpdate(
    id: string,
    partialUpdatePromotionDto: PartialUpdatePromotionDto,
  ) {
    const existingMember = await this.promotionModel.findById(id);
    if (existingMember) {
      for (const key in partialUpdatePromotionDto) {
        if (key !== 'id' && partialUpdatePromotionDto[key]) {
          existingMember[key] = partialUpdatePromotionDto[key];
        }
      }

      return await existingMember.save();
    }
  }

  fullUpdate(id: string, fullUpdatePromotionDto: FullUpdatePromotionDto) {
    return this.promotionModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
      },
      fullUpdatePromotionDto,
      { new: true },
    );
  }

  async remove(id: string) {
    await this.promotionModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
  }
}
