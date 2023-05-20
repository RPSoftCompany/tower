import { IsArray, IsString } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  base: string;

  @IsString()
  fromModel: string;

  @IsArray()
  toModels: string[];
}
