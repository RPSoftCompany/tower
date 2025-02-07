import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { Member } from '../members/member.schema';
import {
  decryptPassword,
  encryptPassword,
} from '../../helpers/encryptionHelper';
import { BadRequestException } from '@nestjs/common';

export class ConfigurationVariable {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: Object })
  value: string | number | Array<string> | boolean | null | undefined;

  @Prop({
    required: true,
    enum: [
      'string',
      'number',
      'list',
      'text',
      'boolean',
      'password',
      'Vault',
      'AWS SM',
      'AZURE keyVault',
    ],
  })
  type: string;

  @Prop({ required: false })
  valueKey?: string;
}

export type ConfigurationDocument = HydratedDocument<Configuration>;

@Schema({
  collection: 'configuration',
  strict: false,
})
export class Configuration {
  @Prop({ default: () => new Date(), index: -1 })
  effectiveDate: Date;

  @Prop({ required: true, type: [Object] })
  variables: ConfigurationVariable[];

  variablesByName: any;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Member' })
  createdBy: Member;

  @Prop({ required: true, default: false })
  promoted: boolean;

  @Prop({ required: true, index: -1 })
  version: number;

  @Prop({ required: false })
  draft: boolean;

  @Prop({ required: false })
  comment: string;

  @Prop({ required: false, type: Object })
  __metadata: unknown;
}

const ConfigurationSchema = SchemaFactory.createForClass(Configuration);

ConfigurationSchema.post('find', (docs: Configuration[]) => {
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

ConfigurationSchema.post('findOne', (doc: Configuration) => {
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
    'AWS SM',
    'AZURE keyVault',
  ];

  this.variables = this.variables.map((variable: ConfigurationVariable) => {
    if (variable.type === 'password') {
      variable.value = encryptPassword(variable.value);
    }

    if (typeof variable.name !== 'string') {
      throw new BadRequestException(`Invalid variable type: ${variable.type}`);
    }

    if (variable.type === 'list') {
      try {
        if (
          typeof variable.value === 'object' &&
          (variable.value as Array<any>).length >= 0
        ) {
          // IGNORE
        } else {
          throw new BadRequestException(`Invalid value for type list`);
        }
      } catch (e) {
        throw new BadRequestException(`Invalid value for type list`);
      }
    }

    if (!allTypes.includes(variable.type)) {
      throw new BadRequestException(`Invalid variable type: ${variable.type}`);
    }

    return variable;
  });
});

export { ConfigurationSchema };
