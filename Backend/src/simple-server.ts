import * as http from 'http';

const port = 80;

// Crear servidor HTTP simple que redirige todo a HTTPS
const server = http.createServer((req, res) => {
  console.log('chocaa', req.url);
  // Redirigir a tu dominio real en lugar de localhost
  const httpsUrl = `https://torneosloyal.ar${req.url}`;

  console.log(`🔄 Redirigiendo HTTP a HTTPS: ${req.url} -> ${httpsUrl}`);

  res.writeHead(301, {
    Location: httpsUrl,
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
  });

  const htmlContent = `
    <html>
      <head>
        <title>Redirigiendo a HTTPS...</title>
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          p {
            font-size: 1.2em;
            opacity: 0.9;
            margin: 10px 0;
          }
          .redirect-info {
            margin-top: 30px;
            padding: 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            font-size: 0.9em;
          }
          .link {
            color: #ffd700;
            text-decoration: none;
            font-weight: bold;
          }
          .link:hover {
            text-decoration: underline;
          }
        </style>
        <script>
          // Redirección automática con timestamp para evitar cache
          setTimeout(() => {
            window.location.href = '${httpsUrl}?' + Date.now();
          }, 100);
        </script>
      </head>
      <body>
        <h1>🔄 Redirigiendo a HTTPS...</h1>
        <p>Estás siendo redirigido automáticamente a la versión segura</p>
                 <div class="redirect-info">
           <p><strong>Desde:</strong> HTTP (Puerto 80)</p>
           <p><strong>Hacia:</strong> https://torneosloyal.ar</p>
           <p><strong>URL:</strong> ${httpsUrl}</p>
           <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
         </div>
        <p>Si no eres redirigido automáticamente, <a href="${httpsUrl}?${Date.now()}" class="link">haz clic aquí</a></p>
      </body>
    </html>
  `;

  res.end(htmlContent);
});

server.listen(port, () => {
  console.log('🚀 Servidor HTTP de redirección iniciado en puerto 80');
  console.log('   Redirigiendo todo el tráfico HTTP a HTTPS');
  console.log('   URL: http://* → https://torneosloyal.ar');
});

server.on('error', (error: any) => {
  if (error.code === 'EACCES') {
    console.error('❌ Error: No se puede iniciar el servidor en puerto 80');
    console.error('   El puerto 80 requiere permisos de administrador');
    console.error('   Intenta ejecutar como administrador o usar otro puerto');
  } else if (error.code === 'EADDRINUSE') {
    console.error('❌ Error: El puerto 80 ya está en uso');
    console.error('   Otro servicio está usando el puerto 80');
  } else {
    console.error('❌ Error en servidor HTTP de redirección:', error);
  }
});

export default server;
