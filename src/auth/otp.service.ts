import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class OtpService {
  private readonly store = new Map<string, { code: string; expiresAt: number }>();

  async issue(phone: string): Promise<string> {
    const code = crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();
    this.store.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS });
    // In production: send via MTN MoMo SMS API
    // For development: log to console (never in prod)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV OTP] ${phone}: ${code}`);
    }
    return 'otp-issued'; // challenge token (not the code itself)
  }

  async verify(phone: string, code: string): Promise<boolean> {
    const record = this.store.get(phone);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      this.store.delete(phone);
      return false;
    }
    const valid = crypto.timingSafeEqual(Buffer.from(record.code), Buffer.from(code));
    if (valid) this.store.delete(phone);
    return valid;
  }
}
