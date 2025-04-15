import { err, ok, Result } from 'neverthrow';
import db from '../config/database';
import { DatabaseError, NotFoundError } from '../errors';

export interface Gameweek { 
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  deadline_date: string;
  is_current: boolean;
  is_finished: boolean;
}

// TODO this might be re-used in matches??
export interface Matches {
  id: number;
  gameweek_id: number;
  home_team_id: number;
  away_team_id: number;
  kickoff_time: number;
  home_score: number;
  away_score: number;
  is_finished: number;
}

export const gameweekRepository = {
  async findAll(): Promise<Result<Gameweek[], NotFoundError| DatabaseError>> {
    try {
      const result = await db.query("SELECT * FROM gameweeks")
      
      if (result.rows.length === 0) {
        return err(new NotFoundError('Failed finding gameweeks'))
      }

      return ok(result.rows)
    } catch (error) { 
      console.error("Failed to find all players", error);
      return err(new DatabaseError("Failed to find all players", { cause: error }));
    }
  },
  
  async getCurrent(startDate: string): Promise<Result<Gameweek, NotFoundError | DatabaseError>> {
    try {
      const result = await db.query(`SELECT * FROM gameweeks WHERE start_date = $1`, [startDate])

      if (result.rows.length === 0) {
        return err(new NotFoundError("Current gameweek not found"))
      }

      // TODO: Is there another way to do this? I should not query for all with * ?
      return ok(result.rows[0])
    } catch (error) {
      return err(new DatabaseError('Failed to find current gameweek', { cause: error}))
    }
  },
  
  async findById(gameWeekId: number): Promise<Result<Gameweek, NotFoundError | DatabaseError>> {
    try {
      const result = await db.query(`SELECT * FROM gameweeks WHERE gameweek_id = $1`, [gameWeekId])

      if (result.rows.length === 0) {
        return err(new NotFoundError(`Game week with id ${gameWeekId} not found`))
      }

      return ok(result.rows[0])

    } catch (error) {
      return err(new DatabaseError(`Failed to find gameweek with id: ${gameWeekId}`))
    }
  },
  
  async findMatches(gameWeekId: number): Promise<Result<Matches[], DatabaseError | NotFoundError>> {
    try {
      const result = await db.query(`SELECT * FROM matches WHERE gameweek_id = $1`, [gameWeekId])

      if (result.rows.length === 0) {
        return err(new NotFoundError(`Gameweek with id ${gameWeekId} not found`));
      }

      return ok(result.rows)
    } catch (error) {
      console.error("Failed to find matches", error)
      return err(new DatabaseError('Failed to find matches', { cause: error}))
    }
  },
} 