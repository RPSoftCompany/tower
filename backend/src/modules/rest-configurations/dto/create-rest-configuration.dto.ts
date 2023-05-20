import { IsEnum, IsNumber, IsString } from 'class-validator';

export enum ReturnType {
  JSON = 'json',
  XML = 'xml',
  PLAIN = 'plain text',
}
export class CreateRestConfigurationDto {
  @IsString()
  url: string;

  @IsEnum(ReturnType)
  returnType: ReturnType;

  @IsString()
  template: string;

  @IsNumber()
  sequenceNumber: number;
}
