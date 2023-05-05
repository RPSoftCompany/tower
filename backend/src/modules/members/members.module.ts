import { Global, Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberSchema } from './member.schema';
import { Audit, AuditsSchema } from '../audits/audits.schema';
import {
  Connection,
  ConnectionSchema,
} from '../connections/connections.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Member.name, schema: MemberSchema },
      { name: Audit.name, schema: AuditsSchema },
      { name: Connection.name, schema: ConnectionSchema },
    ]),
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
