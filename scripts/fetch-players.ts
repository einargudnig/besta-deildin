import { PlayersService } from '../src/services/players.service';

async function main() {
  try {
    const teamIdArg = process.argv[2];
    
    if (!teamIdArg) {
      console.error('Please provide a team ID as a command line argument');
      process.exit(1);
    }

    const teamId = Number(teamIdArg);
    
    if (Number.isNaN(teamId)) {
      console.error('Please provide a valid team ID as a command line argument');
      process.exit(1);
    }

    const playersService = new PlayersService();
    console.log(`Fetching players for team ID: ${teamId}...`);
    
    // Fetch players for the specified team for the 2025 season
    await playersService.fetchAndStorePlayers(teamId, 2025);
    
    console.log('Players fetched and stored successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
