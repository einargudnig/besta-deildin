import { type Result, err, ok } from 'neverthrow';
import db from '../config/database';
import { DatabaseError, NotFoundError } from '../errors';
import {
  type FantasyTeam,
  type TeamSelection,
  fantasyTeamSchema,
  parseDatabaseResult,
  parseDatabaseResults,
  teamSelectionSchema
} from '../schemas';

export type { FantasyTeam, TeamSelection };

export interface TeamSelectionWithPlayer {
  id: number;
  player_id: number;
  is_on_bench: boolean;
  position: string;
  team_id: number;
  team_name: string;
}

export const fantasyTeamRepository = {
  // Might come handy for leaderboards
  async getAllFantasyTeams(): Promise<Result<FantasyTeam[], NotFoundError | DatabaseError>> {
    try {
      const result = await db.query('SELECT * FROM fantasy_teams');

      if (result.rows.length === 0) {
        return err(new NotFoundError('Failed finding fantasy teams'));
      }

      const teams = parseDatabaseResults(fantasyTeamSchema, result.rows);
      return ok(teams);
    } catch (error) {
      console.error('Error fetching all fantasy teams', error);
      return err(new DatabaseError('Failed to fetch all fantasy teams'));
    }
  },

  async getUserTeams(
    userId: string
  ): Promise<Result<FantasyTeam[], NotFoundError | DatabaseError>> {
    try {
      console.log({ userId }, 'user id in repository');
      const result = await db.query('SELECT * FROM fantasy_teams WHERE user_id = $1', [userId]);

      if (result.rows.length === 0) {
        return err(new NotFoundError('Failed finding fantasy teams'));
      }

      const teams = parseDatabaseResults(fantasyTeamSchema, result.rows);
      return ok(teams);
    } catch (error) {
      console.error('Error fetching user teams', error);
      return err(new DatabaseError('Failed to fetch user teams'));
    }
  },

  async getTeamById(teamId: number): Promise<Result<FantasyTeam, NotFoundError | DatabaseError>> {
    try {
      console.log({ teamId }, 'team id in repository');
      const result = await db.query('SELECT * FROM fantasy_teams WHERE id = $1', [teamId]);

      if (result.rows.length === 0) {
        return err(new NotFoundError('Failed finding fantasy team'));
      }

      const team = parseDatabaseResult(fantasyTeamSchema, result.rows[0]);
      return ok(team);
    } catch (error) {
      console.error('Error fetching team by id', error);
      return err(new DatabaseError('Failed to fetch team by id'));
    }
  },

  async createFantasyTeam(createdTeam: FantasyTeam): Promise<Result<FantasyTeam, DatabaseError>> {
    try {
      console.log({ createdTeam }, 'team in repository, inside try block');
      const result = await db.query(
        'INSERT INTO fantasy_teams (user_id, name, budget) VALUES ($1, $2, $3) RETURNING *',
        [createdTeam.user_id, createdTeam.name, createdTeam.budget]
      );
      
      if (result.rows.length === 0) {
        return err(new NotFoundError('Failed creating fantasy team'));
      }

      const team = parseDatabaseResult(fantasyTeamSchema, result.rows[0]);
      return ok(team);
    } catch (error) {
      console.error('Error creating fantasy team', error);
      return err(new DatabaseError('Failed to create fantasy team'));
    }
  },

  async updateFantasyTeam(
    teamId: string,
    teamName: string,
    teamBudget: number
  ): Promise<Result<FantasyTeam, DatabaseError>> {
    try {
      const result = await db.query(
        'UPDATE fantasy_teams SET name = $1, budget = $2 WHERE id = $3 RETURNING *',
        [teamName, teamBudget, teamId]
      );

      if (result.rows.length === 0) {
        return err(new NotFoundError('Failed updating fantasy team'));
      }

      const team = parseDatabaseResult(fantasyTeamSchema, result.rows[0]);
      return ok(team);
    } catch (error) {
      console.error('Error updating fantasy team', error);
      return err(new DatabaseError('Failed to update fantasy team'));
    }
  },

  async deleteFantasyTeam(teamId: string): Promise<Result<FantasyTeam, DatabaseError>> {
    try {
      const result = await db.query('DELETE FROM fantasy_teams WHERE id = $1 RETURNING *', [
        teamId,
      ]);

      if (result.rows.length === 0) {
        return err(new NotFoundError('Failed deleting fantasy team'));
      }

      const team = parseDatabaseResult(fantasyTeamSchema, result.rows[0]);
      return ok(team);
    } catch (error) {
      console.error('Error deleting fantasy team', error);
      return err(new DatabaseError('Failed to delete fantasy team'));
    }
  },

  async selectPlayer(
    selectedPlayer: TeamSelection
  ): Promise<Result<TeamSelection, DatabaseError>> {
    try {
      const result = await db.query(
        'INSERT INTO team_selections (id, fantasy_team_id, gameweek_id, player_id, is_captain, is_vice_captain, is_on_bench) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [
          selectedPlayer.id,
          selectedPlayer.fantasy_team_id,
          selectedPlayer.gameweek_id,
          selectedPlayer.player_id,
          selectedPlayer.is_captain,
          selectedPlayer.is_vice_captain,
          selectedPlayer.is_on_bench,
        ]
      );

      if (result.rows.length === 0) {
        return err(new NotFoundError('Failed selecting player'));
      }

      const player = parseDatabaseResult(teamSelectionSchema, result.rows[0]);
      return ok(player);
    } catch (error) {
      console.error('Error selecting player', error);
      return err(new DatabaseError('Failed to select player'));
    }
  },

  // TODO: might have separate increase and decrease functions?
  async updateFantasyTeamBudget(
    teamId: string,
    amount: number
  ): Promise<Result<FantasyTeam, DatabaseError>> {
    try {
      const result = await db.query(
        'UPDATE fantasy_teams SET budget = budget + $1 WHERE id = $2 RETURNING *',
        [amount, teamId]
      );

      if (result.rows.length === 0) {
        return err(new NotFoundError('Failed updating fantasy team budget'));
      }

      return ok(result.rows[0]);
    } catch (error) {
      console.error('Error updating fantasy team budget', error);
      return err(new DatabaseError('Failed to update fantasy team budget'));
    }
  },

  async updateFantasyTeamPoints(
    teamId: string,
    points: number
  ): Promise<Result<FantasyTeam, DatabaseError>> {
    try {
      const result = await db.query(
        'UPDATE fantasy_teams SET total_points = $1 WHERE id = $2 RETURNING *',
        [points, teamId]
      );

      if (result.rows.length === 0) {
        return err(new NotFoundError('Failed updating fantasy team points'));
      }

      return ok(result.rows[0]);
    } catch (error) {
      console.error('Error updating fantasy team points', error);
      return err(new DatabaseError('Failed to update fantasy team points'));
    }
  },

  async updateTeamBudget(
    teamId: number,
    playerId: number,
    newBudget: number
  ): Promise<{ success: boolean }> {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Update team budget
      await client.query('UPDATE fantasy_teams SET budget = $1 WHERE id = $2', [
        newBudget,
        teamId,
      ]);

      // Get current gameweek
      const gameweekResult = await client.query('SELECT id FROM gameweeks WHERE is_current = true');
      const gameweekId = gameweekResult.rows[0]?.id;

      // Add player to team selection
      await client.query(
        'INSERT INTO team_selections (fantasy_team_id, gameweek_id, player_id) VALUES ($1, $2, $3)',
        [teamId, gameweekId, playerId]
      );

      await client.query('COMMIT');

      // Return updated team
      const teamResult = await client.query('SELECT * FROM fantasy_teams WHERE id = $1', [
        teamId,
      ]);

      return { success: teamResult.rows.length > 0 };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getCurrentGameweek(): Promise<{ id: number }> {
    const result = await db.query('SELECT id FROM gameweeks WHERE is_current = true');
    if (result.rows.length === 0) {
      throw new Error('No current gameweek found');
    }
    return result.rows[0];
  },

  async getTeamSelection(fantasyTeamId: number): Promise<TeamSelectionWithPlayer[]> {
    const currentGameweek = await this.getCurrentGameweek();
    const result = await db.query(
      `SELECT ts.id, ts.player_id, ts.is_on_bench, p.position, p.team_id, t.name as team_name
        FROM team_selections ts
        JOIN players p ON ts.player_id = p.id
        JOIN teams t ON p.team_id = t.id
        WHERE ts.fantasy_team_id = $1 AND ts.gameweek_id = $2`,
      [fantasyTeamId, currentGameweek.id]
    );
    return result.rows;
  },
};
