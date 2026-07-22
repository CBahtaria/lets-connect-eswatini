import { Test } from '@nestjs/testing';
import { CompressionService } from './compression.service';

describe('CompressionService', () => {
  let service: CompressionService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({ providers: [CompressionService] }).compile();
    service = module.get(CompressionService);
  });

  it('should compress and decompress correctly', async () => {
    const input = Buffer.from('Hello Eswatini! '.repeat(100));
    const packet = await service.compress(input);
    expect(packet.algorithm).toBe('brotli');
    expect(packet.compressionRatio).toBeGreaterThan(1.0);
    const restored = await service.decompress(packet);
    expect(restored.equals(input)).toBe(true);
  });

  it('should return higher ratio for repetitive content', async () => {
    const repetitive = Buffer.from('a'.repeat(10000));
    const packet = await service.compress(repetitive);
    expect(packet.compressionRatio).toBeGreaterThan(5.0);
  });
});
