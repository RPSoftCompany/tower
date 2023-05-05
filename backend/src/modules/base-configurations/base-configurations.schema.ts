import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BaseConfigurationDocument = HydratedDocument<BaseConfiguration>;
@Schema({ collection: 'baseConfiguration' })
export class BaseConfiguration {
  @Prop({
    required: true,
    unique: true,
    index: true,
    type: String,
    validate: {
      validator: function (value) {
        return /^[a-zA-Z ]+$/.test(value);
      },
      message:
        'Base configuration name may contain only lower and uppercase characters and spaces',
    },
  })
  name: string;

  @Prop({ required: true })
  sequenceNumber: number;

  @Prop({ required: false })
  icon: string;
}

export const BaseConfigurationSchema =
  SchemaFactory.createForClass(BaseConfiguration);
