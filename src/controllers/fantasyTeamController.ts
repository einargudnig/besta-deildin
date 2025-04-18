import type { Context } from "hono"
import { fantasyTeamRepository } from "../repositories/fantasyTeamRepository"

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