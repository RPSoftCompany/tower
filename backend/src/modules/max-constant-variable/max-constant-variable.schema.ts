import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { ConstantVariable } from '../constant-variables/constant-variables.schema';

@Schema({
  collection: 'maxConstantVariable',
  strict: false,
})
export class MaxConstantVariable extends ConstantVariable {}

const MaxConstantVariableSchema =
  SchemaFactory.createForClass(MaxConstantVariable);

export { MaxConstantVariableSchema };
