import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AzureConnectionDocument = HydratedDocument<AzureConnection>;
@Schema({ collection: 'connection' })
export class AzureConnection {
  system: string;

  @Prop({ required: true })
  enabled: boolean;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  clientId: string;

  @Prop({ required: true })
  clientSecret: string;

  @Prop({ required: true })
  vaultName: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  items: AzureConnectionItem[];
}

@Schema()
export class AzureConnectionItem {
  [x: string]: unknown;
}

export const AzureConnectionSchema =
  SchemaFactory.createForClass(AzureConnection);
