import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { OtpService } from './otp.service';
import { ProofOfWorkService } from './pow.service';
import { UsersService } from '../users/users.service';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly otp: OtpService,
    private readonly pow: ProofOfWorkService,
    private readonly users: UsersService,
  ) {}

  async requestOtp(phone: string, powSolution: string): Promise<{ challenge: string }> {
    if (!this.pow.verify(powSolution)) {
      throw new UnauthorizedException('Invalid proof-of-work solution');
    }
    if (await this.otp.isBanned(phone)) {
      throw new UnauthorizedException('Too many OTP failures. Account temporarily banned.');
    }
    const challenge = await this.otp.issue(phone);
    return { challenge };
  }

  async verifyOtp(phone: string, code: string): Promise<{ access_token: string }> {
    const valid = await this.otp.verify(phone, code);
    if (!valid) {
      await this.otp.recordFailure(phone);
      throw new UnauthorizedException('Invalid OTP');
    }
    const user = await this.users.findOrCreateByPhone(phone);
    const payload = { sub: user.id, phone: user.phone, iat: Math.floor(Date.now() / 1000) };
    return { access_token: this.jwt.sign(payload) };
  }

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
  }

  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
