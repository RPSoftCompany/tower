import { Configuration } from '../configurations/configuration.schema';
import { Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'maxConfiguration',
  strict: false,
})
export class maxConfiguration extends Configuration {}

const MaxConfigurationSchema = SchemaFactory.createForClass(maxConfiguration);

MaxConfigurationSchema.index({ __metadata: 1 });

export { MaxConfigurationSchema };
