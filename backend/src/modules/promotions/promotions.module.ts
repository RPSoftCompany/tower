import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Promotion, PromotionSchema } from './promotions.schema';
import { Audit, AuditsSchema } from '../audits/audits.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Promotion.name, schema: PromotionSchema },
      { name: Audit.name, schema: AuditsSchema },
    ]),
  ],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsModule],
})
export class PromotionsModule {}
