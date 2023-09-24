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

  async onModuleInit() {
    this.auditModel.schema.index(
      { date: 1 },
      { expires: `${process.env.AUDIT_TTL}d` },
    );
    await this.auditModel.syncIndexes();

    this.logger.debug('Audit ttl check finished');
  }

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

  async count(filter?: Statement) {
    const newFilter = filterTranslator(filter);

    return this.auditModel.count(newFilter.where);
  }
}
