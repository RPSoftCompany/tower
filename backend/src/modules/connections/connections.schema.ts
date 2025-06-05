import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LDAP } from './ldapConnection.schema';
import { Vault } from './VaultConnection.schema';
import { SCP } from './ScpConnection.schema';
import { AWSConnection } from './AWSConnection.schema';
import { AzureConnection } from './AzureConnection.schema';
import {
  decryptPassword,
  encryptPassword,
} from '../../helpers/encryptionHelper';
import { KubernetesConnection } from './KubernetesConnection.schema';

export type ConnectionDocument = HydratedDocument<Connection>;
@Schema({ collection: 'connection', discriminatorKey: 'system' })
export class Connection {
  @Prop({
    required: true,
    type: String,
    enum: [
      LDAP.name,
      Vault.name,
      SCP.name,
      AWSConnection.name,
      AzureConnection.name,
      KubernetesConnection.name,
    ],
  })
  system: string;
}

const ConnectionSchema = SchemaFactory.createForClass(Connection);
const onSave = async function () {
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
  } else if (
    this.system === AWSConnection.name &&
    (this as any).secretAccessKey
  ) {
    if ((this as any).secretAccessKey) {
      const isEncrypted = decryptPassword((this as any).secretAccessKey);
      if (!isEncrypted) {
        (this as any).secretAccessKey = encryptPassword(
          (this as any).secretAccessKey,
        );
      }
    }
  } else if (
    this.system === AzureConnection.name &&
    (this as any).clientSecret
  ) {
    if ((this as any).clientSecret) {
      const isEncrypted = decryptPassword((this as any).clientSecret);
      if (!isEncrypted) {
        (this as any).clientSecret = encryptPassword(
          (this as any).clientSecret,
        );
      }
    }
  } else if (this.system === KubernetesConnection.name && (this as any).token) {
    if ((this as any).token) {
      const isEncrypted = decryptPassword((this as any).token);
      if (!isEncrypted) {
        (this as any).token = encryptPassword((this as any).token);
      }
    }
  }
};

ConnectionSchema.pre('save', onSave);
ConnectionSchema.pre('createCollection', onSave);

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
    } else if (el.system === 'AWSConnection' && el.secretAccessKey) {
      el.secretAccessKey = decryptPassword(el.secretAccessKey);
    } else if (el.system === 'AzureConnection' && el.clientSecret) {
      el.clientSecret = decryptPassword(el.clientSecret);
    } else if (el.system === 'KubernetesConnection' && el.token) {
      el.token = decryptPassword(el.token);
    }
  });
});

export { ConnectionSchema };
