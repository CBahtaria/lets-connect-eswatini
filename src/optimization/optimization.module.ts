import { Module } from '@nestjs/common';
import { AdaptiveConfigService } from './adaptive-config.service';
import { AdaptiveConfigController } from './adaptive-config.controller';

@Module({
  providers: [AdaptiveConfigService],
  controllers: [AdaptiveConfigController],
  exports: [AdaptiveConfigService],
})
export class OptimizationModule {}
