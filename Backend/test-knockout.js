const axios = require('axios');

const API_URL = process.env.API_BASE_URL;
if (!API_URL) {
  throw new Error('API_BASE_URL no está definida en las variables de entorno');
}

// Sample team IDs (replace with real team IDs from your database)
const teamIds = [
  '60d0fe4f5311236168a109ca',
  '60d0fe4f5311236168a109cb',
  '60d0fe4f5311236168a109cc',
  '60d0fe4f5311236168a109cd',
  '60d0fe4f5311236168a109ce',
  '60d0fe4f5311236168a109cf',
];

// Sample tournament ID (replace with a real tournament ID)
const tournamentId = '60d0fe4f5311236168a109da';

// Helper functions
async function initializeKnockoutTournament() {
  try {
    console.log('Initializing knockout tournament...');
    const response = await axios.post(
      `${API_URL}/matches/knockout/initialize`,
      {
        teams: teamIds,
        tournamentId,
        matchDate: new Date(),
      },
    );

    console.log('First round matches created:');
    response.data.forEach((match) => {
      console.log(
        `Match ID: ${match._id}, TeamA: ${match.teamA}, TeamB: ${match.teamB}`,
      );
    });

    return response.data;
  } catch (error) {
    console.error(
      'Error initializing tournament:',
      error.response?.data || error.message,
    );
    throw error;
  }
}

async function updateMatchResult(matchId, result) {
  try {
    console.log(`Updating match ${matchId} with result: ${result}`);
    const response = await axios.patch(
      `${API_URL}/matches/knockout/${matchId}?tournamentId=${tournamentId}`,
      { result },
    );
    console.log('Match updated:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      'Error updating match:',
      error.response?.data || error.message,
    );
    throw error;
  }
}

async function getRoundMatches(round) {
  try {
    const response = await axios.get(
      `${API_URL}/matches/knockout/round?tournamentId=${tournamentId}&round=${round}`,
    );
    console.log(`Round ${round} matches:`, response.data);
    return response.data;
  } catch (error) {
    console.error(
      'Error getting round matches:',
      error.response?.data || error.message,
    );
    return [];
  }
}

async function getTournamentWinner() {
  try {
    const response = await axios.get(
      `${API_URL}/matches/knockout/winner?tournamentId=${tournamentId}`,
    );
    console.log('Tournament winner:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      'Error getting tournament winner:',
      error.response?.data || error.message,
    );
    return null;
  }
}

// Main test function
async function runKnockoutTournamentTest() {
  try {
    // Step 1: Initialize tournament with 8 teams (creates 4 first-round matches)
    const firstRoundMatches = await initializeKnockoutTournament();

    // Step 2: Update all first round match results
    console.log('\nCompleting first round...');
    for (let i = 0; i < firstRoundMatches.length; i++) {
      // Alternating winners for demonstration
      const result = i % 2 === 0 ? 'TeamA' : 'TeamB';
      await updateMatchResult(firstRoundMatches[i]._id, result);
    }

    // Step 3: Get second round matches (should be created automatically after all first round matches have results)
    console.log('\nChecking second round...');
    const secondRoundMatches = await getRoundMatches(2);

    // Step 4: Update all second round matches
    console.log('\nCompleting second round...');
    for (let i = 0; i < secondRoundMatches.length; i++) {
      const result = i % 2 === 0 ? 'TeamA' : 'TeamB';
      await updateMatchResult(secondRoundMatches[i]._id, result);
    }

    // Step 5: Get final match
    console.log('\nChecking final round...');
    const finalMatches = await getRoundMatches(3);

    // Step 6: Update final match result
    if (finalMatches.length > 0) {
      console.log('\nCompleting final...');
      await updateMatchResult(finalMatches[0]._id, 'TeamA');
    }

    // Step 7: Get tournament winner
    console.log('\nGetting tournament winner...');
    await getTournamentWinner();

    console.log('\nKnockout tournament test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
runKnockoutTournamentTest();
