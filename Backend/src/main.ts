import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import './settings'; // Importar settings para cargar las variables de entorno

import * as fs from 'fs';
/**
 * Obtiene la configuración del protocolo del servidor, http o https según si encuentra los certificados o no.
 * @returns Devuelve los parámetros para la configuración del protocolo
 */
export function getProtocolConfig() {
  let key: string | Buffer = '';
  let cert: string | Buffer = '';
  let protocol: 'http' | 'https' | undefined;

  if (process.env.SSL_PRIVATE_KEY && process.env.SSL_CERT) {
    // Verificar si los archivos existen
    try {
      const keyExists = fs.existsSync(process.env.SSL_PRIVATE_KEY);
      const certExists = fs.existsSync(process.env.SSL_CERT);

      console.log('🔍 Verificando existencia de archivos:');
      console.log(
        `  - Private Key (${process.env.SSL_PRIVATE_KEY}): ${keyExists ? '✅ Existe' : '❌ No existe'}`,
      );
      console.log(
        `  - Certificate (${process.env.SSL_CERT}): ${certExists ? '✅ Existe' : '❌ No existe'}`,
      );

      if (!keyExists || !certExists) {
        throw new Error(
          `Archivos SSL no encontrados: Key=${keyExists}, Cert=${certExists}`,
        );
      }

      // Verificar permisos de lectura
      try {
        fs.accessSync(process.env.SSL_PRIVATE_KEY, fs.constants.R_OK);
        fs.accessSync(process.env.SSL_CERT, fs.constants.R_OK);
        console.log('✅ Permisos de lectura verificados');
      } catch (accessError) {
        console.error('❌ Error de permisos:', accessError);
        throw accessError;
      }

      // Intentar leer los archivos
      console.log('📖 Intentando leer archivos SSL...');
      key = fs.readFileSync(process.env.SSL_PRIVATE_KEY);
      cert = fs.readFileSync(process.env.SSL_CERT);

      console.log(`✅ Archivos SSL leídos correctamente:`);
      console.log(`  - Private Key size: ${key.length} bytes`);
      console.log(`  - Certificate size: ${cert.length} bytes`);

      protocol = 'https';
      console.log('✅ Protocolo configurado como HTTPS');
    } catch (error) {
      protocol = undefined;
      console.error('❌ Error al procesar archivos SSL:', error);
      console.error('❌ Detalles del error:', error.message);
    }
  } else {
    console.log('❌ Variables de entorno SSL no encontradas');
  }

  if (!protocol) {
    key = '';
    cert = '';
    protocol = 'http';
    console.log('⚠️ Configurando protocolo como HTTP');
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
  app.enableCors({
    origin: true, // Permite todos los orígenes en desarrollo
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Middleware para forzar HTTPS
  app.use((req, res, next) => {
    // Log para diagnosticar problemas móviles
    console.log(`📱 Request: ${req.method} ${req.url}`);
    console.log(`📱 User-Agent: ${req.headers['user-agent']}`);
    console.log(`📱 Origin: ${req.headers.origin}`);
    console.log(`📱 Host: ${req.headers.host}`);
    console.log(`📱 Protocol: ${req.protocol}`);
    console.log(`📱 X-Forwarded-Proto: ${req.headers['x-forwarded-proto']}`);

    // Forzar redirección a HTTPS
    const isHttps =
      req.secure ||
      req.headers['x-forwarded-proto'] === 'https' ||
      req.headers['x-forwarded-ssl'] === 'on';

    if (
      !isHttps &&
      (process.env.NODE_ENV === 'production' ||
        process.env.FORCE_HTTPS === 'true')
    ) {
      const httpsUrl = `https://${req.headers.host}${req.url}`;
      console.log(`🔄 Redirecting to HTTPS: ${httpsUrl}`);
      return res.redirect(301, httpsUrl);
    }

    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', '*');
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      );
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Accept',
      );
      res.header('Access-Control-Allow-Credentials', 'true');
      res.status(204).end();
      return;
    }
    next();
  });

  // Set up validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Agregar headers de seguridad
  app.use((req, res, next) => {
    // Headers de seguridad para HTTPS
    res.header(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

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
  console.log('🔧 Configuración final del servidor:');
  console.log('  - SSL_PRIVATE_KEY:', process.env.SSL_PRIVATE_KEY);
  console.log('  - SSL_CERT:', process.env.SSL_CERT);
  console.log('  - Protocolo configurado:', protocol);
  console.log('  - Puerto:', process.env.PORT ?? 6969);
  console.log(
    `🚀 Server is running on port ${process.env.PORT ?? 6969}. Protocol: ${protocol}`,
  );
}
bootstrap();
