import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Profile } from '../users/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [User, Profile],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: ['error'] as ['error'],
      }),
    }),
  ],
})
export class DatabaseModule {}
