const axios = require('axios');
const { Types } = require('mongoose');

const API_URL = 'http://localhost:3000'; // Change this if your API runs on a different port

// Function to test upgrading a match result
async function testUpgradeMatch(matchId, result) {
  try {
    console.log(
      `Testing upgrade match with ID: ${matchId}, setting result to: ${result}`,
    );

    const response = await axios.patch(`${API_URL}/matches/${matchId}`, {
      result: result,
    });

    console.log('Response status:', response.status);
    console.log('Updated match data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error upgrading match:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Function to get a match by ID for verification
async function getMatchById(matchId) {
  try {
    const response = await axios.get(`${API_URL}/matches/${matchId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting match ${matchId}:`, error.message);
    return null;
  }
}

// Main function to run the tests
async function runTests() {
  // Replace with a real match ID from your database
  const matchId = new Types.ObjectId('682e1d799077666eed9808ef');

  // Test each possible result
  await testUpgradeMatch(matchId, 'TeamA');

  // Verify the change
  const matchAfterTeamA = await getMatchById(matchId);
  console.log('Match after setting TeamA win:', matchAfterTeamA);

  // Test setting a draw
  await testUpgradeMatch(matchId, 'Draw');

  // Test setting TeamB win
  await testUpgradeMatch(matchId, 'TeamB');
}

// Run the tests
runTests().catch(console.error);
