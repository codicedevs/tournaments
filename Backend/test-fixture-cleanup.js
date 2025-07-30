const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testFixtureCleanup() {
  try {
    console.log('🧪 Probando limpieza de fixtures existentes...');

    // 1. Crear un torneo
    console.log('\n📝 Creando torneo...');
    const tournamentResponse = await axios.post(`${API_BASE}/tournaments`, {
      name: 'Torneo Test Limpieza Fixture',
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

    // 4. Generar fixture por primera vez
    console.log('\n🏟️ Generando fixture por primera vez...');
    const fixtureResponse1 = await axios.post(
      `${API_BASE}/phases/${phase._id}/generate-fixture`,
      {
        isLocalAway: true,
        startDate: '2024-01-15',
        weekDay: '1', // Lunes
      },
    );
    console.log('✅ Primer fixture generado');

    // 5. Verificar que se crearon matchdays y matches
    console.log('\n📋 Verificando primer fixture...');
    const matchdaysResponse1 = await axios.get(
      `${API_BASE}/phases/${phase._id}/matchdays`,
    );
    const matchdays1 = matchdaysResponse1.data;
    console.log(`✅ Primer fixture: ${matchdays1.length} matchdays`);

    // Contar total de matches
    let totalMatches1 = 0;
    matchdays1.forEach((matchday, index) => {
      const matchCount = matchday.matches?.length || 0;
      totalMatches1 += matchCount;
      console.log(`   Matchday ${index + 1}: ${matchCount} matches`);
    });
    console.log(`   Total matches: ${totalMatches1}`);

    // 6. Generar fixture por segunda vez (debería limpiar el anterior)
    console.log('\n🔄 Generando fixture por segunda vez...');
    const fixtureResponse2 = await axios.post(
      `${API_BASE}/phases/${phase._id}/generate-fixture`,
      {
        isLocalAway: false, // Cambiar a solo ida para ver diferencia
        startDate: '2024-02-01',
        weekDay: '3', // Miércoles
      },
    );
    console.log('✅ Segundo fixture generado');

    // 7. Verificar que se crearon nuevos matchdays y matches
    console.log('\n📋 Verificando segundo fixture...');
    const matchdaysResponse2 = await axios.get(
      `${API_BASE}/phases/${phase._id}/matchdays`,
    );
    const matchdays2 = matchdaysResponse2.data;
    console.log(`✅ Segundo fixture: ${matchdays2.length} matchdays`);

    // Contar total de matches
    let totalMatches2 = 0;
    matchdays2.forEach((matchday, index) => {
      const matchCount = matchday.matches?.length || 0;
      totalMatches2 += matchCount;
      console.log(`   Matchday ${index + 1}: ${matchCount} matches`);
    });
    console.log(`   Total matches: ${totalMatches2}`);

    // 8. Verificar que los datos son diferentes
    console.log('\n🔍 Verificando limpieza...');
    if (matchdays1.length !== matchdays2.length) {
      console.log(
        '✅ Los fixtures tienen diferente cantidad de matchdays (limpieza exitosa)',
      );
    } else {
      console.log('⚠️ Los fixtures tienen la misma cantidad de matchdays');
    }

    if (totalMatches1 !== totalMatches2) {
      console.log(
        '✅ Los fixtures tienen diferente cantidad de matches (limpieza exitosa)',
      );
    } else {
      console.log('⚠️ Los fixtures tienen la misma cantidad de matches');
    }

    // 9. Verificar que no hay datos duplicados
    console.log('\n🔍 Verificando ausencia de duplicados...');
    const allMatchIds = new Set();
    let hasDuplicates = false;

    matchdays2.forEach((matchday) => {
      if (matchday.matches) {
        matchday.matches.forEach((match) => {
          if (allMatchIds.has(match._id)) {
            hasDuplicates = true;
          } else {
            allMatchIds.add(match._id);
          }
        });
      }
    });

    if (!hasDuplicates) {
      console.log('✅ No hay matches duplicados (limpieza exitosa)');
    } else {
      console.log('❌ Se encontraron matches duplicados');
    }

    console.log('\n🎉 Prueba de limpieza completada');
  } catch (error) {
    console.error(
      '❌ Error en la prueba:',
      error.response?.data || error.message,
    );
  }
}

// Ejecutar la prueba
testFixtureCleanup();
