import type { Context } from "hono"

export const fantasyTeamController = {
  // Fantasy Team repository
  async getUserTeams(c: Context) {
    try { } catch (error) {
      console.error("Error fetching users teams")
      return c.json({ message: "Failed fetching user team" })
    }
  },

  // Fantasy team repo
  async createTeam(c: Context) {
    try { } catch (error) {
      console.error("Error creating team")
      return c.json({ message: "Failed creating team" })
    }
  },

  // Fantasy Team repo
  async getTeamById(c: Context) {
    try { } catch (error) {
      console.error("Error fetching team")
      return c.json({ message: "Failed fetching team by id" })
    }
  },

  // Fantasy Team repo
  async updateTeam(c: Context) {
    try { } catch (error) {
      console.error("Error updating team")
      return c.json({ message: "Failed updating team" })
    }
  },

  // Fantasy Team repo
  async deleteTeam(c: Context) {
    try { } catch (error) {
      console.error("Error deleting team")
      return c.json({ message: "Failed deleting team" })
    }
  },

  // TeamSelect repo
  async selectPlayers(c: Context) {
    try { } catch (error) {
      console.error("Error selecting players")
      return c.json({ message: "Failed to select player" })
    }
  },

  // Fantasy Team repo
  async getTeamPlayers(c: Context) {
    try { } catch (error) {
      console.error("Error getting players team")
      return c.json({ message: "Error getting team players" })
    }
  }
}