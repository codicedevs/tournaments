const axios = require('axios');

const API_URL = 'http://localhost:3000';

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
    const leaguePhaseResponse = await axios.post(`${API_URL}/phases`, {
      name: 'League Stage',
      type: PhaseType.LEAGUE,
      tournamentId: tournamentId,
    });
    console.log('Response:', leaguePhaseResponse.data);

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
    const teamsToCreate = ['Team Alpha', 'Team Beta', 'Team Gamma'];
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
