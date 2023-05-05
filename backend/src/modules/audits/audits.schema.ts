import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { Member } from '../members/member.schema';

export type AuditDocument = HydratedDocument<Audit>;
@Schema({ collection: 'audit' })
export class Audit {
  @Prop({ required: true })
  entity: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  method: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Member' })
  userId: Member;

  @Prop({ required: true })
  query: string;

  @Prop({ required: false })
  body?: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  statusCode: number;

  @Prop({
    default: () => new Date(),
  })
  date?: Date;

  @Prop({ required: false })
  errorDescription?: string;
}

const AuditsSchema = SchemaFactory.createForClass(Audit);

export { AuditsSchema };
