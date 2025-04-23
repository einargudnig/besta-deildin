import type { Context } from "hono";
import { matchesRepository } from "../repositories/matchesRepository";

export const matchesController = {
  async getAllMatches(c: Context) {
    try {
      const matches = await matchesRepository.findAll();
      return c.json({ matches });
    } catch (error) {
      console.error('Error fetching matches:', error);
      return c.json({ error: 'Failed to fetch matches' }, 500);
    }
  },
}