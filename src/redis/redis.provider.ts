import Redis from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const redisProvider = {
  provide: REDIS_CLIENT,
  useFactory: (): Redis => {
    const client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    client.on('connect', () => console.log('Redis connected'));
    client.on('error', (err: Error) => console.error('Redis error', err.message));
    return client;
  },
};
