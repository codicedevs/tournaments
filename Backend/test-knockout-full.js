const axios = require('axios');
const readline = require('readline');

const API_URL = 'http://localhost:3000';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

// Main functions
async function createTournament(name) {
  try {
    const response = await axios.post(`${API_URL}/tournaments`, {
      name,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
    console.log('Tournament created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating tournament:', error.response?.data || error.message);
    throw error;
  }
}

async function createPhase(tournamentId, name) {
  try {
    const response = await axios.post(`${API_URL}/phases`, {
      tournamentId,
      name,
      type: 'KNOCKOUT'
    });
    console.log('Phase created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating phase:', error.response?.data || error.message);
    throw error;
  }
}

async function createTeams(tournamentId, count) {
  try {
    const teams = [];
    for (let i = 1; i <= count; i++) {
      const teamResponse = await axios.post(`${API_URL}/teams`, {
        name: `Team ${i}`,
        shortName: `T${i}`,
      });
      
      // Register team in tournament
      await axios.post(`${API_URL}/registrations`, {
        tournamentId,
        teamId: teamResponse.data._id
      });
      
      teams.push(teamResponse.data);
      console.log(`Team ${i} created and registered`);
    }
    return teams;
  } catch (error) {
    console.error('Error creating teams:', error.response?.data || error.message);
    throw error;
  }
}

async function initializeKnockoutTournament(phaseId) {
  try {
    console.log('Initializing knockout tournament...');
    const response = await axios.post(`${API_URL}/phases/${phaseId}/knockout/create`);

    console.log('\nFirst round matches created:');
    response.data.matches.forEach((match, index) => {
      console.log(
        `Match ${index+1}: TeamA: ${match.teamA}, TeamB: ${match.teamB || 'BYE'}`
      );
    });

    return response.data;
  } catch (error) {
    console.error('Error initializing tournament:', error.response?.data || error.message);
    throw error;
  }
}

async function updateMatchResult(matchId, result) {
  try {
    console.log(`Updating match ${matchId} with result: ${result}`);
    const response = await axios.patch(
      `${API_URL}/matches/${matchId}`,
      { result, completed: true }
    );
    console.log('Match updated successfully');
    return response.data;
  } catch (error) {
    console.error('Error updating match:', error.response?.data || error.message);
    throw error;
  }
}

async function getMatchesByMatchday(matchdayId) {
  try {
    const response = await axios.get(`${API_URL}/matches/matchday/${matchdayId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting matches:', error.response?.data || error.message);
    return [];
  }
}

async function advanceToNextRound(phaseId) {
  try {
    console.log('Advancing to next round...');
    const response = await axios.post(`${API_URL}/phases/${phaseId}/knockout/advance`);
    
    console.log('\nNext round matches created:');
    response.data.matches.forEach((match, index) => {
      console.log(
        `Match ${index+1}: TeamA: ${match.teamA}, TeamB: ${match.teamB || 'BYE'}`
      );
    });
    
    return response.data;
  } catch (error) {
    console.error('Error advancing round:', error.response?.data || error.message);
    throw error;
  }
}

// Interactive tournament creation and management
async function runInteractiveKnockout() {
  try {
    console.log('=== KNOCKOUT TOURNAMENT CREATOR ===\n');
    
    // Step 1: Create tournament
    const tournamentName = await prompt('Enter tournament name: ');
    const tournament = await createTournament(tournamentName);
    
    // Step 2: Create phase
    const phaseName = await prompt('Enter phase name (e.g., "Knockout Stage"): ');
    const phase = await createPhase(tournament._id, phaseName);
    
    // Step 3: Create teams
    const teamCount = parseInt(await prompt('How many teams in the tournament? '));
    await createTeams(tournament._id, teamCount);
    
    // Step 4: Initialize knockout tournament
    const firstRound = await initializeKnockoutTournament(phase._id);
    
    // Step 5: Process rounds until we have a winner
    let currentRound = firstRound;
    let roundNumber = 1;
    
    while (currentRound.matches.length > 0) {
      console.log(`\n=== ROUND ${roundNumber} ===`);
      
      // Update match results
      for (let i = 0; i < currentRound.matches.length; i++) {
        // Skip matches that are already completed (like bye matches)
        if (currentRound.matches[i].completed) {
          console.log(`Match ${i+1} already completed (bye match)`);
          continue;
        }
        
        console.log(`\nMatch ${i+1}: TeamA vs TeamB`);
        const resultChoice = await prompt('Enter winner (1 for TeamA, 2 for TeamB): ');
        const result = resultChoice === '1' ? 'TeamA' : 'TeamB';
        await updateMatchResult(currentRound.matches[i]._id, result);
      }
      
      // If there's only one match, we've reached the final
      if (currentRound.matches.length === 1) {
        console.log('\n=== TOURNAMENT COMPLETED ===');
        const finalMatch = currentRound.matches[0];
        const winner = finalMatch.result === 'TeamA' ? finalMatch.teamA : finalMatch.teamB;
        console.log(`Winner: ${winner}`);
        break;
      }
      
      // Advance to next round
      currentRound = await advanceToNextRound(phase._id);
      roundNumber++;
    }
    
    console.log('\nKnockout tournament completed successfully!');
    
  } catch (error) {
    console.error('Error during tournament creation:', error);
  } finally {
    rl.close();
  }
}

// Run the interactive tournament
runInteractiveKnockout();
