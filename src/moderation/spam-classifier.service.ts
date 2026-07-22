import { Injectable } from '@nestjs/common';

export type SpamVerdict = 'ALLOW' | 'CHALLENGE' | 'SHADOWBAN' | 'BLOCK';

export interface SpamFeatures {
  accountAgeMs: number;
  postVelocity: number;
  linkDensity: number;
  otpFailures: number;
  deviceFingerprint: string;
}

export interface SpamScore {
  verdict: SpamVerdict;
  score: number;
  reason: string;
}

interface Factor {
  label: string;
  points: number;
}

@Injectable()
export class SpamClassifierService {
  classify(features: SpamFeatures): SpamScore {
    try {
      const factors: Factor[] = [];

      if (features.otpFailures >= 3) {
        factors.push({ label: 'excessive OTP failures', points: 40 });
      }
      if (features.accountAgeMs < 5 * 60 * 1000) {
        factors.push({ label: 'very new account', points: 25 });
      }
      if (features.linkDensity > 0.5) {
        factors.push({ label: 'high link density', points: 20 });
      }
      if (features.postVelocity > 20) {
        factors.push({ label: 'high post velocity', points: 15 });
      }
      if (features.deviceFingerprint === '') {
        factors.push({ label: 'missing device fingerprint', points: 10 });
      }

      const score = Math.min(100, factors.reduce((sum, f) => sum + f.points, 0));

      const verdict = this.toVerdict(score);

      const reason = factors.length === 0
        ? 'no risk signals detected'
        : factors
            .sort((a, b) => b.points - a.points)
            .map((f) => f.label)
            .join(', ');

      return { verdict, score, reason };
    } catch (err: unknown) {
      // Fail safe: unknown input returns maximum suspicion rather than crash
      return { verdict: 'BLOCK', score: 100, reason: `classifier error: ${(err as Error).message}` };
    }
  }

  private toVerdict(score: number): SpamVerdict {
    if (score >= 75) return 'BLOCK';
    if (score >= 50) return 'SHADOWBAN';
    if (score >= 30) return 'CHALLENGE';
    return 'ALLOW';
  }
}
