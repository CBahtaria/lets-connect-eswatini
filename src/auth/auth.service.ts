import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { OtpService } from './otp.service';
import { ProofOfWorkService } from './pow.service';

const BCRYPT_ROUNDS = 12;
const OTP_BAN_THRESHOLD = 3;
const OTP_BAN_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

@Injectable()
export class AuthService {
  // In-memory OTP failure tracking (replace with Redis in production)
  private readonly otpFailures = new Map<string, { count: number; since: number }>();
  private readonly bannedUntil = new Map<string, number>();

  constructor(
    private readonly jwt: JwtService,
    private readonly otp: OtpService,
    private readonly pow: ProofOfWorkService,
  ) {}

  async requestOtp(phone: string, powSolution: string): Promise<{ challenge: string }> {
    // 1. Verify proof-of-work
    if (!this.pow.verify(powSolution)) {
      throw new UnauthorizedException('Invalid proof-of-work solution');
    }
    // 2. Check ban
    const bannedUntilTs = this.bannedUntil.get(phone);
    if (bannedUntilTs && Date.now() < bannedUntilTs) {
      throw new UnauthorizedException('Too many OTP failures. Account temporarily banned.');
    }
    // 3. Issue OTP (simulated — real impl sends SMS via MTN MoMo API)
    const challenge = await this.otp.issue(phone);
    return { challenge };
  }

  async verifyOtp(phone: string, code: string): Promise<{ access_token: string }> {
    const valid = await this.otp.verify(phone, code);
    if (!valid) {
      this.recordOtpFailure(phone);
      throw new UnauthorizedException('Invalid OTP');
    }
    this.clearOtpFailures(phone);
    const payload = { sub: phone, iat: Math.floor(Date.now() / 1000) };
    return { access_token: this.jwt.sign(payload) };
  }

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
  }

  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  private recordOtpFailure(phone: string): void {
    const now = Date.now();
    const record = this.otpFailures.get(phone);
    if (!record || now - record.since > OTP_BAN_WINDOW_MS) {
      this.otpFailures.set(phone, { count: 1, since: now });
    } else {
      record.count += 1;
      if (record.count >= OTP_BAN_THRESHOLD) {
        this.bannedUntil.set(phone, now + 60 * 60 * 1000); // 1-hour ban
        this.otpFailures.delete(phone);
      }
    }
  }

  private clearOtpFailures(phone: string): void {
    this.otpFailures.delete(phone);
    this.bannedUntil.delete(phone);
  }
}
