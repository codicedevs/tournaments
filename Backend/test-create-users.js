const axios = require('axios');

async function testCreateUsers() {
  const users = [
    {
      name: 'Jugador Test',
      email: 'jugador@test.com',
      password: 'jugador123',
      role: 'Player',
      mustChangePassword: true,
      isVerified: true,
    },
    {
      name: 'Veedor Test',
      email: 'veedor@test.com',
      password: 'veedor123',
      role: 'Viewer',
      mustChangePassword: true,
      isVerified: true,
    },
    {
      name: 'Coordinador Test',
      email: 'coordinador@test.com',
      password: 'coordinador123',
      role: 'Moderator',
      mustChangePassword: true,
      isVerified: true,
    },
    {
      name: 'Árbitro Test',
      email: 'arbitro@test.com',
      password: 'arbitro123',
      role: 'Referee',
      mustChangePassword: true,
      isVerified: true,
    },
  ];

  for (const user of users) {
    try {
      console.log(`🔍 Creando usuario: ${user.name} (${user.role})`);

      const response = await axios.post(
        'http://localhost:6969/users/with-player',
        user,
      );

      console.log(`✅ Usuario creado exitosamente:`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Contraseña: ${user.password}`);
      console.log(`   👑 Rol: ${user.role}`);
      console.log(`   ⚠️  Debe cambiar contraseña: ${user.mustChangePassword}`);
      console.log(`   ✅ Verificado: ${user.isVerified}`);
      console.log('---');
    } catch (error) {
      console.error(`❌ Error creando usuario ${user.name}:`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Mensaje: ${error.response.data.message}`);
      } else {
        console.error(`   Error: ${error.message}`);
      }
      console.log('---');
    }
  }
}

testCreateUsers();
