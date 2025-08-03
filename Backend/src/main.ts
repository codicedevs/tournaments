import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import * as fs from "fs";
/**
 * Obtiene la configuración del protocolo del servidor, http o https según si encuentra los certificados o no.
 * @returns Devuelve los parámetros para la configuración del protocolo
 */
export function getProtocolConfig() {
  let key: string | Buffer = '';
  let cert: string | Buffer = '';
  let protocol: 'http' | 'https' | undefined;
  if (process.env.SSL_PRIVATE_KEY && process.env.SSL_CERT)
    try {
      key = fs.readFileSync(process.env.SSL_PRIVATE_KEY);
      cert = fs.readFileSync(process.env.SSL_CERT);
      protocol = 'https';
    } catch (error) {
      protocol = undefined;
      console.error(error);
    }
  if (!protocol) {
    key = '';
    cert = '';
    protocol = 'http';
  }
  return { key, cert, protocol };
}

const { key, cert, protocol } = getProtocolConfig();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    protocol == 'https' ? { httpsOptions: { key, cert } } : undefined,
  );
  // Enable CORS
  app.enableCors();

  // Set up validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Serve static files from the uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Tournaments API')
    .setDescription('The tournaments API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 6969);
}
bootstrap();
