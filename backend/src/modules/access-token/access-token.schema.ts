import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { Member } from '../members/member.schema';
import { v4 as uuidv4 } from 'uuid';

export type AccessTokenDocument = HydratedDocument<AccessToken>;
@Schema({ collection: 'AccessToken' })
export class AccessToken {
  @Prop({
    required: true,
    type: String,
    default: () => uuidv4(),
  })
  _id: string;

  @Prop({ required: true })
  ttl: number;

  @Prop({ required: true, default: Date.now })
  created: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Member' })
  userId: Member;
}

export const AccessTokenSchema = SchemaFactory.createForClass(AccessToken);
