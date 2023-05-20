import {
  IsArray,
  IsDefined,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { HttpMethods } from './add-hook.dto';
import { Type } from 'class-transformer';

export class UpdateHookDto {
  @IsString()
  _id: string;

  @IsString()
  url: string;

  @IsString()
  template: string;

  @IsString()
  @IsEnum(HttpMethods)
  method: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HookObjectHeader)
  headers: HookObjectHeader[];
}

class HookObjectHeader {
  @IsString()
  name: string;

  @IsDefined()
  value: string;
}
