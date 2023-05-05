import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create-member.dto';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  id: string;
}
