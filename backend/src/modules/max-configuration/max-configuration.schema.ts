import {
  Configuration,
  ConfigurationSchema,
  ConfigurationVariable,
} from '../configurations/configuration.schema';
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { decryptPassword } from '../../helpers/encryptionHelper';

@Schema({
  collection: 'maxConfiguration',
  strict: false,
})
export class maxConfiguration extends Configuration {}

const MaxConfigurationSchema = SchemaFactory.createForClass(maxConfiguration);

MaxConfigurationSchema.index({ __metadata: 1 });

MaxConfigurationSchema.post('find', (docs: maxConfiguration[]) => {
  docs = docs.map((doc: maxConfiguration) => {
    if (doc.variables) {
      doc.variables = doc.variables.map((variable: ConfigurationVariable) => {
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

MaxConfigurationSchema.post('findOne', (doc: maxConfiguration) => {
  doc.variables = doc.variables.map((variable: ConfigurationVariable) => {
    if (variable.type === 'password') {
      variable.value = decryptPassword(variable.value);
    }

    return variable;
  });

  return doc;
});

MaxConfigurationSchema.post('aggregate', (docs: maxConfiguration[]) => {
  if (Array.isArray(docs)) {
    for (const doc of docs) {
      if (doc.variables) {
        doc.variables = doc.variables.map((variable: ConfigurationVariable) => {
          if (variable.type === 'password') {
            variable.value = decryptPassword(variable.value);
          }

          return variable;
        });
      }
    }
  }
});

export { MaxConfigurationSchema };
