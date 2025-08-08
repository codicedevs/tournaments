import * as fs from 'fs';
import * as http from 'http';

/**
 * Crea un servidor HTTP que redirige todo el tráfico a HTTPS
 * @param httpsPort Puerto del servidor HTTPS
 * @returns Servidor HTTP configurado
 */
export function createHttpRedirectServer(httpsPort: number) {
  const redirectServer = http.createServer((req, res) => {
    const host = req.headers.host?.split(':')[0] || 'localhost';
    const httpsUrl = `https://${host}:${httpsPort}${req.url}`;

    console.log(`🔄 Redirigiendo HTTP a HTTPS: ${req.url} -> ${httpsUrl}`);

    res.writeHead(301, {
      Location: httpsUrl,
      'Content-Type': 'text/html',
    });
    res.end(
      `<html><body><h1>Redirigiendo a HTTPS...</h1><p>Si no eres redirigido automáticamente, <a href="${httpsUrl}">haz clic aquí</a></p></body></html>`,
    );
  });

  return redirectServer;
}

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
