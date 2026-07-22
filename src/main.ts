import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({ origin: process.env.CORS_ORIGINS?.split(',') ?? '*' });
  await app.listen(PORT);
  console.log(`LCE backend running on port ${PORT}`);
}
bootstrap();
