import { Test } from '@nestjs/testing';
import { CompressionService } from './compression.service';
import { MitochondrionNode } from './mitochondrion.node';

describe('MitochondrionNode', () => {
  let mito: MitochondrionNode;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CompressionService, MitochondrionNode],
    }).compile();
    mito = module.get(MitochondrionNode);
  });

  it('should process a message payload', async () => {
    const packet = await mito.process({ clientId: 'user-1', contentType: 'message', data: 'Hello Eswatini!' });
    expect(packet.packetId).toBeTruthy();
    expect(packet.natsSubject).toBe('lce.v1.mito.message');
    expect(packet.embeddingStub).toHaveLength(384);
    expect(packet.compressed.compressionRatio).toBeGreaterThan(0);
  });

  it('should route different content types to different NATS subjects', async () => {
    const post = await mito.process({ clientId: 'u1', contentType: 'post', data: 'test' });
    const telemetry = await mito.process({ clientId: 'u1', contentType: 'telemetry', data: '{"x":1}' });
    expect(post.natsSubject).toBe('lce.v1.mito.post');
    expect(telemetry.natsSubject).toBe('lce.v1.mito.telemetry');
  });

  it('should reject oversized payload', async () => {
    const huge = 'x'.repeat(1024 * 1024 + 1);
    await expect(mito.process({ clientId: 'u1', contentType: 'post', data: huge })).rejects.toThrow('too large');
  });

  it('should produce deterministic embeddings for same content', async () => {
    const p1 = await mito.process({ clientId: 'u1', contentType: 'post', data: 'same' });
    const p2 = await mito.process({ clientId: 'u2', contentType: 'post', data: 'same' });
    expect(p1.embeddingStub).toEqual(p2.embeddingStub);
  });
});
