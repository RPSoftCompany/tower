import { IsArray, IsString } from 'class-validator';

class ConfigurationVariable {
  @IsString()
  name: string;

  value: string | number | Array<string> | boolean | null | undefined;

  @IsString()
  type: string;
}

export class CreateConfigurationDto {
  @IsArray()
  variables: ConfigurationVariable[];

  draft?: boolean;

  [x: string]: unknown;
}
