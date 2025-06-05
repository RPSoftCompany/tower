import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type KubernetesConnectionDocument =
  HydratedDocument<KubernetesConnection>;
@Schema({ collection: 'connection' })
export class KubernetesConnection {
  system: string;

  @Prop({ required: true })
  enabled: boolean;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  namespace: string;

  @Prop({ required: true })
  items: KubernetesConnectionItem[];
}

@Schema()
export class KubernetesConnectionItem {
  [x: string]: unknown;
}

export const KubernetesConnectionSchema =
  SchemaFactory.createForClass(KubernetesConnection);
