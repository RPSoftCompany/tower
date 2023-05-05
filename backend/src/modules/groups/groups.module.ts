import { Global, Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './groups.schema';
import { RolesModule } from '../roles/roles.module';
import { Audit, AuditsSchema } from '../audits/audits.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Audit.name, schema: AuditsSchema },
    ]),
    RolesModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
