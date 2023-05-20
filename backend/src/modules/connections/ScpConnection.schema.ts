import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { RestConfiguration } from '../rest-configurations/rest-configurations.schema';

export type SCPConnectionDocument = HydratedDocument<SCP>;
@Schema({ collection: 'connection' })
export class SCP {
  system: string;

  @Prop({ required: true })
  enabled: boolean;

  @Prop({ required: true, enum: ['userpass', 'key'] })
  authType: string;

  @Prop({ required: true })
  username: string;

  @Prop()
  key: string;

  @Prop()
  password: string;

  @Prop({ required: true })
  host: string;

  @Prop({ default: 22 })
  port: number;

  @Prop({ required: true })
  items: SCPConnectionItem[];
}

@Schema()
export class TemplateItem {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'RestConfiguration' })
  id: RestConfiguration;
}

@Schema()
export class SCPConnectionItem {
  @Prop({ required: true })
  path: string;
  @Prop({ required: true })
  template: TemplateItem;

  [x: string]: unknown;
}

export const SCPConnectionSchema = SchemaFactory.createForClass(SCP);
