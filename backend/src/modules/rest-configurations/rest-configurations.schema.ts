import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RestConfigurationDocument = HydratedDocument<RestConfiguration>;
@Schema({ collection: 'restConfiguration' })
export class RestConfiguration {
  @Prop({
    required: true,
    validate: {
      validator: (v) => {
        return !v.includes('}{');
      },
      message: "Base models in url can't be next to each other",
    },
  })
  url: string;

  @Prop({ required: true })
  returnType: string;

  @Prop({ required: true })
  template: string;

  @Prop({ required: true })
  sequenceNumber: number;
}

const RestConfigurationSchema = SchemaFactory.createForClass(RestConfiguration);

export { RestConfigurationSchema };
