import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { ProofOfWorkService } from './pow.service';

describe('AuthService', () => {
  let service: AuthService;
  let pow: ProofOfWorkService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService, OtpService, ProofOfWorkService,
        { provide: JwtService, useValue: { sign: () => 'test-token' } },
      ],
    }).compile();
    service = module.get(AuthService);
    pow = module.get(ProofOfWorkService);
  });

  it('should reject invalid PoW on requestOtp', async () => {
    await expect(service.requestOtp('+26812345678', 'bad-pow')).rejects.toThrow('proof-of-work');
  });

  it('should reject wrong OTP on verifyOtp', async () => {
    await expect(service.verifyOtp('+26812345678', '000000')).rejects.toThrow('Invalid OTP');
  });

  it('should hash and compare passwords', async () => {
    const hash = await service.hashPassword('secret');
    expect(await service.comparePassword('secret', hash)).toBe(true);
    expect(await service.comparePassword('wrong', hash)).toBe(false);
  });
});
