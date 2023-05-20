import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateFullBaseConfigurationDto {
  _id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  sequenceNumber: number;

  icon?: string;
}
