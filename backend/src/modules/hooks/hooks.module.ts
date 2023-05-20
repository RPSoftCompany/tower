import { Module } from '@nestjs/common';
import { HooksService } from './hooks.service';
import { HooksController } from './hooks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Audit, AuditsSchema } from '../audits/audits.schema';
import { Hook, HookSchema } from './hooks.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hook.name, schema: HookSchema },
      { name: Audit.name, schema: AuditsSchema },
    ]),
  ],
  controllers: [HooksController],
  providers: [HooksService],
  exports: [HooksService],
})
export class HooksModule {}
