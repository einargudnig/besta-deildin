import type { Context } from 'hono';
import { playerRepository } from '../repositories/playerRepository';
import { teamRepository } from '../repositories/teamRepository';

export const teamController = {
  async getAllTeams(c: Context) {
    try {
      const teams = await teamRepository.findAll();
      return c.json({ teams });
    } catch (error) {
      console.error('Error fetching teams:', error);
      return c.json({ error: 'Failed to fetch teams' }, 500);
    }
  },

  async getTeamById(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      const team = await teamRepository.findById(id);
      
      if (!team) {
        return c.json({ error: 'Team not found' }, 404);
      }
      
      return c.json({ team });
    } catch (error) {
      console.error('Error fetching team:', error);
      return c.json({ error: 'Failed to fetch team' }, 500);
    }
  },

  async getTeamPlayers(c: Context) {
    try {
      const teamId = parseInt(c.req.param('id'));
      const team = await teamRepository.findById(teamId);
      
      if (!team) {
        return c.json({ error: 'Team not found' }, 404);
      }
      
      const players = await playerRepository.getPlayersByTeam(teamId);
      return c.json({ team, players });
    } catch (error) {
      console.error('Error fetching team players:', error);
      return c.json({ error: 'Failed to fetch team players' }, 500);
    }
  }
};
