import type { Context } from "hono";
import { playerRepository } from "../repositories/playerRepository";

export const playerController = {
  async getAllPlayers(c: Context) {
    try {
      const players = await playerRepository.getAllPlayers();
      return c.json({ players });
    } catch (error) {
      console.error("Error fetching players:", error);
      return c.json({ error: "Failed to fetch players" }, 500);
    }
  },

  async getPlayerById(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      const player = await playerRepository.findById(id);

      if (!player) {
        return c.json({ error: "Player not found" }, 404);
      }

      return c.json({ player });
    } catch (error) {
      console.error("Error fetching player:", error);
      return c.json({ error: "Failed to fetch player" }, 500);
    }
  },

  async createPlayer(c: Context) {
    try {
      const body = await c.req.json();
      const player = await playerRepository.create(body);
      return c.json({ player }, 201);
    } catch (error) {
      console.error("Error creating player:", error);
      return c.json({ error: "Failed to create player" }, 500);
    }
  },

  async updatePlayer(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      const body = await c.req.json();
      const player = await playerRepository.update(id, body);

      if (!player) {
        return c.json({ error: "Player not found" }, 404);
      }

      return c.json({ player });
    } catch (error) {
      console.error("Error updating player:", error);
      return c.json({ error: "Failed to update player" }, 500);
    }
  },

  async deletePlayer(c: Context) {
    try {
      const id = parseInt(c.req.param("id"));
      const success = await playerRepository.delete(id);

      if (!success) {
        return c.json({ error: "Player not found" }, 404);
      }

      return c.json({ success: true });
    } catch (error) {
      console.error("Error deleting player:", error);
      return c.json({ error: "Failed to delete player" }, 500);
    }
  },
};
