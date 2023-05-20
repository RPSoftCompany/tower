import { IsArray, IsNotEmpty, IsString } from 'class-validator';

class ConfigurationModelRule {
  @IsNotEmpty()
  @IsString()
  _id: string;

  @IsNotEmpty()
  @IsString()
  targetValue: string;

  @IsNotEmpty()
  @IsString()
  targetType: string;
  targetRegEx: boolean;

  @IsNotEmpty()
  @IsString()
  conditionValue: string;

  @IsNotEmpty()
  @IsString()
  conditionType: string;
  conditionRegEx: boolean;

  @IsNotEmpty()
  @IsString()
  error: string;
}

export class CreateConfigurationModelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  rules: ConfigurationModelRule[];

  @IsArray()
  restrictions: any[];

  @IsNotEmpty()
  @IsString()
  base: string;

  options: {
    hasRestrictions: boolean;
  };
}
