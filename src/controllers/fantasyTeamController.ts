import type { Context } from 'hono';
import { DatabaseError, NotFoundError } from '../errors';
import { fantasyTeamRepository } from '../repositories/fantasyTeamRepository';
import {
  InsufficientBudgetError,
  PositionLimitError,
  TeamLimitError,
  fantasyTeamService,
} from '../services/fantasyTeamService';

export const fantasyTeamController = {
  
  async getUserTeams(c: Context) {
    try {
      console.log('getUserTeams called');
      
      // Get user from context (set by auth middleware)
      const user = c.get('user');
      if (!user) {
        return c.json({ error: "User not authenticated" }, 401);
      }
      
      console.log('Using userId from context:', user.id);
      
      const result = await fantasyTeamRepository.getUserTeams(user.id);
      
      return result.match(
        (teams) => c.json({ userTeams: teams }),
        (error) => {
          console.error('Error in getUserTeams:', error);
          if (error instanceof NotFoundError) {
            return c.json({ message: 'No teams found for this user' }, 404);
          }
          if (error instanceof DatabaseError) {
            return c.json({ message: 'Database error occurred' }, 500);
          }
          return c.json({ message: 'Failed fetching user teams' }, 500);
        }
      );
    } catch (error) {
      console.error('Unexpected error in getUserTeams:', error);
      return c.json({ message: 'An unexpected error occurred' }, 500);
    }
  },

  async createTeam(c: Context) {
    try {
      // Get user from context (set by auth middleware)
      const user = c.get('user');
      if (!user) {
        return c.json({ error: "User not authenticated" }, 401);
      }

      const createdTeam = await c.req.json();
      createdTeam.user_id = user.id;
      
      const team = await fantasyTeamRepository.createFantasyTeam(createdTeam);
      return c.json({ team });
    } catch (error) {
      console.error('Error creating', error);
      return c.json({ message: 'Failed creating team' }, 500);
    }
  },

  async getTeamById(c: Context) {
    try {
      const teamId = c.req.param('id');
      const team = await fantasyTeamRepository.getTeamById(teamId);
      return c.json({ team });
    } catch (error) {
      console.error('Error fetching team');
      return c.json({ message: 'Failed fetching team by id' });
    }
  },

  async updateTeam(c: Context) {
    try {
      const teamId = c.req.param('id');
      const teamName = c.req.param('name');
      const teamBudget = c.req.param('budget');
      const team = await fantasyTeamRepository.updateFantasyTeam(
        teamId,
        teamName,
        Number.parseInt(teamBudget)
      );
      return c.json({ team });
    } catch (error) {
      console.error('Error updating team');
      return c.json({ message: 'Failed updating team' });
    }
  },

  async deleteTeam(c: Context) {
    try {
      const teamId = c.req.param('id');
      const team = await fantasyTeamRepository.deleteFantasyTeam(teamId);
      return c.json({ team });
    } catch (error) {
      console.error('Error deleting team');
      return c.json({ message: 'Failed deleting team' });
    }
  },

  async addPlayer(c: Context) {
    try {
      // Get user from context (set by auth middleware)
      const user = c.get('user');
      if (!user) {
        return c.json({ error: "User not authenticated" }, 401);
      }
      
      console.log('Using userId from context:', user.id);
      
      const addPlayer = await c.req.json();
      console.log({ addPlayer });
      
      const fantasyTeamId = await c.req.param('id');
      const playerId = await c.req.param('playerId');
      const isCaptain = addPlayer.is_captain;
      const isViceCaptain = addPlayer.is_vice_captain;
      const isOnBench = addPlayer.is_on_bench;

      if (Number.isNaN(fantasyTeamId) || Number.isNaN(playerId)) {
        return c.json({ error: 'Invalid team ID or player ID' }, 400);
      }

      const result = await fantasyTeamService.addPlayerToTeam(
        Number(fantasyTeamId),
        Number(playerId),
        user.id,
        isCaptain,
        isViceCaptain,
        isOnBench
      );

      console.log({ result }, 'result in controller');

      // Accessing the result, the value or an error!
      return result.match(
        // Success case
        (data) => {
          return c.json({
            success: true,
            message: 'Player added successfully',
            team: data,
          });
        },
        // Error case
        (error) => {
        console.log({ error }, 'error in controller');
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
            return c.json({ error: "Team not found" }, 404);
          }

          if (error instanceof DatabaseError) {
            return c.json({ error: "Database error" }, 500);
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
      const selectedPlayer = await c.req.json();
      console.log({ selectedPlayer }, 'selected player');
      const team = await fantasyTeamRepository.selectPlayer(selectedPlayer);
      return c.json({ team });
    } catch (error) {
      console.error('Error selecting players');
      return c.json({ message: 'Failed to select player' }, 500);
    }
  },

  async getTeamPlayers(c: Context) {
    try {
      const teamId = c.req.param('id')
      const team = await fantasyTeamRepository.getTeamSelection(Number(teamId))
      return c.json({ team })
    } catch (error) {
      console.error("Error getting players team")
      return c.json({ message: "Error getting team players" })
    }
  }
};
