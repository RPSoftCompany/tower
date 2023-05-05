import { PartialType } from '@nestjs/swagger';
import { CreateConfigurationModelDto } from './create-configuration-model.dto';

export class UpdateConfigurationModelDto extends PartialType(
  CreateConfigurationModelDto,
) {
  _id?: string;
}
