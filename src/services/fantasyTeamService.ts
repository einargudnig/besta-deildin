import { type Result, err } from 'neverthrow';
import { type FantasyTeam, type TeamSelection, fantasyTeamRepository } from '../repositories/fantasyTeamRepository';
import { playerRepository } from '../repositories/playerRepository';

export class InsufficientBudgetError extends Error {
  constructor(availableBudget: number, requiredBudget: number) {
    super(
      `Insufficient budget: Available budget is ${availableBudget}, required budget is ${requiredBudget}`
    );
    this.name = 'InsufficientBudgetError';
  }
}

export class PositionLimitError extends Error {
  constructor(position: string, limit: number) {
    super(`Maximum ${position} players (${limit}) already selected`);
    this.name = 'PositionLimitError';
  }
}

export class TeamLimitError extends Error {
  constructor(teamName: string, limit: number) {
    super(`Maximum players from ${teamName} (${limit}) already selected`);
    this.name = 'TeamLimitError';
  }
}

// Here we'll do some business logic!
export const fantasyTeamService = {
  async addPlayerToTeam(
    fantasyTeamId: number,
    playerId: number,
    userId: number,
    isCaptain: boolean,
    isViceCaptain: boolean,
    isOnBench: boolean
  ): Promise<
    Result<TeamSelection, InsufficientBudgetError | PositionLimitError | TeamLimitError | Error>
  > {
    try {
      console.log({ fantasyTeamId }, { playerId }, { isCaptain }, { isViceCaptain }, { isOnBench });
      
      // 1. Check if fantasy team exists and belongs to user
      const fantasyTeamResult = await fantasyTeamRepository.getTeamById(fantasyTeamId);
      
      if (!fantasyTeamResult.isOk()) {
        return err(fantasyTeamResult.error);
      }

      const fantasyTeam = fantasyTeamResult.value;
      
      // Verify team ownership
      if (fantasyTeam.user_id !== userId) {
        return err(new Error('You do not have permission to modify this team'));
      }
      
      // Continue with player retrieval
      return await processPlayerAddition(
        fantasyTeam, 
        playerId, 
        isCaptain, 
        isViceCaptain, 
        isOnBench
      );
    } catch (error) {
      console.error('Error adding player to team:', error);
      return err(new Error(`Failed to add player to team: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  },
};

// Split the logic into a separate function for better readability
async function processPlayerAddition(
  fantasyTeam: FantasyTeam,
  playerId: number,
  isCaptain: boolean,
  isViceCaptain: boolean,
  isOnBench: boolean
): Promise<
  Result<TeamSelection, InsufficientBudgetError | PositionLimitError | TeamLimitError | Error>
> {

  console.log({ fantasyTeam });
  // 2. Get player details
  const playerResult = await playerRepository.findById(playerId);
  
  if (!playerResult.isOk()) {
    return err(playerResult.error);
  }
  
  const player = playerResult.value;
  
  // 3. Check budget constraint
  if (Number(fantasyTeam.budget) < Number(player.price)) {
    console.log({ fantasyTeam, player }, 'Are we here?');
    return err(new InsufficientBudgetError(fantasyTeam.budget, player.price));
  }

  // 4. Get current team selection
  const currentSelection = await fantasyTeamRepository.getTeamSelection(fantasyTeam.id);
  
  // 5. Check position limits
  const positionLimits: Record<string, number> = {
    GK: 2,
    DEF: 5,
    MID: 5,
    FWD: 3,
  };
  const positionCount = currentSelection.filter(p => p.position === player.position).length;
  const positionLimit = positionLimits[player.position as keyof typeof positionLimits];

  if (positionLimit === undefined) {
    return err(new Error('Position limit not found'));
  }

  if (positionCount >= positionLimit) {
    return err(new PositionLimitError(player.position, positionLimit));
  }

  // 6. Check team limits (max 3 players from same team)
  const teamLimit = 3;
  const sameTeamCount = currentSelection.filter(p => p.team_id === player.team_id).length;
  if (sameTeamCount >= teamLimit) {
    const teamName = currentSelection.find(p => p.team_id === player.team_id)?.team_name;
    if (!teamName) {
      return err(new Error('Team name not found'));
    
    }
    return err(new TeamLimitError(teamName, teamLimit));
  }

  // 7. Check total squad size (usually 15 players)
  const squadLimit = 15;
  if (currentSelection.length >= squadLimit) {
    return err(new Error(`Maximum squad size (${squadLimit}) reached`));
  }

  // 8. All validations passed, add player to team
  const updatedBudget = fantasyTeam.budget - player.price;

  // Get current gameweek
  const gameweekResult = await fantasyTeamRepository.getCurrentGameweek();
  const gameweekId = gameweekResult.id;

  if (!gameweekId) {
    return err(new Error('No current gameweek found'));
  }

  // Use a transaction to ensure both operations succeed or fail together
  const transactionResult = await fantasyTeamRepository.selectPlayer({
    fantasy_team_id: fantasyTeam.id,
    gameweek_id: gameweekId,
    player_id: playerId,
    is_captain: isCaptain,
    is_vice_captain: isViceCaptain,
    is_on_bench: isOnBench
  });
  
  if (!transactionResult.isOk()) {
    return transactionResult;
  }

  // Update the team's budget after successful player addition
  const updateBudgetResult = await fantasyTeamRepository.updateTeamBudget(
    fantasyTeam.id,
    playerId,
    updatedBudget
  );

  if (!updateBudgetResult.success) {
    return err(new Error('Failed to update team budget'));
  }
  
  return transactionResult;
}
