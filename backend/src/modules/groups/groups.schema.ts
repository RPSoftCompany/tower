import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GroupDocument = HydratedDocument<Group>;
@Schema({ collection: 'group' })
export class Group {
  @Prop({ required: true, unique: true, index: true, type: String })
  name: string;

  @Prop({ type: [String] })
  roles: string[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
