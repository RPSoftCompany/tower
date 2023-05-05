import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBaseConfigurationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  sequenceNumber: number;

  icon?: string;
}
