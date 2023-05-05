import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Statement } from '../../helpers/clauses';
import { filterTranslator } from '../../helpers/filterTranslator';
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

    return this.auditModel
      .find(newFilter.where, newFilter.fields, {
        sort: newFilter.order,
        limit: newFilter.limit,
        skip: newFilter.skip,
      })
      .populate('userId', 'username');
  }

  async count(filter?: Statement) {
    const newFilter = filterTranslator(filter);

    return this.auditModel.count(newFilter.where);
  }
}
