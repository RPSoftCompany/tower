import { Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ConstantVariable,
  ConstantVariableObject,
} from '../constant-variables/constant-variables.schema';
import { decryptPassword } from '../../helpers/encryptionHelper';

/**
 * Schema definition for MaxConstantVariable collection
 * Extends ConstantVariable schema and handles encrypted password variables
 * Uses strict: false to allow flexibility in document structure
 */
@Schema({
  collection: 'maxConstantVariable',
  strict: false,
})
export class MaxConstantVariable extends ConstantVariable {}

const MaxConstantVariableSchema =
  SchemaFactory.createForClass(MaxConstantVariable);

/**
 * Post-find middleware that decrypts password values in the result set
 * Executes after all find() operations on the collection
 */
MaxConstantVariableSchema.post('find', (docs: MaxConstantVariable[]) => {
  docs = docs.map((doc: MaxConstantVariable) => {
    if (doc.variables) {
      doc.variables = doc.variables.map((variable: ConstantVariableObject) => {
        // Decrypt password type variables before returning to the client
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

/**
 * Post-findOne middleware that decrypts password values in a single document
 * Executes after findOne() operations on the collection
 */
MaxConstantVariableSchema.post('findOne', (doc: MaxConstantVariable) => {
  if (doc?.variables) {
    doc.variables = doc.variables.map((variable: ConstantVariableObject) => {
      // Decrypt password type variables before returning to the client
      if (variable.type === 'password') {
        variable.value = decryptPassword(variable.value);
      }

      return variable;
    });
  }

  return doc;
});

/**
 * Post-aggregate middleware that decrypts password values in aggregation results
 * Executes after aggregate() operations on the collection
 */
MaxConstantVariableSchema.post('aggregate', (docs: MaxConstantVariable[]) => {
  if (Array.isArray(docs)) {
    for (const doc of docs) {
      if (doc.variables) {
        doc.variables = doc.variables.map(
          (variable: ConstantVariableObject) => {
            // Decrypt password type variables before returning to the client
            if (variable.type === 'password') {
              variable.value = decryptPassword(variable.value);
            }

            return variable;
          },
        );
      }
    }
  }
});

export { MaxConstantVariableSchema };
