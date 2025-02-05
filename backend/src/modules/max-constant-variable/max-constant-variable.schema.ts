import { Schema, SchemaFactory } from '@nestjs/mongoose';
import {ConstantVariable, ConstantVariableObject} from '../constant-variables/constant-variables.schema';
import {ConfigurationVariable} from "../configurations/configuration.schema";
import {decryptPassword} from "../../helpers/encryptionHelper";
import {maxConfiguration, MaxConfigurationSchema} from "../max-configuration/max-configuration.schema";

@Schema({
  collection: 'maxConstantVariable',
  strict: false,
})
export class MaxConstantVariable extends ConstantVariable {}

const MaxConstantVariableSchema =
  SchemaFactory.createForClass(MaxConstantVariable);

MaxConstantVariableSchema.post('find', (docs: MaxConstantVariable[]) => {
  docs = docs.map((doc: MaxConstantVariable) => {
    if (doc.variables) {
      doc.variables = doc.variables.map((variable: ConstantVariableObject) => {
        if (variable.type === 'password') {
          variable.value = decryptPassword(variable.value);
        }

        return variable;
      });
    }

    return doc;
  });

  return docs;
});

MaxConstantVariableSchema.post('aggregate', (docs: MaxConstantVariable[]) => {
  if (Array.isArray(docs)) {
    for (const doc of docs) {
      if (doc.variables) {
        doc.variables = doc.variables.map((variable: ConstantVariableObject) => {
          if (variable.type === 'password') {
            variable.value = decryptPassword(variable.value);
          }

          return variable;
        });
      }
    }
  }
});

export { MaxConstantVariableSchema };
