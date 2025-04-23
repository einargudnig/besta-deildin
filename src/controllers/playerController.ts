import type { Context } from 'hono';
import { playerRepository } from '../repositories/playerRepository.ts';
import { PlayerStatsService } from '../services/playerStatsService';

export const playerController = {
  async getAllPlayers(c: Context) {
    try {
      const players = await playerRepository.findAll();
      return c.json({ players });
    } catch (error) {
      console.error('Error fetching players:', error);
      return c.json({ error: 'Failed to fetch players' }, 500);
    }
  },

  async getPlayerById(c: Context) {
    try {
      const id = Number.parseInt(c.req.param('id'));
      const player = await playerRepository.findById(id);

      if (!player) {
        return c.json({ error: 'Player not found' }, 404);
      }

      return c.json({ player });
    } catch (error) {
      console.error('Error fetching player:', error);
      return c.json({ error: 'Failed to fetch player' }, 500);
    }
  },

  async getPlayerStats(c: Context) {
    try {
      const playerId = Number.parseInt(c.req.param('id'));
      const matchId = Number.parseInt(c.req.query('matchId') ?? '0');
      const teamId = Number.parseInt(c.req.query('teamId') ?? '0');

      if (!matchId || !teamId) {
        return c.json({ error: 'matchId and teamId are required' }, 400);
      }

      const playerStatsService = PlayerStatsService.getInstance();
      const result = await playerStatsService.getPlayerStatsFromMatch(matchId, teamId);

      if (result.isErr()) {
        return c.json({ error: result.error.message }, 500);
      }

      const playerStats = result.value.response[0]?.players.find(p => p.player.id === playerId);
      if (!playerStats) {
        return c.json({ error: 'Player stats not found for this match' }, 404);
      }

      return c.json({ stats: playerStats.statistics[0] });
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return c.json({ error: 'Failed to fetch player stats' }, 500);
    }
  },

  async createPlayer(c: Context) {
    try {
      const body = await c.req.json();
      const player = await playerRepository.create(body);
      return c.json({ player }, 201);
    } catch (error) {
      console.error('Error creating player:', error);
      return c.json({ error: 'Failed to create player' }, 500);
    }
  },

  async updatePlayer(c: Context) {
    try {
      const id = Number.parseInt(c.req.param('id'));
      const body = await c.req.json();
      const player = await playerRepository.update(id, body);

      if (!player) {
        return c.json({ error: 'Player not found' }, 404);
      }

      return c.json({ player });
    } catch (error) {
      console.error('Error updating player:', error);
      return c.json({ error: 'Failed to update player' }, 500);
    }
  },

  async deletePlayer(c: Context) {
    try {
      const id = Number.parseInt(c.req.param('id'));
      const success = await playerRepository.delete(id);

      if (!success) {
        return c.json({ error: 'Player not found' }, 404);
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Error deleting player:', error);
      return c.json({ error: 'Failed to delete player' }, 500);
    }
  },
};
