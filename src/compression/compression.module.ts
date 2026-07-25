import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CompressionService } from './compression.service';
import { MitochondrionNode } from './mitochondrion.node';
import { CompressionController } from './compression.controller';

@Module({
  imports: [AuthModule],
  providers: [CompressionService, MitochondrionNode],
  controllers: [CompressionController],
  exports: [CompressionService, MitochondrionNode],
})
export class CompressionModule {}
