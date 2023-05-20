import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberSchema } from '../../src/modules/members/member.schema';
import { Audit, AuditsSchema } from '../../src/modules/audits/audits.schema';
import { Group, GroupSchema } from '../../src/modules/groups/groups.schema';
import { ConnectionsModule } from '../../src/modules/connections/connections.module';
import { AccessTokenModule } from '../../src/modules/access-token/access-token.module';
import { MembersModule } from '../../src/modules/members/members.module';
import { GroupsModule } from '../../src/modules/groups/groups.module';
import { MembersService } from '../../src/modules/members/members.service';
import { GroupsService } from '../../src/modules/groups/groups.service';
import { memberType } from '../../src/modules/members/dto/create-member.dto';

export const beforeAllHelper = async (
  additionalImports?: any[],
  userRoles?: string[],
) => {
  if (!additionalImports) {
    additionalImports = [];
  }

  if (!userRoles) {
    userRoles = ['admin'];
  }

  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
      }),
      MongooseModule.forRoot(process.env.DATABASE_URL),
      MongooseModule.forFeature([
        { name: Member.name, schema: MemberSchema },
        { name: Audit.name, schema: AuditsSchema },
        { name: Group.name, schema: GroupSchema },
      ]),
      ConnectionsModule,
      AccessTokenModule,
      MembersModule,
      GroupsModule,
      ...additionalImports,
    ],
  }).compile();

  const membersService = module.get<MembersService>(MembersService);
  const groupsService = module.get<GroupsService>(GroupsService);

  const group = await groupsService.create({
    name: 'localTestingGroup',
    roles: userRoles,
  });

  const groupId = group._id.toString();

  const user = await membersService.create({
    type: memberType.LOCAL,
    blocked: false,
    display: 'localTest',
    newUser: false,
    password: 'localTest',
    username: 'localTest',
    groups: ['localTestingGroup'],
    technicalUser: false,
  });

  const userId = user._id.toString();

  return {
    membersService,
    groupsService,
    groupId,
    userId,
    module,
  };
};
