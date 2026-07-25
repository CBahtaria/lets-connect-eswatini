import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdaptiveConfigService } from './adaptive-config.service';
import { AdaptiveConfigController } from './adaptive-config.controller';

@Module({
  imports: [AuthModule],
  providers: [AdaptiveConfigService],
  controllers: [AdaptiveConfigController],
  exports: [AdaptiveConfigService],
})
export class OptimizationModule {}
