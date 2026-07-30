import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CompressionModule } from './compression/compression.module';
import { ModerationModule } from './moderation/moderation.module';
import { HealthModule } from './health/health.module';
import { OptimizationModule } from './optimization/optimization.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { PostsModule } from './posts/posts.module';
import { NatsModule } from './nats/nats.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    UsersModule,
    AuthModule,
    CompressionModule,
    ModerationModule,
    HealthModule,
    OptimizationModule,
    MarketplaceModule,
    PostsModule,
    NatsModule,
  ],
})
export class AppModule {}
