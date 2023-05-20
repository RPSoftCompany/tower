import { PartialType } from '@nestjs/swagger';
import { CreateRestConfigurationDto } from './create-rest-configuration.dto';

export class PartialUpdateRestConfigurationDto extends PartialType(
  CreateRestConfigurationDto,
) {
  _id?: string;
}
