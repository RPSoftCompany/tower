import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { Member } from '../members/member.schema';
import {
  decryptPassword,
  encryptPassword,
} from '../../helpers/encryptionHelper';
import { BadRequestException } from '@nestjs/common';

export class ConfigurationVariable {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Object })
  value: string | number | Array<string> | boolean | null | undefined;

  @Prop({
    required: true,
    enum: ['string', 'number', 'list', 'text', 'boolean', 'password', 'Vault'],
  })
  type: string;
}

export type ConfigurationDocument = HydratedDocument<Configuration>;
@Schema({ collection: 'configuration', strict: false })
export class Configuration {
  @Prop({ default: () => new Date() })
  effectiveDate: Date;

  @Prop({ required: true, type: [Object] })
  variables: ConfigurationVariable[];

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Member' })
  createdBy: Member;

  @Prop({ required: true, default: false })
  promoted: boolean;

  @Prop({ required: true, index: -1 })
  version: number;

  @Prop({ required: false })
  draft: boolean;
}

const ConfigurationSchema = SchemaFactory.createForClass(Configuration);

ConfigurationSchema.index({ 'variables.name': 1 });
ConfigurationSchema.index({ 'variables.value': 1 });

ConfigurationSchema.post('find', (docs) => {
  docs = docs.map((doc: Configuration) => {
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

ConfigurationSchema.post('aggregate', (docs: Configuration[]) => {
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

ConfigurationSchema.pre('validate', async function () {
  const allTypes: string[] = [
    'string',
    'number',
    'list',
    'text',
    'boolean',
    'password',
    'Vault',
  ];

  this.variables = this.variables.map((variable: ConfigurationVariable) => {
    if (variable.type === 'password') {
      variable.value = encryptPassword(variable.value);
    }

    if (!allTypes.includes(variable.type)) {
      throw new BadRequestException(`Invalid variable type: ${variable.type}`);
    }

    return variable;
  });
});

export { ConfigurationSchema };
