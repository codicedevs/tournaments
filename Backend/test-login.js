const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Probando login con credenciales del admin...');

    const response = await axios.post('http://localhost:6969/auth/login', {
      email: 'admin@tournaments.com',
      password: 'admin123',
    });

    console.log('✅ Login exitoso!');
    console.log('📧 Email:', response.data.user.email);
    console.log('👤 Nombre:', response.data.user.name);
    console.log(
      '🔑 Token:',
      response.data.access_token.substring(0, 20) + '...',
    );
    console.log(
      '⚠️  Debe cambiar contraseña:',
      response.data.user.mustChangePassword,
    );
  } catch (error) {
    console.error('❌ Error en login:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Mensaje:', error.response.data.message);
      console.error('Datos:', error.response.data);
    } else {
      console.error('Error de conexión:', error.message);
    }
  }
}

testLogin();
