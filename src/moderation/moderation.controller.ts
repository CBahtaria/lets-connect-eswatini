import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ModerationService } from './moderation.service';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderation: ModerationService) {}

  @Post('check')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  check(@Body() body: { contentId: string; contentType: string; contentText: string; authorId: string }) {
    return this.moderation.fastCheck({
      contentId: body.contentId ?? 'unknown',
      contentType: body.contentType ?? 'post',
      contentText: body.contentText ?? '',
      authorId: body.authorId ?? 'anonymous',
    });
  }
}
