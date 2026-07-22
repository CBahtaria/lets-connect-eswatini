import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class RequestOtpDto {
  @IsString() phone!: string;
  @IsString() powSolution!: string;
}

class VerifyOtpDto {
  @IsString() phone!: string;
  @IsString() @MinLength(6) code!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('request-otp')
  @HttpCode(200)
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto.phone, dto.powSolution);
  }

  @Post('verify-otp')
  @HttpCode(200)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.phone, dto.code);
  }
}
