import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import './settings'; // Importar settings para cargar las variables de entorno

import {
  getProtocolConfig,
  createHttpRedirectServer,
} from './utils/server-config';

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

  // Middleware para manejar preflight requests específicamente para móviles
  app.use((req, res, next) => {
    // Log para diagnosticar problemas móviles
    console.log(`📱 Request: ${req.method} ${req.url}`);
    console.log(`📱 User-Agent: ${req.headers['user-agent']}`);
    console.log(`📱 Origin: ${req.headers.origin}`);
    console.log(`📱 Host: ${req.headers.host}`);

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

  const port = parseInt(process.env.PORT ?? '6969', 10);
  await app.listen(port);

  // Si estamos en HTTPS, crear también el servidor HTTP de redirección
  if (protocol === 'https') {
    try {
      const redirectServer = createHttpRedirectServer(port);
      redirectServer.listen(80, () => {
        console.log('🔄 Servidor HTTP de redirección iniciado en puerto 80');
        console.log('   Redirigiendo todo el tráfico HTTP a HTTPS');
      });

      redirectServer.on('error', (error: any) => {
        if (error.code === 'EACCES') {
          console.error(
            '❌ Error: No se puede iniciar el servidor HTTP en puerto 80',
          );
          console.error('   El puerto 80 requiere permisos de administrador');
          console.error('   El servidor HTTPS seguirá funcionando normalmente');
        } else if (error.code === 'EADDRINUSE') {
          console.error('❌ Error: El puerto 80 ya está en uso');
          console.error('   El servidor HTTPS seguirá funcionando normalmente');
        } else {
          console.error('❌ Error en servidor HTTP de redirección:', error);
        }
      });
    } catch (error) {
      console.error('❌ Error al crear servidor HTTP de redirección:', error);
    }
  }

  console.log('🔧 Configuración final del servidor:');
  console.log('  - SSL_PRIVATE_KEY:', process.env.SSL_PRIVATE_KEY);
  console.log('  - SSL_CERT:', process.env.SSL_CERT);
  console.log('  - Protocolo configurado:', protocol);
  console.log('  - Puerto:', port);
  console.log(`🚀 Server is running on port ${port}. Protocol: ${protocol}`);
}
bootstrap();
