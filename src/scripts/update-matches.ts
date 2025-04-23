import { MatchesService } from '../services/matches.service';

const LEAGUE_ID = 164; // Premier League ID
const CURRENT_SEASON = 2025; // Current season

export async function updateMatches() {
  console.log('Starting match update...');
  const matchesService = MatchesService.getInstance();

  try {
    await matchesService.fetchAndStoreMatches(LEAGUE_ID, CURRENT_SEASON);
    console.log('Match update completed successfully');
  } catch (error) {
    console.error('Error updating matches:', error);
    process.exit(1);
  }
}

// Only run directly if this file is being executed
if (require.main === module) {
  updateMatches();
} 