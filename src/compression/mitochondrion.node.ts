import { Injectable, Logger } from '@nestjs/common';
import { CompressionService, CompressedPacket } from './compression.service';
import * as crypto from 'crypto';

const MAX_PAYLOAD_BYTES = 1024 * 1024; // 1 MB per packet
const EMBEDDING_STUB_DIM = 384; // placeholder dim until ONNX model wired

export interface ClientPayload {
  clientId: string;
  contentType: 'message' | 'post' | 'file' | 'telemetry';
  data: string | Buffer;
}

export interface ProcessedPacket {
  packetId: string;
  clientId: string;
  contentType: string;
  compressed: CompressedPacket;
  embeddingStub: number[]; // 384-dim float32 (stub until ONNX wired)
  natsSubject: string;
  processedAt: number;
}

@Injectable()
export class MitochondrionNode {
  private readonly logger = new Logger(MitochondrionNode.name);

  constructor(private readonly compression: CompressionService) {}

  /**
   * Process a client payload through the mitochondrion pipeline:
   * 1. Validate size
   * 2. Compress (brotli)
   * 3. Generate embedding stub (stub until ONNX embedding server wired)
   * 4. Return ProcessedPacket for NATS publish
   */
  async process(payload: ClientPayload): Promise<ProcessedPacket> {
    const raw = typeof payload.data === 'string'
      ? Buffer.from(payload.data, 'utf8')
      : payload.data;

    if (raw.byteLength > MAX_PAYLOAD_BYTES) {
      throw new Error(`Payload too large: ${raw.byteLength} > ${MAX_PAYLOAD_BYTES} bytes`);
    }

    const compressed = await this.compression.compress(raw);
    const embeddingStub = this.generateEmbeddingStub(raw);
    const packetId = crypto.randomUUID();

    this.logger.debug(
      `mitochondrion processed ${payload.contentType} for ${payload.clientId}: ` +
      `${raw.byteLength}B → ${compressed.compressedBytes}B (ratio ${compressed.compressionRatio.toFixed(2)}x)`
    );

    return {
      packetId,
      clientId: payload.clientId,
      contentType: payload.contentType,
      compressed,
      embeddingStub,
      natsSubject: `lce.v1.mito.${payload.contentType}`,
      processedAt: Date.now(),
    };
  }

  /**
   * Stub embedding: deterministic float32 vector from SHA-256 of content.
   * Replace with real ONNX embedding server call when brain/embedding_server is wired.
   */
  private generateEmbeddingStub(content: Buffer): number[] {
    const hash = crypto.createHash('sha256').update(content).digest();
    // Expand 32-byte hash to 384 floats via simple interpolation
    const embedding: number[] = new Array(EMBEDDING_STUB_DIM);
    for (let i = 0; i < EMBEDDING_STUB_DIM; i++) {
      embedding[i] = (hash[i % 32] / 255.0) * 2.0 - 1.0; // normalise to [-1, 1]
    }
    return embedding;
  }

  computeStats(): { totalProcessed: number; avgRatio: number } {
    // Stats would be tracked in Redis in production
    return { totalProcessed: 0, avgRatio: 0 };
  }
}
