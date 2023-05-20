import { IsDefined, IsEnum, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum HttpMethods {
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  GET = 'GET',
  HEAD = 'HEAD',
  DELETE = 'DELETE',
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
}
export class AddHookDto {
  @IsString()
  _id: string;

  @IsString()
  url: string;

  @IsString()
  template: string;

  @IsString()
  @IsEnum(HttpMethods)
  method: string;

  @IsDefined()
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
