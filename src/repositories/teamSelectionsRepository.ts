import { type Result, err, ok } from 'neverthrow';
import db from '../config/database';
import { DatabaseError, NotFoundError } from '../errors';

export interface TeamSelection {
  id: number;
  fantasy_team_id: number;
  gameweek_id: number;
  player_id: number;
  is_captain: boolean;
  is_vice_captain: boolean;
  is_on_bench: boolean;
}

export const teamSelectionRepository = {
  async getTeamSelection(
    teamId: number
  ): Promise<Result<TeamSelection[], DatabaseError | NotFoundError>> {
    try {
      const result = await db.query('SELECT * FROM team_selections WHERE fantasy_team_id = $1', [
        teamId,
      ]);

      if (result.rows.length === 0) {
        return err(new NotFoundError('No team selections found for this team'));
      }

      return ok(result.rows);
    } catch (error) {
      console.error('Failed to get team selection', error);
      return err(new DatabaseError('Failed to get team selection', { cause: error }));
    }
  },

  async getTeamSelectionForWeek(
    teamId: number,
    gameweekId: number
  ): Promise<Result<TeamSelection[], DatabaseError | NotFoundError>> {
    try {
      const result = await db.query(
        'SELECT * FROM team_selections WHERE fantasy_team_id = $1 AND gameweek_id = $2',
        [teamId, gameweekId]
      );

      if (result.rows.length === 0) {
        return err(new NotFoundError('No team selections found for this team and gameweek'));
      }

      return ok(result.rows);
    } catch (error) {
      console.error('Failed to get team selection for week', error);
      return err(new DatabaseError('Failed to get team selection for week', { cause: error }));
    }
  },

  async selectPlayer(
    playerId: number,
    teamId: number,
    gameweekId: number
  ): Promise<Result<TeamSelection, DatabaseError>> {
    try {
      const result = await db.query(
        'INSERT INTO team_selections (fantasy_team_id, gameweek_id, player_id, is_captain, is_vice_captain, is_on_bench) VALUES ($1, $2, $3, false, false, false) RETURNING *',
        [teamId, gameweekId, playerId]
      );
      return ok(result.rows[0]);
    } catch (error) {
      console.error('Failed to select player', error);
      return err(new DatabaseError('Failed to select player', { cause: error }));
    }
  },

  async makeViceCaptain(
    playerId: number,
    teamId: number,
    gameweekId: number
  ): Promise<Result<TeamSelection, DatabaseError>> {
    try {
      // First, remove vice captain from any other player
      await db.query(
        'UPDATE team_selections SET is_vice_captain = false WHERE fantasy_team_id = $1 AND gameweek_id = $2',
        [teamId, gameweekId]
      );

      // Then set the new vice captain
      const result = await db.query(
        'UPDATE team_selections SET is_vice_captain = true WHERE player_id = $1 AND fantasy_team_id = $2 AND gameweek_id = $3 RETURNING *',
        [playerId, teamId, gameweekId]
      );
      return ok(result.rows[0]);
    } catch (error) {
      console.error('Failed to make vice captain', error);
      return err(new DatabaseError('Failed to make vice captain', { cause: error }));
    }
  },

  async moveToBench(
    playerId: number,
    teamId: number,
    gameweekId: number
  ): Promise<Result<TeamSelection, DatabaseError>> {
    try {
      const result = await db.query(
        'UPDATE team_selections SET is_on_bench = true WHERE player_id = $1 AND fantasy_team_id = $2 AND gameweek_id = $3 RETURNING *',
        [playerId, teamId, gameweekId]
      );
      return ok(result.rows[0]);
    } catch (error) {
      console.error('Failed to move player to bench', error);
      return err(new DatabaseError('Failed to move player to bench', { cause: error }));
    }
  },

  async moveToStarting(
    playerId: number,
    teamId: number,
    gameweekId: number
  ): Promise<Result<TeamSelection, DatabaseError>> {
    try {
      const result = await db.query(
        'UPDATE team_selections SET is_on_bench = false WHERE player_id = $1 AND fantasy_team_id = $2 AND gameweek_id = $3 RETURNING *',
        [playerId, teamId, gameweekId]
      );
      return ok(result.rows[0]);
    } catch (error) {
      console.error('Failed to move player to starting lineup', error);
      return err(new DatabaseError('Failed to move player to starting lineup', { cause: error }));
    }
  },
};
