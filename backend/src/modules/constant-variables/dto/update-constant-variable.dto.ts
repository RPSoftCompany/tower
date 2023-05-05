import { PartialType } from '@nestjs/swagger';
import { CreateConstantVariableDto } from './create-constant-variable.dto';

export class UpdateConstantVariableDto extends PartialType(CreateConstantVariableDto) {}
