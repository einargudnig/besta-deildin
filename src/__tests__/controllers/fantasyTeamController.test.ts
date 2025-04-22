import type { Context } from 'hono';
import { err, ok } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fantasyTeamController } from '../../controllers/fantasyTeamController';
import { NotFoundError } from '../../errors';
import { fantasyTeamRepository } from '../../repositories/fantasyTeamRepository';
import type { FantasyTeam, TeamSelection } from '../../schemas';
import {
  InsufficientBudgetError,
  PositionLimitError,
  TeamLimitError,
  fantasyTeamService,
} from '../../services/fantasyTeamService';

// Mock the repositories and services
vi.mock('../../repositories/fantasyTeamRepository', () => ({
  fantasyTeamRepository: {
    getUserTeams: vi.fn(),
    createFantasyTeam: vi.fn(),
    getTeamById: vi.fn(),
    getTeamSelection: vi.fn(),
  },
}));

vi.mock('../../services/fantasyTeamService', () => ({
  fantasyTeamService: {
    addPlayerToTeam: vi.fn(),
  },
  InsufficientBudgetError: class InsufficientBudgetError extends Error {},
  PositionLimitError: class PositionLimitError extends Error {},
  TeamLimitError: class TeamLimitError extends Error {},
}));

// Mock the fantasyTeam model
vi.mock('../../models/fantasyTeam', () => ({
  FantasyTeam: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

describe('fantasyTeamController', () => {
  let mockContext: Context;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    // Create a mock context with proper typing
    mockContext = {
      get: vi.fn(),
      set: vi.fn(),
      req: {
        param: vi.fn(),
        json: vi.fn(),
      },
      json: vi.fn(),
      env: {},
      finalized: false,
      error: null,
    } as unknown as Context;
  });

  describe('getUserTeams', () => {
    it('should return user teams when authenticated', async () => {
      // Setup
      const mockUser = { id: '1' };
      const mockTeams: FantasyTeam[] = [
        {
          id: 1,
          user_id: 1,
          name: 'Team 1',
          budget: 100,
          total_points: 0,
          created_at: new Date(),
        },
      ];

      vi.mocked(mockContext.get).mockReturnValue(mockUser);
      vi.mocked(fantasyTeamRepository.getUserTeams).mockResolvedValue(ok(mockTeams));

      // Execute
      await fantasyTeamController.getUserTeams(mockContext);

      // Verify
      expect(mockContext.json).toHaveBeenCalledWith({ userTeams: mockTeams });
    });

    it('should return 401 when user is not authenticated', async () => {
      // Setup
      vi.mocked(mockContext.get).mockReturnValue(undefined);

      // Execute
      await fantasyTeamController.getUserTeams(mockContext);

      // Verify
      expect(mockContext.json).toHaveBeenCalledWith({ error: 'User not authenticated' }, 401);
    });
  });

  describe('createTeam', () => {
    it('should create a team when authenticated', async () => {
      // Setup
      const mockUser = { id: '1' };
      const mockTeam = { name: 'New Team' };
      const mockCreatedTeam: FantasyTeam = {
        id: 1,
        user_id: 1,
        name: 'New Team',
        budget: 100,
        total_points: 0,
        created_at: new Date(),
      };

      vi.mocked(mockContext.get).mockReturnValue(mockUser);
      vi.mocked(mockContext.req.json).mockResolvedValue(mockTeam);
      vi.mocked(fantasyTeamRepository.createFantasyTeam).mockResolvedValue(ok(mockCreatedTeam));

      // Execute
      await fantasyTeamController.createTeam(mockContext);

      // Verify
      expect(fantasyTeamRepository.createFantasyTeam).toHaveBeenCalledWith({
        ...mockTeam,
        user_id: Number(mockUser.id),
      });
      expect(mockContext.json).toHaveBeenCalledWith({ team: mockCreatedTeam });
    });

    it('should return 401 when user is not authenticated', async () => {
      // Setup
      vi.mocked(mockContext.get).mockReturnValue(undefined);

      // Execute
      await fantasyTeamController.createTeam(mockContext);

      // Verify
      expect(mockContext.json).toHaveBeenCalledWith({ error: 'User not authenticated' }, 401);
    });
  });

  describe('getTeamById', () => {
    it('should return team by id', async () => {
      // Setup
      const mockTeam: FantasyTeam = {
        id: 1,
        user_id: 1,
        name: 'Team 1',
        budget: 100,
        total_points: 0,
        created_at: new Date(),
      };
      vi.mocked(mockContext.req.param).mockReturnValue('1');
      vi.mocked(fantasyTeamRepository.getTeamById).mockResolvedValue(ok(mockTeam));

      // Execute
      await fantasyTeamController.getTeamById(mockContext);

      // Verify
      expect(mockContext.json).toHaveBeenCalledWith({ team: mockTeam });
    });

    it('should handle errors when team not found', async () => {
      // Setup
      vi.mocked(mockContext.req.param).mockReturnValue('1');
      vi.mocked(fantasyTeamRepository.getTeamById).mockResolvedValue(
        err(new NotFoundError('Team not found'))
      );

      // Execute
      await fantasyTeamController.getTeamById(mockContext);

      // Verify
      expect(mockContext.json).toHaveBeenCalledWith({ message: 'Failed fetching team by id' });
    });
  });

  describe('addPlayer', () => {
    it('should add player to team successfully', async () => {
      // Setup
      const mockUser = { id: '1' };
      const mockTeamId = '1';
      const mockPlayerId = '2';
      const mockPlayerData = {
        is_captain: false,
        is_vice_captain: false,
        is_on_bench: false,
      };
      const mockResult: TeamSelection = {
        id: 1,
        fantasy_team_id: 1,
        gameweek_id: 1,
        player_id: 2,
        is_captain: false,
        is_vice_captain: false,
        is_on_bench: false,
      };

      vi.mocked(mockContext.get).mockReturnValue(mockUser);
      vi.mocked(mockContext.req.param).mockImplementation((key: string) => {
        if (key === 'id') return mockTeamId;
        if (key === 'playerId') return mockPlayerId;
        return '';
      });
      vi.mocked(mockContext.req.json).mockResolvedValue(mockPlayerData);
      vi.mocked(fantasyTeamService.addPlayerToTeam).mockResolvedValue(ok(mockResult));

      // Execute
      await fantasyTeamController.addPlayer(mockContext);

      // Verify
      expect(fantasyTeamService.addPlayerToTeam).toHaveBeenCalledWith(
        Number(mockTeamId),
        Number(mockPlayerId),
        Number(mockUser.id),
        mockPlayerData.is_captain,
        mockPlayerData.is_vice_captain,
        mockPlayerData.is_on_bench
      );
      expect(mockContext.json).toHaveBeenCalledWith({
        success: true,
        message: 'Player added successfully',
        team: mockResult,
      });
    });

    it('should handle insufficient budget error', async () => {
      // Setup
      const mockUser = { id: '1' };
      const mockError = new InsufficientBudgetError(100, 200);

      vi.mocked(mockContext.get).mockReturnValue(mockUser);
      vi.mocked(mockContext.req.param).mockImplementation((key: string) => {
        if (key === 'id') return '1';
        if (key === 'playerId') return '2';
        return '';
      });
      vi.mocked(mockContext.req.json).mockResolvedValue({});
      vi.mocked(fantasyTeamService.addPlayerToTeam).mockResolvedValue(err(mockError));

      // Execute
      await fantasyTeamController.addPlayer(mockContext);

      // Verify
      expect(mockContext.json).toHaveBeenCalledWith({ error: mockError.message }, 400);
    });

    it('should handle position limit error', async () => {
      // Setup
      const mockUser = { id: '1' };
      const mockError = new PositionLimitError('GK', 2);

      vi.mocked(mockContext.get).mockReturnValue(mockUser);
      vi.mocked(mockContext.req.param).mockImplementation((key: string) => {
        if (key === 'id') return '1';
        if (key === 'playerId') return '2';
        return '';
      });
      vi.mocked(mockContext.req.json).mockResolvedValue({});
      vi.mocked(fantasyTeamService.addPlayerToTeam).mockResolvedValue(err(mockError));

      // Execute
      await fantasyTeamController.addPlayer(mockContext);

      // Verify
      expect(mockContext.json).toHaveBeenCalledWith({ error: mockError.message }, 400);
    });

    it('should handle team limit error', async () => {
      // Setup
      const mockUser = { id: '1' };
      const mockError = new TeamLimitError('Manchester United', 3);

      vi.mocked(mockContext.get).mockReturnValue(mockUser);
      vi.mocked(mockContext.req.param).mockImplementation((key: string) => {
        if (key === 'id') return '1';
        if (key === 'playerId') return '2';
        return '';
      });
      vi.mocked(mockContext.req.json).mockResolvedValue({});
      vi.mocked(fantasyTeamService.addPlayerToTeam).mockResolvedValue(err(mockError));

      // Execute
      await fantasyTeamController.addPlayer(mockContext);

      // Verify
      expect(mockContext.json).toHaveBeenCalledWith({ error: mockError.message }, 400);
    });
  });

  describe('getTeamPlayers', () => {
    it('should return team players', async () => {
      // Setup
      const mockTeamId = '1';
      const mockPlayers = [{ id: 1, name: 'Player 1' }];

      vi.mocked(mockContext.req.param).mockReturnValue(mockTeamId);
      vi.mocked(fantasyTeamRepository.getTeamSelection).mockResolvedValue(mockPlayers);

      // Execute
      await fantasyTeamController.getTeamPlayers(mockContext);

      // Verify
      expect(fantasyTeamRepository.getTeamSelection).toHaveBeenCalledWith(Number(mockTeamId));
      expect(mockContext.json).toHaveBeenCalledWith({ team: mockPlayers });
    });

    it('should handle errors when fetching team players', async () => {
      // Setup
      vi.mocked(mockContext.req.param).mockReturnValue('1');
      vi.mocked(fantasyTeamRepository.getTeamSelection).mockRejectedValue(
        new Error('Database error')
      );

      // Execute
      await fantasyTeamController.getTeamPlayers(mockContext);

      // Verify
      expect(mockContext.json).toHaveBeenCalledWith({
        message: 'Error getting team players',
      });
    });
  });

  describe('getAllFantasyTeams', () => {
    it('should return all fantasy teams', async () => {
      const mockTeams = [{ id: 1, name: 'Test Team' }];
      (FantasyTeamModel.find as any).mockResolvedValue(mockTeams);

      await fantasyTeamController.getAllFantasyTeams(mockContext);

      expect(FantasyTeamModel.find).toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith(Ok(mockTeams));
    });
  });

  describe('getFantasyTeamById', () => {
    it('should return a fantasy team by id', async () => {
      const mockTeam = { id: 1, name: 'Test Team' };
      (FantasyTeamModel.findById as any).mockResolvedValue(mockTeam);
      mockContext.req.params = { id: '1' };

      await fantasyTeamController.getFantasyTeamById(mockContext);

      expect(FantasyTeamModel.findById).toHaveBeenCalledWith('1');
      expect(mockContext.json).toHaveBeenCalledWith(Ok(mockTeam));
    });

    it('should return 404 if team not found', async () => {
      (FantasyTeamModel.findById as any).mockResolvedValue(null);
      mockContext.req.params = { id: '1' };

      await fantasyTeamController.getFantasyTeamById(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        error: 'Fantasy team not found',
      });
    });
  });

  describe('createFantasyTeam', () => {
    it('should create a new fantasy team', async () => {
      const newTeam = { name: 'New Team', owner: 'New Owner' };
      mockContext.req.body = newTeam;
      (FantasyTeamModel.create as any).mockResolvedValue({ id: 1, ...newTeam });

      await fantasyTeamController.createFantasyTeam(mockContext);

      expect(FantasyTeamModel.create).toHaveBeenCalledWith(newTeam);
      expect(mockContext.json).toHaveBeenCalledWith(Ok({ id: 1, ...newTeam }));
    });
  });

  describe('updateFantasyTeam', () => {
    it('should update a fantasy team', async () => {
      const updates = { name: 'Updated Team' };
      mockContext.req.params = { id: '1' };
      mockContext.req.body = updates;
      (FantasyTeamModel.findByIdAndUpdate as any).mockResolvedValue({ id: 1, ...updates });

      await fantasyTeamController.updateFantasyTeam(mockContext);

      expect(FantasyTeamModel.findByIdAndUpdate).toHaveBeenCalledWith('1', updates, { new: true });
      expect(mockContext.json).toHaveBeenCalledWith(Ok({ id: 1, ...updates }));
    });

    it('should return 404 if team not found', async () => {
      (FantasyTeamModel.findByIdAndUpdate as any).mockResolvedValue(null);
      mockContext.req.params = { id: '1' };
      mockContext.req.body = { name: 'Updated Team' };

      await fantasyTeamController.updateFantasyTeam(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        error: 'Fantasy team not found',
      });
    });
  });

  describe('deleteFantasyTeam', () => {
    it('should delete a fantasy team', async () => {
      (FantasyTeamModel.findByIdAndDelete as any).mockResolvedValue({ id: 1 });
      mockContext.req.params = { id: '1' };

      await fantasyTeamController.deleteFantasyTeam(mockContext);

      expect(FantasyTeamModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(mockContext.json).toHaveBeenCalledWith(Ok({ id: 1 }));
    });

    it('should return 404 if team not found', async () => {
      (FantasyTeamModel.findByIdAndDelete as any).mockResolvedValue(null);
      mockContext.req.params = { id: '1' };

      await fantasyTeamController.deleteFantasyTeam(mockContext);

      expect(mockContext.json).toHaveBeenCalledWith({
        error: 'Fantasy team not found',
      });
    });
  });
});
