import { IsArray, IsBoolean, IsString } from 'class-validator';

class ConstantVariableObject {
  @IsString()
  name: string;

  value: string | number | Array<string> | boolean | null | undefined;

  @IsString()
  type: string;

  @IsBoolean()
  forced: boolean;

  @IsBoolean()
  addIfAbsent: boolean;
}

export class CreateConstantVariableDto {
  @IsArray()
  variables: ConstantVariableObject[];

  [x: string]: unknown;
}
