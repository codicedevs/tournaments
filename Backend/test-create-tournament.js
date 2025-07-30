const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testCreateTournament() {
  try {
    console.log('🧪 Probando creación de torneo con fase automática...');

    // Crear un torneo
    const tournamentData = {
      name: 'Torneo de Prueba - Liga Automática',
    };

    console.log('📝 Datos del torneo:', tournamentData);

    const createResponse = await axios.post(
      `${API_BASE}/tournaments`,
      tournamentData,
    );
    console.log('✅ Torneo creado exitosamente:');
    console.log('   ID:', createResponse.data._id);
    console.log('   Nombre:', createResponse.data.name);
    console.log('   Fases:', createResponse.data.phases);

    if (createResponse.data.phases && createResponse.data.phases.length > 0) {
      console.log('🎯 Fase automática creada:');
      console.log('   ID de la fase:', createResponse.data.phases[0]._id);
      console.log('   Nombre de la fase:', createResponse.data.phases[0].name);
      console.log('   Tipo de fase:', createResponse.data.phases[0].type);
    } else {
      console.log('❌ No se encontró la fase automática');
    }

    // Obtener el torneo para verificar el populate
    console.log('\n🔍 Verificando populate del torneo...');
    const getResponse = await axios.get(
      `${API_BASE}/tournaments/${createResponse.data._id}`,
    );
    console.log('✅ Torneo obtenido con populate:');
    console.log('   Fases populadas:', getResponse.data.phases);

    // Listar todos los torneos para verificar el populate en findAll
    console.log('\n📋 Listando todos los torneos...');
    const listResponse = await axios.get(`${API_BASE}/tournaments`);
    console.log('✅ Lista de torneos con populate:');
    listResponse.data.forEach((tournament, index) => {
      console.log(
        `   ${index + 1}. ${tournament.name} - Fases: ${tournament.phases?.length || 0}`,
      );
    });
  } catch (error) {
    console.error(
      '❌ Error en la prueba:',
      error.response?.data || error.message,
    );
  }
}

// Ejecutar la prueba
testCreateTournament();
