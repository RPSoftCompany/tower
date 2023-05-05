import { PartialType } from '@nestjs/swagger';
import { CreateLDAPConnectionDto } from './create-connection.dto';

export class UpdateConnectionDto extends PartialType(CreateLDAPConnectionDto) {}
