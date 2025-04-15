import { err, ok, Result } from 'neverthrow';
import db from '../config/database';
import { DatabaseError, NotFoundError } from '../errors';

export interface Leaderboard {
  id: number;
  name: string;
  points: number;
  rank: number;
  team_id: number;
  gameweek_id: number;
}

export const leaderboardRepository = {
  async getGlobalLeaderboard(): Promise<Result<Leaderboard[], DatabaseError | NotFoundError>> {
    try {
      const result = await db.query(`
        SELECT 
          ft.id as team_id,
          ft.name,
          ft.total_points as points,
          RANK() OVER (ORDER BY ft.total_points DESC) as rank,
          g.id as gameweek_id
        FROM fantasy_teams ft
        CROSS JOIN (
          SELECT id FROM gameweeks WHERE is_current = true LIMIT 1
        ) g
        ORDER BY rank
      `);

      if (result.rows.length === 0) {
        return err(new NotFoundError('No leaderboard entries found'));
      }

      return ok(result.rows);
    } catch (error) {
      console.error('Failed to get global leaderboard', error);
      return err(new DatabaseError('Failed to get global leaderboard', { cause: error }));
    }
  },

  async getGameweekLeaderboard(gameweekId: number): Promise<Result<Leaderboard[], DatabaseError | NotFoundError>> {
    try {
      const result = await db.query(`
        SELECT 
          ft.id as team_id,
          ft.name,
          COALESCE(ts.total_points, 0) as points,
          RANK() OVER (ORDER BY COALESCE(ts.total_points, 0) DESC) as rank,
          $1 as gameweek_id
        FROM fantasy_teams ft
        LEFT JOIN (
          SELECT 
            fantasy_team_id,
            SUM(p.total_points) as total_points
          FROM team_selections ts
          JOIN players p ON ts.player_id = p.id
          WHERE ts.gameweek_id = $1
          GROUP BY fantasy_team_id
        ) ts ON ft.id = ts.fantasy_team_id
        ORDER BY rank
      `, [gameweekId]);

      if (result.rows.length === 0) {
        return err(new NotFoundError('No leaderboard entries found for this gameweek'));
      }

      return ok(result.rows);
    } catch (error) {
      console.error('Failed to get gameweek leaderboard', error);
      return err(new DatabaseError('Failed to get gameweek leaderboard', { cause: error }));
    }
  },
};