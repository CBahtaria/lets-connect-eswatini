import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdaptiveConfigService } from './adaptive-config.service';

@Controller('api/adaptive')
export class AdaptiveConfigController {
  constructor(private readonly adaptiveConfig: AdaptiveConfigService) {}

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  getPending() {
    return this.adaptiveConfig.getPending();
  }

  @Post('approve/:id')
  @UseGuards(JwtAuthGuard)
  approve(@Param('id') id: string) {
    return { approved: this.adaptiveConfig.approve(id) };
  }

  @Post('reject/:id')
  @UseGuards(JwtAuthGuard)
  reject(@Param('id') id: string) {
    return { rejected: this.adaptiveConfig.reject(id) };
  }
}
