import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.provider';

const OTP_LENGTH = 6;
const OTP_TTL_S = 300; // 5 minutes
const BAN_TTL_S = 3600; // 1 hour
const FAIL_TTL_S = 600; // 10 minutes

const otpKey = (phone: string) => `lce:otp:${phone}`;
const banKey = (phone: string) => `lce:ban:${phone}`;
const failKey = (phone: string) => `lce:fail:${phone}`;

@Injectable()
export class OtpService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async issue(phone: string): Promise<string> {
    const code = crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();
    await this.redis.setex(otpKey(phone), OTP_TTL_S, JSON.stringify({ otp: code, createdAt: Date.now() }));
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV OTP] ${phone}: ${code}`);
    }
    return 'otp-issued';
  }

  async verify(phone: string, code: string): Promise<boolean> {
    const raw = await this.redis.get(otpKey(phone));
    if (!raw) return false;
    const record = JSON.parse(raw) as { otp: string; createdAt: number };
    // Pad both to equal length so timingSafeEqual doesn't throw on length mismatch
    const expected = Buffer.from(record.otp.padEnd(OTP_LENGTH, '\0'));
    const provided = Buffer.from(code.padEnd(OTP_LENGTH, '\0'));
    const valid = crypto.timingSafeEqual(expected, provided) && record.otp === code;
    if (valid) await this.redis.del(otpKey(phone));
    return valid;
  }

  async isBanned(phone: string): Promise<boolean> {
    const val = await this.redis.get(banKey(phone));
    return val !== null;
  }

  async recordFailure(phone: string): Promise<void> {
    const key = failKey(phone);
    const count = await this.redis.incr(key);
    // Set TTL on first increment only
    if (count === 1) await this.redis.expire(key, FAIL_TTL_S);
    if (count >= 3) {
      await this.redis.setex(banKey(phone), BAN_TTL_S, '1');
      await this.redis.del(key);
    }
  }

  async storeOtp(phone: string, code: string): Promise<void> {
    await this.redis.setex(otpKey(phone), OTP_TTL_S, JSON.stringify({ otp: code, createdAt: Date.now() }));
  }
}
