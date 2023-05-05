import { Module } from '@nestjs/common';
import { AuditsService } from './audits.service';
import { AuditsController } from './audits.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Audit, AuditsSchema } from './audits.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Audit.name, schema: AuditsSchema }]),
  ],
  controllers: [AuditsController],
  providers: [AuditsService],
})
export class AuditsModule {}
