import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { ProofOfWorkService } from './pow.service';
import { UsersService } from '../users/users.service';

// Stub out OtpService entirely so no ioredis import is attempted
jest.mock('./otp.service', () => ({
  OtpService: jest.fn().mockImplementation(() => ({
    issue: jest.fn().mockResolvedValue('otp-issued'),
    verify: jest.fn().mockResolvedValue(false),
    isBanned: jest.fn().mockResolvedValue(false),
    recordFailure: jest.fn().mockResolvedValue(undefined),
    storeOtp: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Stub UsersService so no typeorm import is attempted
jest.mock('../users/users.service', () => ({
  UsersService: jest.fn().mockImplementation(() => ({
    findOrCreateByPhone: jest.fn().mockResolvedValue({ id: 'uuid-1', phone: '+26812345678', verified: true }),
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { OtpService } = require('./otp.service');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { UsersService: MockUsersService } = require('../users/users.service');

describe('AuthService', () => {
  let service: AuthService;
  let pow: ProofOfWorkService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        ProofOfWorkService,
        { provide: OtpService, useValue: new OtpService() },
        { provide: JwtService, useValue: { sign: () => 'test-token' } },
        { provide: MockUsersService, useValue: new MockUsersService() },
      ],
    }).compile();
    service = module.get(AuthService);
    pow = module.get(ProofOfWorkService);
    void pow;
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
