import { Module } from '@nestjs/common';
import { CompressionService } from './compression.service';
import { MitochondrionNode } from './mitochondrion.node';
import { CompressionController } from './compression.controller';

@Module({
  providers: [CompressionService, MitochondrionNode],
  controllers: [CompressionController],
  exports: [CompressionService, MitochondrionNode],
})
export class CompressionModule {}
