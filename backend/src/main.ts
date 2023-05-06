import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as process from 'process';
import history from 'connect-history-api-fallback';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import * as fs from 'fs';

async function bootstrap() {
  const logLevel = process.env.LOG_LEVEL
    ? JSON.parse(process.env.LOG_LEVEL)
    : ['log', 'error'];

  const sslKey = process.env.SSL_KEY_PATH ? process.env.SSL_KEY_PATH : null;
  const sslCert = process.env.SSL_CERT_PATH ? process.env.SSL_CERT_PATH : null;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: process.env.NODE_ENV === 'development',
    logger: logLevel,
    httpsOptions:
      sslKey && sslCert
        ? {
            key: sslKey ? fs.readFileSync(sslKey) : undefined,
            cert: sslCert ? fs.readFileSync(sslCert) : undefined,
          }
        : undefined,
  });

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Tower Configuration Server')
    .setDescription("Tower Configuration Server's API Specification")
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth({
      type: 'http',
      in: 'header',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('explorer', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(
      history({
        htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
      }),
    );
    app.use('/', express.static(join(__dirname, '..', 'client')));
  }

  if (process.env.NODE_ENV === 'development') {
    app.enableCors({ origin: true, credentials: true });
  }

  await app.listen(
    process.env.PORT ? process.env.PORT : 3000,
    process.env.HOST ? process.env.HOST : '::1',
  );
  console.log(`Tower is running on: ${await app.getUrl()}`);
}
bootstrap().then();
