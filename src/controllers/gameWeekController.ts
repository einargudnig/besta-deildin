import type { Context } from 'hono';
import { gameweekRepository } from '../repositories/gameweekRepository';

export const gameweekController = {
  async getAllGameweeks(c: Context) {
    try {
      const allGameWeeks = await gameweekRepository.findAll();

      return c.json({ allGameWeeks });
    } catch (error) {
      console.error('Error getting all gameweeks', error);
      return c.json({ error: 'Failed to fetch all gameweeks' });
    }
  },
  async getCurrentGameweek(c: Context) {
    try {
      const startDate = c.req.param('startDate');

      const currentGameWeek = await gameweekRepository.getCurrent(startDate);

      return c.json({ currentGameWeek });
    } catch (error) {
      console.error('Error getting current gameweek', error);
      return c.json({ error: 'Failed to fetch current gameweek' });
    }
  },
  async getGameweekById(c: Context) {
    try {
      const id = Number.parseInt(c.req.param('id'));
      const gameWeek = await gameweekRepository.findById(id);

      return c.json({ gameWeek });
    } catch (error) {
      console.error('Error getting matches from gameweek', error);
      return c.json({ error: 'Failed to get single game week' });
    }
  },
  async getGameweekMatches(c: Context) {
    try {
      const gameWeekId = Number.parseInt(c.req.param('id'));
      const gameWeekMatches = await gameweekRepository.findMatches(gameWeekId);

      return c.json({ gameWeekMatches });
    } catch (error) {
      console.error('Error getting matches from gameweek', error);
      return c.json({ error: 'Failed to fetch matches' });
    }
  },
};
