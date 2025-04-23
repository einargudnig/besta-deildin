import { type Result, err, ok } from 'neverthrow';
import db from '../config/database';
import { DatabaseError } from '../errors';
import type { PlayerStatsApiResponse } from '../schemas/player-stats';
import { ApiFootballClient } from './api-football-client';

export class PlayerStatsService {
  private static instance: PlayerStatsService;
  private apiClient: ApiFootballClient;

  private constructor() {
    this.apiClient = new ApiFootballClient();
  }

  public static getInstance(): PlayerStatsService {
    if (!PlayerStatsService.instance) {
      PlayerStatsService.instance = new PlayerStatsService();
    }
    return PlayerStatsService.instance;
  }

  async getPlayerStatsFromMatch(
    matchId: number,
    teamId: number
  ): Promise<Result<PlayerStatsApiResponse, DatabaseError>> {
    try {
      const stats = await this.apiClient.getPlayerStatsFromMatch(matchId, teamId);
      console.log('stats', stats);
      return ok(stats);
    } catch (error) {
      console.error('Failed to get player stats from match', error);
      return err(new DatabaseError('Failed to get player stats from match', { cause: error }));
    }
  }

  async storePlayerPerformance(
    playerId: number,
    matchId: number,
    gameweekId: number,
    stats: PlayerStatsApiResponse
  ): Promise<Result<boolean, DatabaseError>> {
    try {
      const playerStats = stats.response[0]?.players.find((p) => p.player.id === playerId);
      if (!playerStats) {
        return err(new DatabaseError('Player stats not found in API response'));
      }

      const stat = playerStats.statistics[0];
      if (!stat) {
        return err(new DatabaseError('Player statistics not found in API response'));
      }

      // Calculate points based on fantasy football rules
      const points = this.calculatePoints(stat, stat.games.position);

      const result = await db.query(
        `INSERT INTO player_performances (
          player_id, match_id, gameweek_id, minutes_played, goals, assists,
          clean_sheet, yellow_cards, red_cards, saves, bonus_points, total_points
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (player_id, match_id) DO UPDATE SET
          minutes_played = EXCLUDED.minutes_played,
          goals = EXCLUDED.goals,
          assists = EXCLUDED.assists,
          clean_sheet = EXCLUDED.clean_sheet,
          yellow_cards = EXCLUDED.yellow_cards,
          red_cards = EXCLUDED.red_cards,
          saves = EXCLUDED.saves,
          bonus_points = EXCLUDED.bonus_points,
          total_points = EXCLUDED.total_points`,
        [
          playerId,
          matchId,
          gameweekId,
          stat.games.minutes,
          stat.goals.total ?? 0,
          stat.goals.assists ?? 0,
          this.isCleanSheet(stat, stat.games.position),
          stat.cards.yellow,
          stat.cards.red,
          0, // Saves are not available in the API response
          points.bonus,
          points.total
        ]
      );

      return ok(result.rowCount !== null && result.rowCount > 0);
    } catch (error) {
      console.error('Failed to store player performance', error);
      return err(new DatabaseError('Failed to store player performance', { cause: error }));
    }
  }

  private calculatePoints(
    stat: PlayerStatsApiResponse['response'][0]['players'][0]['statistics'][0],
    position: string
  ) {
    let total = 0;
    let bonus = 0;

    // Base points for playing
    if (stat.games.minutes >= 60) {
      total += 2;
    } else if (stat.games.minutes > 0) {
      total += 1;
    }

    // Goals
    if (stat.goals.total) {
      const goalPoints = position === 'G' ? 6 : position === 'D' ? 6 : position === 'M' ? 5 : 4;
      total += stat.goals.total * goalPoints;
    }

    // Assists
    if (stat.goals.assists) {
      total += stat.goals.assists * 3;
    }

    // Clean sheets
    if (this.isCleanSheet(stat, position)) {
      const cleanSheetPoints =
        position === 'G' ? 4 : position === 'D' ? 4 : position === 'M' ? 1 : 0;
      total += cleanSheetPoints;
    }

    // Cards
    total -= stat.cards.yellow;
    total -= stat.cards.red * 3;

    // Bonus points (simplified version)
    if (stat.goals.total && stat.goals.total >= 2) {
      bonus += 3; // Hat-trick bonus
    } else if (stat.goals.total === 1) {
      bonus += 1; // Goal bonus
    }

    if (stat.goals.assists && stat.goals.assists >= 2) {
      bonus += 2; // Multiple assists bonus
    }

    return { total, bonus };
  }

  private isCleanSheet(
    stat: PlayerStatsApiResponse['response'][0]['players'][0]['statistics'][0],
    position: string
  ) {
    if (position !== 'G' && position !== 'D') return false;
    // Since conceded goals are not available in the API response, we'll need to get this from the match result
    // For now, we'll return false
    return false;
  }
}
