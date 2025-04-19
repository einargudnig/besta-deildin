import type { Context } from "hono"
import { DatabaseError, NotFoundError } from "../errors"
import { fantasyTeamRepository } from "../repositories/fantasyTeamRepository"
import { fantasyTeamService, InsufficientBudgetError, PositionLimitError, TeamLimitError } from "../services/fantasyTeamService"

export const fantasyTeamController = {
  
  async getUserTeams(c: Context) {
    try { 
      const userId = await c.req.json()
      console.log({ userId }, "user id")
      const userTeams = await fantasyTeamRepository.getUserTeams(userId)
      return c.json({ userTeams })
    } catch (error) {

      console.error("Error fetching users teams")
      return c.json({ message: "Failed fetching user team" })
    }
  },

  async createTeam(c: Context) {
    try { 
      const createdTeam = await c.req.json()
      console.log({ createdTeam }, "team in controller")
      const team = await fantasyTeamRepository.createFantasyTeam(createdTeam)
      return c.json({ team })
    } catch (error) {
      console.error("Error creating", error)
      return c.json({ message: "Failed creating team" }, 500)
    }
  },

  async getTeamById(c: Context) {
    try { 
      const teamId = c.req.param('id')
      const team = await fantasyTeamRepository.getTeamById(teamId)
      return c.json({ team })
    } catch (error) {
      console.error("Error fetching team")
      return c.json({ message: "Failed fetching team by id" })
    }
  },

  async updateTeam(c: Context) {
    try { 
      const teamId = c.req.param('id')
      const teamName = c.req.param('name')
      const teamBudget = c.req.param('budget')
      const team = await fantasyTeamRepository.updateFantasyTeam(teamId, teamName, parseInt(teamBudget))
      return c.json({ team })
    } catch (error) {
      console.error("Error updating team")
      return c.json({ message: "Failed updating team" })
    }
  },

  async deleteTeam(c: Context) {
    try { 
      const teamId = c.req.param('id')
      const team = await fantasyTeamRepository.deleteFantasyTeam(teamId)
      return c.json({ team })
    } catch (error) {
      console.error("Error deleting team")
      return c.json({ message: "Failed deleting team" })
    }
  },

  async addPlayer(c: Context) {
    try {
      const addPlayer = await c.req.json()
      console.log({ addPlayer })
      const fantasyTeamId = addPlayer.fantasy_team_id
      const playerId = addPlayer.player_id
      // const userId = parseInt(c.get('user').sub);
      const isCaptain = addPlayer.is_captain
      const isViceCaptain = addPlayer.is_vice_captain
      const isOnBench = addPlayer.is_on_bench
      
      if (isNaN(fantasyTeamId) || isNaN(playerId)) {
        return c.json({ error: 'Invalid team ID or player ID' }, 400);
      }
      
      const result = await fantasyTeamService.addPlayerToTeam(
        fantasyTeamId, 
        playerId,
        isCaptain,
        isViceCaptain,
        isOnBench
      );
      
      return result.match(
        // Success case
        (data) => {
          return c.json({ 
            success: true, 
            message: 'Player added successfully',
            team: data
          });
        },
        // Error case
        (error) => {
          if (error instanceof InsufficientBudgetError) {
            return c.json({ error: error.message }, 400);
          }
          
          if (error instanceof PositionLimitError) {
            return c.json({ error: error.message }, 400);
          }
          
          if (error instanceof TeamLimitError) {
            return c.json({ error: error.message }, 400);
          }
          
          if (error instanceof NotFoundError) {
            return c.json({ error: error.message }, 404);
          }
          
          if (error instanceof DatabaseError) {
            return c.json({ error: error.message }, 500);
          }
          
          console.error('Error adding player:', error);
          return c.json({ error: 'Failed to add player to team' }, 500);
        }
      );
    } catch (error) {
      console.error('Unexpected error:', error);
      return c.json({ error: 'An unexpected error occurred' }, 500);
    }
  },

  async selectPlayer(c: Context) {
    try { 
      const selectedPlayer = await c.req.json()
      console.log({ selectedPlayer }, "selected player")
      const team = await fantasyTeamRepository.selectPlayer(selectedPlayer)
      return c.json({ team })
    } catch (error) {
      console.error("Error selecting players")
      return c.json({ message: "Failed to select player" }, 500)
    }
  },

  // async getTeamPlayers(c: Context) {
  //   try { 
  //     const teamId = c.req.param('id')
  //     const team = await fantasyTeamRepository.getTeamPlayers(teamId)
  //     return c.json({ team })
  //   } catch (error) {
  //     console.error("Error getting players team")
  //     return c.json({ message: "Error getting team players" })
  //   }
  // }
}