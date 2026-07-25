import { Controller, Post, Body, HttpCode, BadRequestException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MitochondrionNode, ClientPayload } from './mitochondrion.node';

@Controller('compress')
export class CompressionController {
  constructor(private readonly mito: MitochondrionNode) {}

  @Post('process')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async process(@Body() body: { clientId: string; contentType: string; data: string }) {
    if (!body.clientId || !body.data) throw new BadRequestException('clientId and data required');
    const payload: ClientPayload = {
      clientId: body.clientId,
      contentType: (body.contentType as ClientPayload['contentType']) ?? 'post',
      data: body.data,
    };
    const packet = await this.mito.process(payload);
    return {
      packetId: packet.packetId,
      natsSubject: packet.natsSubject,
      compressionRatio: packet.compressed.compressionRatio,
      embeddingDim: packet.embeddingStub.length,
      processedAt: packet.processedAt,
    };
  }
}
