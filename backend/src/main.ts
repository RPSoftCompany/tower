/**
 * Main application entry point that configures and bootstraps the NestJS application.
 * Handles SSL, Swagger, OIDC, static file serving, and CORS configurations.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as process from 'process';
import history from 'connect-history-api-fallback';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import * as fs from 'fs';
import { auth } from 'express-openid-connect';

async function bootstrap() {
  // Initialize logger for the application
  const logger = new Logger('Tower');

  // Configure logging level from environment variable or use defaults
  const logLevel = process.env.LOG_LEVEL
    ? JSON.parse(process.env.LOG_LEVEL)
    : ['log', 'error'];

  // Load SSL certificate paths from environment variables
  const sslKey = process.env.SSL_KEY_PATH ? process.env.SSL_KEY_PATH : null;
  const sslCert = process.env.SSL_CERT_PATH ? process.env.SSL_CERT_PATH : null;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: process.env.NODE_ENV === 'development' || process.env.CORS === 'true',
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

  // Configure Swagger documentation with authentication options
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

  // Configure OpenID Connect (OIDC) authentication if all required environment variables are present
  if (
    process.env.OIDC_SECRET_PRIVATE_KEY &&
    process.env.OIDC_SECRET &&
    process.env.OIDC_CALLBACK_HOST &&
    process.env.OIDC_CLIENT_ID &&
    process.env.OIDC_ISSUER_BASE_URL
  ) {
    const ssoConfig = {
      authRequired: false,
      secret: process.env.OIDC_SECRET,
      baseURL: `${sslKey && sslCert ? 'https://' : 'http://'}${process.env.OIDC_CALLBACK_HOST}`,
      clientID: process.env.OIDC_CLIENT_ID,
      issuerBaseURL: process.env.OIDC_ISSUER_BASE_URL,
      routes: {
        callback: '/sso/callback',
      },
    };

    app.getHttpAdapter().use('/sso', auth(ssoConfig));
  }

  // Configure a static file serving for the production environment
  if (process.env.NODE_ENV === 'production') {
    app.use(
      history({
        htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
      }),
    );
    app.use('/', express.static(join(__dirname, '..', 'client')));
  }

  // Enable CORS for a development environment or when explicitly configured
  if (process.env.NODE_ENV === 'development' || process.env.CORS === 'true') {
    logger.debug('CORS enabled');
    app.enableCors({ origin: true, credentials: true });
  }

  // Start the server with a configured port and host
  await app.listen(
    process.env.PORT ? process.env.PORT : 3000,
    process.env.HOST ? process.env.HOST : '::1',
  );
  logger.log(`Tower is running on: ${await app.getUrl()}`);
}
bootstrap().then();
