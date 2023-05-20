class ConfigurationModelRule {
  _id?: string;
  targetValue?: string;
  targetType?: string;
  targetRegEx?: boolean;
  conditionValue?: string;
  conditionType?: string;
  conditionRegEx?: boolean;
  error?: string;
}

export class PartialUpdateConfigurationModelDto {
  _id?: string;
  name?: string;
  rules?: ConfigurationModelRule[];
  restrictions?: any[];
  base?: string;
  options?: {
    hasRestrictions?: boolean;
  };
}
