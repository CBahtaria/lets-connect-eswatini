import { ModerationService } from './moderation.service';

describe('ModerationService', () => {
  const service = new ModerationService();

  it('should allow empty content immediately', () => {
    const result = service.fastCheck({ contentId: 'c1', contentType: 'post', contentText: '', authorId: 'u1' });
    expect(result.verdict).toBe('ALLOW');
    expect(result.escalatedToNats).toBe(false);
  });

  it('should escalate non-empty content to NATS', () => {
    const result = service.fastCheck({ contentId: 'c2', contentType: 'post', contentText: 'Hello world', authorId: 'u1' });
    expect(result.verdict).toBe('ALLOW');
    expect(result.escalatedToNats).toBe(true);
  });
});
