import { memberType } from './create-member.dto';

export class UpsertMemberDto {
  id?: string;
  username?: string;
  password?: string;
  newUser?: boolean;
  technicalUser?: boolean;
  display?: string;
  type?: memberType;
  groups?: string[];
  blocked?: boolean;
}
