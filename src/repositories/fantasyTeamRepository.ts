import { Result, err, ok } from "neverthrow";
import db from "../config/database";
import { DatabaseError, NotFoundError } from "../errors";
export interface FantasyTeam { 
  id: number;
  user_id: string;
  name: string;
  budget: number;
  total_points: number;
  created_at: number;
}

export interface SelectedPlayer {
  id: number;
  fantasy_team_id: number;
  gameweek_id: number;
  player_id: number;
  is_captain: boolean;
  is_vice_captain: boolean;
  is_on_bench: boolean;
}

export const fantasyTeamRepository = {
  // Might come handy for leaderboards
  async getAllFantasyTeams(): Promise<Result<FantasyTeam[], NotFoundError | DatabaseError>> {
    try { 
      const result = await db.query("SELECT * FROM fantasy_teams")

      if (result.rows.length === 0) {
        return err(new NotFoundError("Failed finding fantasy teams"))
      }

      return ok(result.rows)
    } catch (error) {
      console.error("Error fetching all fantasy teams", error)
      return err(new DatabaseError("Failed to fetch all fantasy teams"))
    }
  },

  async getUserTeams(userId: string): Promise<Result<FantasyTeam[], NotFoundError | DatabaseError>> {
    try { 
      console.log({ userId }, "user id in repository")
      const result = await db.query("SELECT * FROM fantasy_teams WHERE user_id = $1", [userId])

      if (result.rows.length === 0) {
        return err(new NotFoundError("Failed finding fantasy teams"))
      }

      return ok(result.rows)
    } catch (error) {
      console.error("Error fetching user teams", error)
      return err(new DatabaseError("Failed to fetch user teams"))
    }
  },

  async getTeamById(teamId: string): Promise<Result<FantasyTeam, NotFoundError | DatabaseError>> {
    try { 
      const result = await db.query("SELECT * FROM fantasy_teams WHERE id = $1", [teamId])

      if (result.rows.length === 0) {
        return err(new NotFoundError("Failed finding fantasy team"))
      }

      return ok(result.rows[0])
    } catch (error) {
      console.error("Error fetching team by id", error)
      return err(new DatabaseError("Failed to fetch team by id"))
    }
  },

  async createFantasyTeam(createdTeam: FantasyTeam): Promise<Result<FantasyTeam, DatabaseError>> {
    try {
      console.log({ createdTeam }, "team in repository, inside try block")
      const result = await db.query("INSERT INTO fantasy_teams (user_id, name, budget) VALUES ($1, $2, $3) RETURNING *", [createdTeam.user_id, createdTeam.name, createdTeam.budget])
      console.log({ result }, "result in repository")
      if (result.rows.length === 0) {
        return err(new NotFoundError("Failed creating fantasy team"))
      }

      return ok(result.rows[0])
    } catch (error) {
      console.error("Error creating fantasy team", error)
      return err(new DatabaseError("Failed to create fantasy team"))
    }
  },
  
  async updateFantasyTeam(teamId: string, teamName: string, teamBudget: number): Promise<Result<FantasyTeam, DatabaseError>> {
    try { 
      const result = await db.query("UPDATE fantasy_teams SET name = $1, budget = $2 WHERE id = $3 RETURNING *", [teamName, teamBudget, teamId])

      if (result.rows.length === 0) {
        return err(new NotFoundError("Failed updating fantasy team"))
      }

      return ok(result.rows[0])
    } catch (error) {
      console.error("Error updating fantasy team", error)
      return err(new DatabaseError("Failed to update fantasy team"))
    }
  },
  
  async deleteFantasyTeam(teamId: string): Promise<Result<FantasyTeam, DatabaseError>> {
    try { 
      const result = await db.query("DELETE FROM fantasy_teams WHERE id = $1 RETURNING *", [teamId])

      if (result.rows.length === 0) {
        return err(new NotFoundError("Failed deleting fantasy team"))
      }

      return ok(result.rows[0])
    } catch (error) {
      console.error("Error deleting fantasy team", error)
      return err(new DatabaseError("Failed to delete fantasy team"))
    }
  },

  async selectPlayer(selectedPlayer: SelectedPlayer): Promise<Result<SelectedPlayer, DatabaseError>> {
    try { 
      const result = await db.query("INSERT INTO team_selections (id, fantasy_team_id, gameweek_id, player_id, is_captain, is_vice_captain, is_on_bench) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [selectedPlayer.id, selectedPlayer.fantasy_team_id, selectedPlayer.gameweek_id, selectedPlayer.player_id, selectedPlayer.is_captain, selectedPlayer.is_vice_captain, selectedPlayer.is_on_bench])

      if (result.rows.length === 0) {
        return err(new NotFoundError("Failed selecting player"))
      }

      return ok(result.rows[0]) 
    } catch (error) {
      console.error("Error selecting player", error)
      return err(new DatabaseError("Failed to select player"))
    }
  },

  // TODO: might have separate increase and decrease functions?
  async updateFantasyTeamBudget(teamId: string, amount: number): Promise<Result<FantasyTeam, DatabaseError>> {
    try { 
      const result = await db.query("UPDATE fantasy_teams SET budget = budget + $1 WHERE id = $2 RETURNING *", [amount, teamId])

      if (result.rows.length === 0) {
        return err(new NotFoundError("Failed updating fantasy team budget"))
      }

      return ok(result.rows[0])
    } catch (error) {
      console.error("Error updating fantasy team budget", error)
      return err(new DatabaseError("Failed to update fantasy team budget"))
    }
  },
  
  async updateFantasyTeamPoints(teamId: string, points: number): Promise<Result<FantasyTeam, DatabaseError>> {
    try { 
      const result = await db.query("UPDATE fantasy_teams SET total_points = $1 WHERE id = $2 RETURNING *", [points, teamId])

      if (result.rows.length === 0) {
        return err(new NotFoundError("Failed updating fantasy team points"))
      }

      return ok(result.rows[0])
    } catch (error) {
      console.error("Error updating fantasy team points", error)
      return err(new DatabaseError("Failed to update fantasy team points"))
    }
  },
}