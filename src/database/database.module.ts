import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Profile } from '../users/profile.entity';
import { Listing } from '../marketplace/listing.entity';
import { Rfq } from '../marketplace/rfq.entity';
import { Post } from '../posts/post.entity';
import { Content } from '../content/content.entity';
import { CompressionJob } from '../compression/compression-job.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [User, Profile, Listing, Rfq, Post, Content, CompressionJob],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: ['error'] as ['error'],
      }),
    }),
  ],
})
export class DatabaseModule {}
