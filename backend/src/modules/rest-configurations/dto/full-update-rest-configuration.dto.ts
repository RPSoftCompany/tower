import { IsNumber, IsString } from 'class-validator';

export class FullUpdateRestConfigurationDto {
  _id?: string;

  @IsString()
  url: string;

  @IsString()
  returnType: string;

  @IsString()
  template: string;

  @IsNumber()
  sequenceNumber: number;
}
