import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { ProofOfWorkService } from './pow.service';

const JWT_SECRET = process.env.JWT_SECRET ?? 'lce-dev-secret-change-in-prod';
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? '24h';

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: JWT_EXPIRES as any } }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, ProofOfWorkService],
  exports: [AuthService],
})
export class AuthModule {}
