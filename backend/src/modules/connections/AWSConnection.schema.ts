import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AWSConnectionDocument = HydratedDocument<AWSConnection>;
@Schema({ collection: 'connection' })
export class AWSConnection {
  system: string;

  @Prop({ required: true })
  enabled: boolean;

  @Prop({ required: true })
  region: string;

  @Prop({ required: true })
  secretAccessKey: string;

  @Prop({ required: true })
  accessKeyId: string;

  @Prop({ required: true })
  items: AWSConnectionItem[];
}

@Schema()
export class AWSConnectionItem {
  [x: string]: unknown;
}

export const AWSConnectionSchema = SchemaFactory.createForClass(AWSConnection);
