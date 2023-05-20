import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export class HookObject {
  @Prop({ required: true })
  url: string;

  @Prop({ required: false })
  template: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, type: [] })
  headers: HookObjectHeader[];
}

class HookObjectHeader {
  @Prop({ required: true })
  name: string;

  @Prop()
  value: string;
}

export type HookDocument = HydratedDocument<Hook>;
@Schema({ collection: 'hook' })
export class Hook {
  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true, type: [] })
  hooks: HookObject[];
}

const HookSchema = SchemaFactory.createForClass(Hook);

export { HookSchema };
