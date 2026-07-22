import { Controller, Get, Post, Param } from '@nestjs/common';
import { AdaptiveConfigService } from './adaptive-config.service';

@Controller('api/adaptive')
export class AdaptiveConfigController {
  constructor(private readonly adaptiveConfig: AdaptiveConfigService) {}

  @Get('pending')
  getPending() {
    return this.adaptiveConfig.getPending();
  }

  @Post('approve/:id')
  approve(@Param('id') id: string) {
    return { approved: this.adaptiveConfig.approve(id) };
  }

  @Post('reject/:id')
  reject(@Param('id') id: string) {
    return { rejected: this.adaptiveConfig.reject(id) };
  }
}
