import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

const POW_DIFFICULTY_BITS = 20; // 2^20 ≈ 1M iterations client-side
const POW_PREFIX_ZEROS = Math.floor(POW_DIFFICULTY_BITS / 4); // hex leading zeros

@Injectable()
export class ProofOfWorkService {
  /**
   * Verify client-submitted PoW solution.
   * Solution format: "nonce:sha256hash" where hash starts with POW_PREFIX_ZEROS zeros.
   * The client must find a nonce such that SHA256("lce-pow:" + nonce) starts with the prefix.
   */
  verify(solution: string): boolean {
    if (!solution || !solution.includes(':')) return false;
    const [nonce, submittedHash] = solution.split(':', 2);
    if (!nonce || !submittedHash) return false;
    try {
      const hash = crypto.createHash('sha256').update(`lce-pow:${nonce}`).digest('hex');
      const valid = hash.startsWith('0'.repeat(POW_PREFIX_ZEROS));
      return valid && hash === submittedHash;
    } catch {
      return false;
    }
  }

  /** Generate a new PoW challenge string for the client. */
  challenge(): string {
    return `lce-pow:${crypto.randomBytes(16).toString('hex')}`;
  }
}
