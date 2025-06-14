import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Statement } from '../../helpers/clauses';
import {
  filterTranslator,
  prepareAggregateArray,
} from '../../helpers/filterTranslator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Audit, AuditDocument } from './audits.schema';

@Injectable()
export class AuditsService implements OnModuleInit {
  private readonly logger = new Logger(AuditsService.name);

  constructor(
    @InjectModel(Audit.name) private auditModel: Model<AuditDocument>,
  ) {}

  /**
   * Initializes the module by setting up indexing and handling TTL (Time-To-Live) configurations
   * for the audit model schema. Ensures necessary index synchronization and logs the status of the operation.
   *
   * @return {Promise<void>} A promise that resolves when the module initialization is completed.
   */
  async onModuleInit() {
    this.auditModel.schema.index(
      { date: 1 },
      { expires: `${process.env.AUDIT_TTL}d` },
    );
    await this.auditModel.syncIndexes();

    this.logger.debug('Audit ttl check finished');
  }

  /**
   * Finds audit entries based on the provided filter criteria.
   *
   * @param {Statement} [filter] - The filter criteria to apply when retrieving audit records.
   * @return {Promise<Array<Audit>>} A promise resolving to an array of audit records that match the filter criteria.
   */
  find(filter?: Statement): Promise<Array<Audit>> {
    const newFilter = filterTranslator(filter);

    let aggregation: any[] = [
      {
        $lookup: {
          from: 'member',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      {
        $project: {
          _id: 1,
          entity: 1,
          url: 1,
          method: 1,
          query: 1,
          body: 1,
          status: 1,
          statusCode: 1,
          errorDescription: 1,
          date: 1,
          userId: {
            $first: '$userId',
          },
        },
      },
      {
        $project: {
          _id: 1,
          entity: 1,
          url: 1,
          method: 1,
          query: 1,
          body: 1,
          status: 1,
          statusCode: {
            $toString: '$statusCode',
          },
          errorDescription: 1,
          date: {
            $toString: '$date',
          },
          user: '$userId.username',
        },
      },
    ];

    const addedFilter = prepareAggregateArray(undefined, newFilter);

    aggregation = [...aggregation, ...addedFilter];

    return this.auditModel.aggregate(aggregation).exec();
  }

  /**
   * Counts the number of documents in the database based on the given filter criteria.
   *
   * @param {Statement} [filter] - Optional filter criteria used to count the documents.
   * @return {Promise<number>} A promise that resolves to the count of documents matching the filter criteria.
   */
  async count(filter?: Statement) {
    const newFilter = filterTranslator(filter);

    return this.auditModel.countDocuments(newFilter.where);
  }
}
