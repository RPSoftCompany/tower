import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getRounds, hash } from 'bcrypt';
import { memberType } from './dto/create-member.dto';

export type MemberDocument = HydratedDocument<Member>;
@Schema({ collection: 'member' })
export class Member {
  @Prop({ required: true, unique: true, index: true, type: String })
  username: string;

  @Prop()
  password: string;

  @Prop({ required: true, default: true })
  newUser: boolean;

  @Prop({ default: false })
  technicalUser: boolean;

  @Prop({ required: false })
  display: string;

  @Prop({ required: true, enum: ['local', 'ldap', 'openId'] })
  type: string;

  @Prop({ type: [String], required: true })
  groups: string[];

  @Prop()
  blocked: boolean;
}

const MemberSchema = SchemaFactory.createForClass(Member);

MemberSchema.pre('save', async function () {
  if (this.type !== 'ldap') {
    try {
      // Validate if hash was set already
      getRounds(this.password);
    } catch (e) {
      this.password = await hash(this.password, 10);
    }
  }

  // Prevent admin user from any modifications
  if (this.username === 'admin') {
    this.type = memberType.LOCAL;
    this.blocked = false;
    this.technicalUser = false;
    this.display = 'admin';
  }
});

export { MemberSchema };
