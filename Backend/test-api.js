const axios = require('axios');

const API_URL = process.env.API_BASE_URL;
if (!API_URL) {
  throw new Error('API_BASE_URL no está definida en las variables de entorno');
}

// Phase types enum - matching what we defined in the backend
const PhaseType = {
  GROUP: 'GROUP',
  KNOCKOUT: 'KNOCKOUT',
  LEAGUE: 'LEAGUE',
  FINAL: 'FINAL',
  QUALIFYING: 'QUALIFYING',
};

async function testAPI() {
  console.log('Testing Tournaments API...');

  try {
    // Test creating a tournament
    console.log('\nCreating a tournament:');
    const tournamentResponse = await axios.post(`${API_URL}/tournaments`, {
      name: 'Test Tournament',
    });
    console.log('Response:', tournamentResponse.data);

    const tournamentId = tournamentResponse.data._id;

    // Test creating a phase
    console.log('\nCreating a phase:');
    const phaseResponse = await axios.post(`${API_URL}/phases`, {
      name: 'Group Stage',
      type: PhaseType.GROUP,
      tournamentId: tournamentId,
    });
    console.log('Response:', phaseResponse.data);

    const phaseId = phaseResponse.data._id;

    // Test creating a league phase
    console.log('\nCreating a league phase:');
    const leaguePhaseResponse1 = await axios.post(`${API_URL}/phases`, {
      name: 'League Stage',
      type: PhaseType.LEAGUE,
      tournamentId: tournamentId,
    });
    console.log('Response:', leaguePhaseResponse1.data);

    // Test creating match days
    console.log('\nCreating match days:');
    const leagueResponse = await axios.post(
      `${API_URL}/phases/${phaseId}/league?matchDaysAmount=3&isLocalAway=true`,
    );
    console.log('Response:', leagueResponse.data);

    // Test getting all tournaments
    console.log('\nGetting all tournaments:');
    const allTournaments = await axios.get(`${API_URL}/tournaments`);
    console.log(`Found ${allTournaments.data.length} tournaments`);

    // Test creating teams
    console.log('\nCreating teams:');
    const teamsToCreate = [
      'Team Alpha',
      'Team Beta',
      'Team Gamma',
      'Team Delta',
    ];
    const createdTeams = [];

    for (const teamName of teamsToCreate) {
      const teamResponse = await axios.post(`${API_URL}/teams`, {
        name: teamName,
        coach: `Coach of ${teamName}`,
        createdById: '123456789012', // Placeholder user ID
      });
      console.log(`Created team: ${teamResponse.data.name}`);
      createdTeams.push(teamResponse.data);
    }

    // Test registering teams for the tournament
    console.log('\nRegistering teams for the tournament:');
    const registrations = [];

    for (const team of createdTeams) {
      const registrationResponse = await axios.post(
        `${API_URL}/registrations`,
        {
          teamId: team._id,
          tournamentId: tournamentId,
        },
      );
      console.log(`Registered team ${team.name} for the tournament`);
      registrations.push(registrationResponse.data);
    }

    // Create a league phase
    console.log('\nCreating a league phase:');
    const leaguePhaseResponse = await axios.post(`${API_URL}/phases`, {
      name: 'League Stage',
      type: PhaseType.LEAGUE,
      tournamentId: tournamentId,
    });
    console.log('Response:', leaguePhaseResponse.data);

    const leaguePhaseId = leaguePhaseResponse.data._id;

    // Generate league fixtures
    console.log('\nGenerating league fixtures:');
    const fixtureResponse = await axios.post(
      `${API_URL}/phases/${leaguePhaseId}/fixture?isLocalAway=true`,
    );

    console.log(`Created ${fixtureResponse.data.matchDays.length} match days`);
    console.log(`Created ${fixtureResponse.data.matches.length} matches`);

    // Test getting match days for the phase
    console.log('\nGetting match days for the phase:');
    const matchDaysResponse = await axios.get(
      `${API_URL}/matchdays/phase/${leaguePhaseId}`,
    );
    console.log(`Found ${matchDaysResponse.data.length} match days`);

    // Get matches for the first match day
    if (matchDaysResponse.data.length > 0) {
      const firstMatchDayId = matchDaysResponse.data[0]._id;
      console.log(`\nGetting matches for match day ${firstMatchDayId}:`);
      const matchesResponse = await axios.get(
        `${API_URL}/matches/matchday/${firstMatchDayId}`,
      );
      console.log(`Found ${matchesResponse.data.length} matches`);

      // Show matches
      matchesResponse.data.forEach((match) => {
        console.log(`Match: ${match.teamA.name} vs ${match.teamB.name}`);
      });
    }

    // Test getting all teams registered for the tournament
    console.log('\nGetting teams registered for the tournament:');
    const tournamentRegistrationsResponse = await axios.get(
      `${API_URL}/registrations/tournament/${tournamentId}`,
    );
    const registeredTeams = tournamentRegistrationsResponse.data;

    console.log(
      `Found ${registeredTeams.length} teams registered for tournament ID: ${tournamentId}`,
    );
    registeredTeams.forEach((reg) => {
      console.log(`- Team: ${reg.teamId.name}`);
    });
  } catch (error) {
    console.error('Error testing API:', error.response?.data || error.message);
  }
}

testAPI();
