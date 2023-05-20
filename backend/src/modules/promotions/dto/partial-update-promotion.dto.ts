import { PartialType } from '@nestjs/swagger';
import { CreatePromotionDto } from './create-promotion.dto';

export class PartialUpdatePromotionDto extends PartialType(CreatePromotionDto) {
  _id?: string;
}
