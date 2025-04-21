import { type Result, err, ok } from 'neverthrow';
import { type SelectedPlayer, fantasyTeamRepository } from '../repositories/fantasyTeamRepository';

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
    isCaptain: boolean,
    isViceCaptain: boolean,
    isOnBench: boolean
  ): Promise<
    Result<SelectedPlayer, InsufficientBudgetError | PositionLimitError | TeamLimitError>
  > {
    try {
      // 1. Check if fantasy team exists and belongs to user
      const fantasyTeam = await fantasyTeamRepository.findById(fantasyTeamId);
      if (!fantasyTeam) {
        return err(new Error('Fantasy team not found'));
      }

      if (fantasyTeam.user_id !== userId) {
        return err(new Error('You do not have permission to modify this team'));
      }

      // 2. Get player details
      const player = await playerRepository.findById(playerId);
      if (!player) {
        return err(new Error('Player not found'));
      }

      // 3. Check budget constraint
      if (fantasyTeam.budget < player.price) {
        return err(new InsufficientBudgetError(fantasyTeam.budget, player.price));
      }

      // 4. Get current team selection
      const currentSelection = await fantasyTeamRepository.getTeamSelection(fantasyTeamId);

      // 5. Check position limits
      const positionLimits = {
        GK: 2,
        DEF: 5,
        MID: 5,
        FWD: 3,
      };

      const positionCount = currentSelection.filter((p) => p.position === player.position).length;
      if (positionCount >= positionLimits[player.position]) {
        return err(new PositionLimitError(player.position, positionLimits[player.position]));
      }

      // 6. Check team limits (max 3 players from same team)
      const teamLimit = 3;
      const sameTeamCount = currentSelection.filter((p) => p.team_id === player.team_id).length;
      if (sameTeamCount >= teamLimit) {
        return err(new TeamLimitError(player.team_name, teamLimit));
      }

      // 7. Check total squad size (usually 15 players)
      const squadLimit = 15;
      if (currentSelection.length >= squadLimit) {
        return err(new Error(`Maximum squad size (${squadLimit}) reached`));
      }

      // 8. All validations passed, add player to team
      const updatedBudget = fantasyTeam.budget - player.price;

      // Use a transaction to ensure both operations succeed or fail together
      const result = await fantasyTeamRepository.addPlayerTransaction(
        fantasyTeamId,
        playerId,
        updatedBudget
      );

      return ok(result);
    } catch {
      console.error('Error adding player to team:', error);
      return err(new Error('Failed to add player to team'));
    }
  },
};
