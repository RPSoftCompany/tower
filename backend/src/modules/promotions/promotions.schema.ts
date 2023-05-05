import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PromotionDocument = HydratedDocument<Promotion>;
@Schema({ collection: 'promotion' })
export class Promotion {
  @Prop({ required: true })
  base: string;

  @Prop({ required: true })
  fromModel: string;

  @Prop({ required: true, type: [String] })
  toModels: string[];
}

const PromotionSchema = SchemaFactory.createForClass(Promotion);

export { PromotionSchema };
