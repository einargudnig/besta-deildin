import type { Context } from 'hono';
import { leaderboardRepository } from '../repositories/leaderboardRepository';

export const leaderboardController = {
  async getGlobalLeaderboard(c: Context) {
    try {
      const globalLeaderboard = await leaderboardRepository.getGlobalLeaderboard();
      return c.json({ globalLeaderboard });
    } catch (error) {
      console.error('Error fetching global leaderboard', error);
      return c.json({ error: 'Failed to fetch global leaderboard' }, 500);
    }
  },

  async getGameweekLeaderboard(c: Context) {
    try {
      const id = Number.parseInt(c.req.param('id'));
      const gameWeekLeaderboard = await leaderboardRepository.getGameweekLeaderboard(id);
      return c.json({ gameWeekLeaderboard });
    } catch (error) {
      console.error();
      return c.json({ error: 'Failed to fetch Leaderboard for gameweek' }, 404);
    }
  },
};
