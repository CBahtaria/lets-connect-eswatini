import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, JetStreamManager } from 'nats';

const STREAM_NAME = 'lce-v1';
const STREAM_SUBJECTS = ['lce.v1.>'];

@Injectable()
export class NatsService implements OnModuleInit {
  private readonly logger = new Logger(NatsService.name);

  async onModuleInit(): Promise<void> {
    await this.initStream();
  }

  private async initStream(): Promise<void> {
    try {
      const nc = await connect({ servers: process.env.NATS_URL ?? 'nats://localhost:4222' });
      const jsm: JetStreamManager = await nc.jetstreamManager();
      try {
        await jsm.streams.info(STREAM_NAME);
        this.logger.log(`NATS JetStream stream ${STREAM_NAME} already exists`);
      } catch {
        // Stream does not exist — create it
        await jsm.streams.add({ name: STREAM_NAME, subjects: STREAM_SUBJECTS });
        this.logger.log(`NATS JetStream stream ${STREAM_NAME} initialized with subjects ${STREAM_SUBJECTS.join(', ')}`);
      }
      await nc.drain();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // NATS unavailable at startup is non-fatal — log and continue
      this.logger.warn(`NATS not available: ${msg}`);
    }
  }
}
