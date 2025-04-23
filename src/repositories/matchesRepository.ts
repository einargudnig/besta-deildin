import { type Result, err, ok } from 'neverthrow';
import defaultDb from '../config/database';
import type { Match } from '../schemas';
import { matchSchema, parseDatabaseResult, parseDatabaseResults } from '../schemas';

export const matchesRepository = {
  async findAll(): Promise<Result<Match[], Error>> {
    try {
      const result = await defaultDb.query('SELECT * FROM matches');
      const matches = parseDatabaseResults(matchSchema, result.rows);
      return ok(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      return err(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  },

  async findById(id: number): Promise<Result<Match | null, Error>> {
    try {
      const result = await defaultDb.query('SELECT * FROM matches WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return ok(null);
      }
      const match = parseDatabaseResult(matchSchema, result.rows[0]);
      return ok(match);
    } catch (error) {
      console.error('Error fetching match by id:', error);
      return err(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  },

  async findByApiId(apiId: number): Promise<Result<Match | null, Error>> {
    try {
      const result = await defaultDb.query('SELECT * FROM matches WHERE api_id = $1', [apiId]);
      if (result.rows.length === 0) {
        return ok(null);
      }
      const match = parseDatabaseResult(matchSchema, result.rows[0]);
      return ok(match);
    } catch (error) {
      console.error('Error fetching match by api_id:', error);
      return err(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  },

  async findByTeamId(teamId: number): Promise<Result<Match[], Error>> {
    try {
      const result = await defaultDb.query(
        'SELECT * FROM matches WHERE home_team_id = $1 OR away_team_id = $1',
        [teamId]
      );
      const matches = parseDatabaseResults(matchSchema, result.rows);
      return ok(matches);
    } catch (error) {
      console.error('Error fetching matches by team:', error);
      return err(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  },

  async create(
    match: Omit<Match, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Result<Match, Error>> {
    try {
      const result = await defaultDb.query(
        `INSERT INTO matches (
          api_id, home_team_id, away_team_id, home_score, away_score,
          status, date, round, season
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          match.api_id,
          match.home_team_id,
          match.away_team_id,
          match.home_score,
          match.away_score,
          match.status,
          match.date,
          match.round,
          match.season,
        ]
      );
      const createdMatch = parseDatabaseResult(matchSchema, result.rows[0]);
      return ok(createdMatch);
    } catch (error) {
      console.error('Error creating match:', error);
      return err(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  },

  async update(
    id: number,
    match: Partial<Omit<Match, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Result<Match, Error>> {
    try {
      const fields = Object.keys(match)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = Object.values(match);
      const query = `UPDATE matches SET ${fields} WHERE id = $1 RETURNING *`;

      const result = await defaultDb.query(query, [id, ...values]);
      const updatedMatch = parseDatabaseResult(matchSchema, result.rows[0]);
      return ok(updatedMatch);
    } catch (error) {
      console.error('Error updating match:', error);
      return err(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  },
};
