import { PartialType } from '@nestjs/swagger';
import { CreateAuditDto } from './create-audit.dto';

export class UpdateAuditDto extends PartialType(CreateAuditDto) {}
