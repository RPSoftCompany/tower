import { IsNumber, IsString } from 'class-validator';

export class CreateRestConfigurationDto {
  @IsString()
  url: string;

  @IsString()
  returnType: string;

  @IsString()
  template: string;

  @IsNumber()
  sequenceNumber: number;
}
