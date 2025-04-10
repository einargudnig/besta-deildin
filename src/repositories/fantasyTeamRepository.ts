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

  async createFantasyTeam(userId: string, teamName: string, teamBudget: number): Promise<Result<FantasyTeam, DatabaseError>> {
    try { 
      const result = await db.query("INSERT INTO fantasy_teams (user_id, name, budget) VALUES ($1, $2, $3) RETURNING *", [userId, teamName, teamBudget])

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