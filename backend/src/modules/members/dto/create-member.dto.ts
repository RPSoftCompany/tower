export class CreateMemberDto {
  username: string;
  password?: string;
  newUser: boolean;
  technicalUser: boolean;
  display: string;
  type?: memberType;
  groups?: string[];
  blocked?: boolean;
}

export enum memberType {
  LOCAL = 'local',
  LDAP = 'ldap',
  OPEN_ID = 'openId',
}
