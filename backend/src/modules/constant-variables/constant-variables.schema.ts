import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { Member } from '../members/member.schema';
import {
  decryptPassword,
  encryptPassword,
} from '../../helpers/encryptionHelper';
import { BadRequestException } from '@nestjs/common';

export class ConstantVariableObject {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Object })
  value: string | number | Array<string> | boolean | null | undefined;

  @Prop({
    required: true,
    type: String,
    enum: ['string', 'number', 'list', 'text', 'boolean', 'password', 'Vault'],
  })
  type: string;

  @Prop({ required: true })
  forced: boolean;

  @Prop({ required: true })
  addIfAbsent: boolean;
}

export type ConstantVariableDocument = HydratedDocument<ConstantVariable>;
@Schema({ collection: 'constantVariable', strict: false })
export class ConstantVariable {
  @Prop({ default: () => new Date() })
  effectiveDate: Date;

  @Prop({ required: true, type: [Object] })
  variables: ConstantVariableObject[];

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Member' })
  createdBy: Member;
}

const ConstantVariableSchema = SchemaFactory.createForClass(ConstantVariable);

ConstantVariableSchema.post('find', (docs) => {
  docs = docs.map((doc: ConstantVariable) => {
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

ConstantVariableSchema.post('aggregate', (docs: ConstantVariable[]) => {
  if (Array.isArray(docs)) {
    for (const doc of docs) {
      if (doc.variables) {
        doc.variables = doc.variables.map(
          (variable: ConstantVariableObject) => {
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

ConstantVariableSchema.pre('validate', async function () {
  const allTypes = [
    'string',
    'number',
    'list',
    'text',
    'boolean',
    'password',
    'Vault',
  ];

  this.variables = this.variables.map((variable: ConstantVariableObject) => {
    if (variable.type === 'password') {
      variable.value = encryptPassword(variable.value);
    }

    if (!allTypes.includes(variable.type)) {
      throw new BadRequestException(`Invalid variable type: ${variable.type}`);
    }

    return variable;
  });
});

export { ConstantVariableSchema };
