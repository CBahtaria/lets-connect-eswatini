import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';
import { MalwareEngineService } from './malware-engine.service';
import { SpamClassifierService } from './spam-classifier.service';

@Module({
  imports: [AuthModule],
  providers: [ModerationService, MalwareEngineService, SpamClassifierService],
  controllers: [ModerationController],
  exports: [ModerationService, MalwareEngineService, SpamClassifierService],
})
export class ModerationModule {}
