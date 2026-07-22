import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ModerationService } from './moderation.service';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderation: ModerationService) {}

  @Post('check')
  @HttpCode(200)
  check(@Body() body: { contentId: string; contentType: string; contentText: string; authorId: string }) {
    return this.moderation.fastCheck({
      contentId: body.contentId ?? 'unknown',
      contentType: body.contentType ?? 'post',
      contentText: body.contentText ?? '',
      authorId: body.authorId ?? 'anonymous',
    });
  }
}
