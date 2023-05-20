import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LDAPConnectionDocument = HydratedDocument<LDAP>;
@Schema({ collection: 'connection' })
export class LDAP {
  system: string;

  @Prop({ required: true })
  enabled: boolean;

  @Prop({ required: false })
  bindCredentials: string;

  @Prop({ required: false })
  bindDN: string;

  @Prop({ required: false })
  displayAttribute: string;

  @Prop({ required: false })
  searchBase: string;

  @Prop({ required: false })
  url: string;

  @Prop({ required: false })
  usernameAttribute: string;

  @Prop({ required: true, type: [String] })
  defaultGroups: string[];
}

const LDAPConnectionSchema = SchemaFactory.createForClass(LDAP);

export { LDAPConnectionSchema };
