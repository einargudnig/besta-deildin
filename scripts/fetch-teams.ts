import { TeamsService } from '../src/services/teams.service';

async function main() {
  try {
    const teamsService = new TeamsService();
    
    // Fetch teams for the Icelandic Premier League (league ID: 1) for the 2024 season
    await teamsService.fetchAndStoreTeams(272, 2025);
    
    console.log('Teams fetched and stored successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 