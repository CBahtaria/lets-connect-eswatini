import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { ProofOfWorkService } from './pow.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RedisModule } from '../redis/redis.module';
import { UsersModule } from '../users/users.module';
import { User } from '../users/user.entity';

const JWT_SECRET = process.env.JWT_SECRET ?? 'lce-dev-secret-change-in-prod';
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? '24h';

@Module({
  imports: [
    PassportModule,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: JWT_EXPIRES as any } }),
    TypeOrmModule.forFeature([User]),
    RedisModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, ProofOfWorkService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
