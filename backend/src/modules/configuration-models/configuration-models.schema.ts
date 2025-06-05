import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export class ConfigurationModelRule {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  targetValue: string;

  @Prop({ required: true })
  targetType: string;

  @Prop({ required: true })
  targetRegEx: boolean;

  @Prop({ required: true })
  conditionValue: string;

  @Prop({ required: true })
  conditionType: string;

  @Prop({ required: true })
  conditionRegEx: boolean;

  @Prop({ required: true })
  error: string;
}

class ConfigurationModelOptions {
  @Prop({ required: true })
  hasRestrictions: string;

  @Prop({ required: false, default: false })
  forceComment: boolean;

  @Prop({ required: false, default: false })
  templateEnabled: boolean;
}

export type ConfigurationModelDocument = HydratedDocument<ConfigurationModel>;
@Schema({ collection: 'configurationModel' })
export class ConfigurationModel {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: [Object] })
  rules: ConfigurationModelRule[];

  @Prop({ required: true, type: [Object] })
  restrictions: any[];

  @Prop({ required: true, index: true })
  base: string;

  @Prop({ required: true, type: Object })
  options: ConfigurationModelOptions;

  @Prop({ required: false, type: [Boolean] })
  template: Array<boolean>;

  @Prop({ required: false, default: false })
  deleted: boolean;
}

const ConfigurationModelSchema =
  SchemaFactory.createForClass(ConfigurationModel);

ConfigurationModelSchema.index({ name: 1, base: 1 }, { unique: true });

export { ConfigurationModelSchema };
