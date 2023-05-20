import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VaultConnectionDocument = HydratedDocument<Vault>;
@Schema({ collection: 'connection' })
export class Vault {
  system: string;

  @Prop({ required: true })
  enabled: boolean;

  @Prop({ required: false })
  useGlobalToken: boolean;

  @Prop({ required: false })
  globalToken: string;

  @Prop({ required: false })
  url: string;

  @Prop({ required: true })
  tokens: VaultConnectionToken[];
}

@Schema()
export class VaultConnectionToken {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  base: string;
  @Prop({ required: true })
  token: string;
}

export const VaultConnectionSchema = SchemaFactory.createForClass(Vault);
