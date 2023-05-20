import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type V1Document = HydratedDocument<V1>;
@Schema({ collection: 'v1' })
export class V1 {
  @Prop({ required: true, unique: true, index: true, type: String })
  booted: boolean;

  @Prop({ required: true })
  encryptionCheck: string;
}

export const V1Schema = SchemaFactory.createForClass(V1);
