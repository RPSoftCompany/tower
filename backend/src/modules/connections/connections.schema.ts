import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LDAP } from './ldapConnection.schema';
import { Vault } from './VaultConnection.schema';
import { SCP } from './ScpConnection.schema';
import {
  decryptPassword,
  encryptPassword,
} from '../../helpers/encryptionHelper';

export type ConnectionDocument = HydratedDocument<Connection>;
@Schema({ collection: 'connection', discriminatorKey: 'system' })
export class Connection {
  @Prop({
    required: true,
    type: String,
    enum: [LDAP.name, Vault.name, SCP.name],
  })
  system: string;
}

const ConnectionSchema = SchemaFactory.createForClass(Connection);
ConnectionSchema.pre('save', function () {
  if (this.system === 'LDAP' && (this as any).bindCredentials) {
    const isEncrypted = decryptPassword((this as any).bindCredentials);
    if (!isEncrypted) {
      (this as any).bindCredentials = encryptPassword(
        (this as any).bindCredentials,
      );
    }
  } else if (this.system === 'Vault' && (this as any).globalToken) {
    let isEncrypted = decryptPassword((this as any).globalToken);
    if (!isEncrypted) {
      (this as any).globalToken = encryptPassword((this as any).globalToken);
    }
    if ((this as any).tokens) {
      (this as any).tokens = (this as any).tokens.map((el: any) => {
        if (el.token) {
          isEncrypted = decryptPassword(el.token);
          if (!isEncrypted) {
            el.token = encryptPassword(el.token);
          }
        }

        return el;
      });
    }
  } else if (
    this.system === 'SCP' &&
    ((this as any).key || (this as any).password)
  ) {
    if ((this as any).key) {
      const isEncrypted = decryptPassword((this as any).key);
      if (!isEncrypted) {
        (this as any).key = encryptPassword((this as any).key);
      }
    }
    if ((this as any).password) {
      const isEncrypted = decryptPassword((this as any).password);
      if (!isEncrypted) {
        (this as any).password = encryptPassword((this as any).password);
      }
    }
  }
});

ConnectionSchema.post('find', function (docs) {
  return (docs as Array<any>).map((el) => {
    if (el.system === 'LDAP' && el.bindCredentials) {
      el.bindCredentials = decryptPassword(el.bindCredentials);
    } else if (el.system === 'Vault' && el.globalToken) {
      el.globalToken = decryptPassword(el.globalToken);

      if (el.tokens) {
        el.tokens = el.tokens.map((el) => {
          if (el.token) {
            el.token = decryptPassword(el.token);
          }
          return el;
        });
      }
    } else if (el.system === 'SCP' && (el.key || el.password)) {
      if (el.key) {
        el.key = decryptPassword(el.key);
      }
      if (el.password) {
        el.password = decryptPassword(el.password);
      }
    }
  });
});

export { ConnectionSchema };
