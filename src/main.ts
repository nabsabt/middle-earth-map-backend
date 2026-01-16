import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { join, resolve } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  /*  if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: join(__dirname, '../../.env') });
  } */
  dotenv.config({ path: join(__dirname, '../../.env') });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  //when prod, and frontend/backend has the same URL, origin can be removed
  app.enableCors({
    origin: '*',
    //credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  //const uploadsDir = resolve(process.cwd(), '../uploads');
  const uploadsDir =
    process.env.UPLOADS_DIR ?? resolve(process.cwd(), '../uploads');
  // images will be reachable at: /uploads/images/1003/foo.jpg
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  Logger.log(
    `Application is running on: ${process.env.SERVER_URL}:${process.env.PORT ?? 3000}/${globalPrefix}. Status: ${process.env.NODE_ENV}`,
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
