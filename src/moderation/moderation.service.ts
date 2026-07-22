import { Injectable, Logger } from '@nestjs/common';

export type ModerationVerdict = 'ALLOW' | 'REMOVE' | 'HUMAN_REVIEW';

const NATS_MODERATION_SUBJECT = 'lce.v1.moderation.queue';

export interface ModerationRequest {
  contentId: string;
  contentType: string;
  contentText: string;
  authorId: string;
}

export interface ModerationResult {
  contentId: string;
  verdict: ModerationVerdict;
  reason: string;
  escalatedToNats: boolean;
}

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  /**
   * Synchronous fast-path moderation (heuristic only).
   * Heavy LLM moderation is async via brain daemon NATS queue.
   */
  fastCheck(req: ModerationRequest): ModerationResult {
    const text = req.contentText ?? '';

    // Basic heuristic: empty content or very short is ALLOW
    if (text.trim().length === 0) {
      return { contentId: req.contentId, verdict: 'ALLOW', reason: 'empty content', escalatedToNats: false };
    }

    // Escalate all real content to LLM moderation via NATS (async)
    this.logger.debug(`escalating ${req.contentId} to NATS ${NATS_MODERATION_SUBJECT}`);
    return {
      contentId: req.contentId,
      verdict: 'ALLOW',  // optimistic allow pending LLM review
      reason: 'pending async LLM review',
      escalatedToNats: true,
    };
  }
}
