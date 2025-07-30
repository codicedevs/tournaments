const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testMatchdayPopulate() {
  try {
    console.log('🧪 Probando creación de matchdays con matches populados...');

    // 1. Crear un torneo
    console.log('\n📝 Creando torneo...');
    const tournamentResponse = await axios.post(`${API_BASE}/tournaments`, {
      name: 'Torneo Test Matchday Populate',
    });
    const tournament = tournamentResponse.data;
    console.log('✅ Torneo creado:', tournament.name);

    // 2. Obtener la fase automática creada
    console.log('\n🔍 Obteniendo fase del torneo...');
    const tournamentWithPhases = await axios.get(
      `${API_BASE}/tournaments/${tournament._id}`,
    );
    const phase = tournamentWithPhases.data.phases[0];
    console.log('✅ Fase encontrada:', phase.name, 'ID:', phase._id);

    // 3. Registrar algunos equipos
    console.log('\n👥 Registrando equipos...');
    const teams = ['Equipo A', 'Equipo B', 'Equipo C', 'Equipo D'];
    for (const teamName of teams) {
      const teamResponse = await axios.post(`${API_BASE}/teams`, {
        name: teamName,
      });
      const team = teamResponse.data;

      await axios.post(`${API_BASE}/registrations`, {
        tournamentId: tournament._id,
        teamId: team._id,
      });
      console.log(`✅ Equipo ${teamName} registrado`);
    }

    // 4. Generar fixture
    console.log('\n🏟️ Generando fixture...');
    const fixtureResponse = await axios.post(
      `${API_BASE}/phases/${phase._id}/generate-fixture`,
      {
        isLocalAway: true,
        startDate: '2024-01-15',
        weekDay: '1', // Lunes
      },
    );
    console.log('✅ Fixture generado');

    // 5. Obtener matchdays con matches populados
    console.log('\n📋 Obteniendo matchdays con matches populados...');
    const matchdaysResponse = await axios.get(
      `${API_BASE}/phases/${phase._id}/matchdays`,
    );
    const matchdays = matchdaysResponse.data;

    console.log(`✅ Se encontraron ${matchdays.length} matchdays:`);

    matchdays.forEach((matchday, index) => {
      console.log(`\n   📅 Matchday ${index + 1} (Orden: ${matchday.order}):`);
      console.log(`      Fecha: ${matchday.date || 'Sin fecha'}`);
      console.log(`      Matches: ${matchday.matches?.length || 0}`);

      if (matchday.matches && matchday.matches.length > 0) {
        console.log(`      Detalles de matches:`);
        matchday.matches.forEach((match, matchIndex) => {
          console.log(
            `        ${matchIndex + 1}. ${match.teamA?.name || 'Team A'} vs ${match.teamB?.name || 'Team B'}`,
          );
          console.log(`           Estado: ${match.status}`);
          console.log(`           Fecha: ${match.date || 'Sin fecha'}`);
        });
      }
    });

    // 6. Verificar que los matches están populados correctamente
    console.log('\n🔍 Verificando populate de matches...');
    if (
      matchdays.length > 0 &&
      matchdays[0].matches &&
      matchdays[0].matches.length > 0
    ) {
      const firstMatch = matchdays[0].matches[0];
      if (
        typeof firstMatch === 'object' &&
        firstMatch.teamA &&
        firstMatch.teamB
      ) {
        console.log(
          '✅ Los matches están correctamente populados con información de equipos',
        );
      } else {
        console.log('❌ Los matches no están populados correctamente');
      }
    } else {
      console.log('⚠️ No hay matches para verificar');
    }
  } catch (error) {
    console.error(
      '❌ Error en la prueba:',
      error.response?.data || error.message,
    );
  }
}

// Ejecutar la prueba
testMatchdayPopulate();
