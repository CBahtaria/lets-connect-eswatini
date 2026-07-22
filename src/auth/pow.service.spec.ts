import { ProofOfWorkService } from './pow.service';

describe('ProofOfWorkService', () => {
  const pow = new ProofOfWorkService();

  it('should reject invalid solution format', () => {
    expect(pow.verify('')).toBe(false);
    expect(pow.verify('no-colon')).toBe(false);
    expect(pow.verify(':')).toBe(false);
  });

  it('should generate a challenge string', () => {
    const ch = pow.challenge();
    expect(ch).toMatch(/^lce-pow:[a-f0-9]+$/);
  });
});
