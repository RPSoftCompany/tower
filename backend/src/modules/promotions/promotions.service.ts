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

  /**
   * Creates a new promotion in the database using the provided details.
   *
   * @param {CreatePromotionDto} createPromotionDto - The data transfer object containing promotion details for creation.
   * @return {Promise<any>} A promise that resolves to the created promotion object or rejects with an error.
   */
  create(createPromotionDto: CreatePromotionDto) {
    return this.promotionModel.create(createPromotionDto);
  }

  /**
   * Finds and retrieves an array of promotions based on the provided filter criteria.
   *
   * @param {Statement} [filter] - An optional filter object to specify the search criteria, including conditions, fields, sorting, limits, and offsets.
   * @return {Promise<Array<Promotion>>} A promise that resolves to an array of promotions matching the filter criteria.
   */
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

  /**
   * Finds a document by its unique identifier.
   *
   * @param {string} id - The unique identifier of the document to be retrieved.
   * @return {Promise<any>} A promise that resolves to the found document or null if no document is found.
   */
  findById(id: string) {
    return this.find({
      where: {
        _id: new Types.ObjectId(id),
      },
    });
  }

  /**
   * Counts the number of documents in the promotion model.
   *
   * @return {Promise<number>} A promise that resolves to the count of documents.
   */
  count() {
    return this.promotionModel.countDocuments();
  }

  /**
   * Partially updates a promotion entity with the provided data.
   *
   * @param {string} id - The unique identifier of the promotion to be updated.
   * @param {PartialUpdatePromotionDto} partialUpdatePromotionDto - The data used for updating the specified fields in the promotion entity.
   * @return {Promise<Object|undefined>} Returns the updated promotion entity if it exists; otherwise, returns undefined.
   */
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

  /**
   * Updates a promotion document with the provided details based on its ID.
   *
   * @param {string} id - The unique identifier of the promotion to be updated.
   * @param {FullUpdatePromotionDto} fullUpdatePromotionDto - The data transfer object containing full update details for the promotion.
   * @return {Promise<Object>} The updated promotion document.
   */
  fullUpdate(id: string, fullUpdatePromotionDto: FullUpdatePromotionDto) {
    return this.promotionModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
      },
      fullUpdatePromotionDto,
      { new: true },
    );
  }

  /**
   * Removes a promotion record from the database by its unique identifier.
   *
   * @param {string} id - The unique identifier of the promotion to be removed.
   * @return {Promise<void>} A promise that resolves when the deletion operation is completed.
   */
  async remove(id: string) {
    await this.promotionModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
  }
}
