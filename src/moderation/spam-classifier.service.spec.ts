import { SpamClassifierService } from './spam-classifier.service';

describe('SpamClassifierService', () => {
  let service: SpamClassifierService;

  beforeEach(() => {
    service = new SpamClassifierService();
  });

  const cleanFeatures = () => ({
    accountAgeMs: 30 * 24 * 60 * 60 * 1000, // 30 days old
    postVelocity: 1,
    linkDensity: 0.05,
    otpFailures: 0,
    deviceFingerprint: 'fp_abc123',
  });

  it('clean established account returns ALLOW with score 0', () => {
    const result = service.classify(cleanFeatures());
    expect(result.verdict).toBe('ALLOW');
    expect(result.score).toBe(0);
  });

  it('3 OTP failures → score >= 40, verdict CHALLENGE or worse', () => {
    const result = service.classify({ ...cleanFeatures(), otpFailures: 3 });
    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(['CHALLENGE', 'SHADOWBAN', 'BLOCK']).toContain(result.verdict);
  });

  it('high link density adds +20 to score', () => {
    const baseline = service.classify(cleanFeatures());
    const withLinks = service.classify({ ...cleanFeatures(), linkDensity: 0.6 });
    expect(withLinks.score - baseline.score).toBe(20);
  });

  it('fresh account (<5min) + no fingerprint → CHALLENGE or worse', () => {
    const result = service.classify({
      ...cleanFeatures(),
      accountAgeMs: 2 * 60 * 1000, // 2 minutes
      deviceFingerprint: '',
    });
    expect(result.score).toBe(35); // +25 fresh + +10 no fingerprint
    expect(['CHALLENGE', 'SHADOWBAN', 'BLOCK']).toContain(result.verdict);
  });

  it('score exactly 30 → CHALLENGE', () => {
    // +25 new account + +10 no fingerprint - but that's 35
    // To get exactly 30: need only postVelocity + linkDensity = 15+20 = 35, not 30
    // Achievable: accountAgeMs just under 5min (+25) + postVelocity >20 (+15) - but that's 40
    // Simplest: use deviceFingerprint='' (+10) + linkDensity>0.5 (+20) = 30
    const result = service.classify({
      ...cleanFeatures(),
      deviceFingerprint: '',
      linkDensity: 0.6,
    });
    expect(result.score).toBe(30);
    expect(result.verdict).toBe('CHALLENGE');
  });

  it('score exactly 75 → BLOCK', () => {
    // +40 otp + +25 new account + +10 no fingerprint = 75
    const result = service.classify({
      ...cleanFeatures(),
      otpFailures: 3,
      accountAgeMs: 1 * 60 * 1000,
      deviceFingerprint: '',
    });
    expect(result.score).toBe(75);
    expect(result.verdict).toBe('BLOCK');
  });

  it('reason string names top contributing factors', () => {
    const result = service.classify({ ...cleanFeatures(), otpFailures: 5 });
    expect(result.reason).toContain('OTP');
  });

  it('never throws on any valid input', () => {
    const inputs = [
      cleanFeatures(),
      { accountAgeMs: 0, postVelocity: 0, linkDensity: 0, otpFailures: 0, deviceFingerprint: '' },
      { accountAgeMs: Number.MAX_SAFE_INTEGER, postVelocity: 9999, linkDensity: 1, otpFailures: 100, deviceFingerprint: 'x' },
    ];
    for (const f of inputs) {
      expect(() => service.classify(f)).not.toThrow();
    }
  });
});
