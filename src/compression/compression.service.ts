import { Injectable } from '@nestjs/common';
import * as zlib from 'zlib';
import { promisify } from 'util';

const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);
const BROTLI_QUALITY = 4; // balance speed vs ratio for real-time data

export interface CompressedPacket {
  algorithm: 'brotli';
  originalBytes: number;
  compressedBytes: number;
  compressionRatio: number;
  data: Buffer;
  timestamp: number;
}

@Injectable()
export class CompressionService {
  async compress(input: Buffer | string): Promise<CompressedPacket> {
    const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
    const compressed = await brotliCompress(buf, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY },
    });
    return {
      algorithm: 'brotli',
      originalBytes: buf.byteLength,
      compressedBytes: compressed.byteLength,
      compressionRatio: buf.byteLength / Math.max(compressed.byteLength, 1),
      data: compressed,
      timestamp: Date.now(),
    };
  }

  async decompress(packet: CompressedPacket): Promise<Buffer> {
    return brotliDecompress(packet.data);
  }
}
