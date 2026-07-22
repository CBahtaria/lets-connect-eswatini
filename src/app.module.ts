import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CompressionModule } from './compression/compression.module';
import { ModerationModule } from './moderation/moderation.module';
import { HealthModule } from './health/health.module';
import { OptimizationModule } from './optimization/optimization.module';

@Module({
  imports: [AuthModule, CompressionModule, ModerationModule, HealthModule, OptimizationModule],
})
export class AppModule {}
