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
  });

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
