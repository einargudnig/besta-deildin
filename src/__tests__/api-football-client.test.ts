import { beforeEach, describe, expect, test } from 'bun:test';
import type { PlayerStatsApiResponse } from '../schemas/player-stats';
import { ApiFootballClient } from '../services/api-football-client';

// Mock the config
const mockConfig = {
  apiKey: 'test-api-key',
};

// Create a mock fetch that includes all required properties
const createMockFetch = (responseOrResponses: Response | Response[]): typeof fetch => {
  if (Array.isArray(responseOrResponses)) {
    let currentIndex = 0;
    return Object.assign(
      () => {
        const response = responseOrResponses[currentIndex];
        if (!response) {
          throw new Error('No more mock responses available');
        }
        currentIndex++;
        return Promise.resolve(response);
      },
      { preconnect: () => Promise.resolve() }
    ) as typeof fetch;
  }
  return Object.assign(
    () => Promise.resolve(responseOrResponses),
    { preconnect: () => Promise.resolve() }
  ) as typeof fetch;
};

describe('ApiFootballClient', () => {
  let client: ApiFootballClient;

  beforeEach(() => {
    // @ts-ignore - Override config for testing
    global.config = mockConfig;
    client = new ApiFootballClient();
  });

  describe('getPlayerStatsFromMatch', () => {
    test('should throw error when matchId is invalid', async () => {
      await expect(client.getPlayerStatsFromMatch(-1, 1)).rejects.toThrow('Invalid matchId');
    }, 10000);

    test('should throw error when teamId is invalid', async () => {
      await expect(client.getPlayerStatsFromMatch(1, -1)).rejects.toThrow('Invalid teamId');
    }, 10000);

    test('should make correct API request and parse response', async () => {
      const matchId = 123;
      const teamId = 456;

      const mockResponse: PlayerStatsApiResponse = {
        response: [
          {
            team: {
              id: teamId,
              name: 'Test Team',
            },
            players: [
              {
                player: {
                  id: 789,
                  name: 'Test Player',
                },
                statistics: [
                  {
                    games: {
                      minutes: 90,
                      position: 'F',
                    },
                    goals: {
                      total: 1,
                      assists: 0,
                    },
                    cards: {
                      yellow: 0,
                      red: 0,
                    },
                    passes: {
                      total: 50,
                      accuracy: '80%',
                    },
                    shots: {
                      total: 3,
                      on: 2,
                    },
                    tackles: {
                      total: 2,
                      blocks: 1,
                      interceptions: 1,
                    },
                    duels: {
                      total: 10,
                      won: 6,
                    },
                    dribbles: {
                      attempts: 5,
                      success: 3,
                    },
                    fouls: {
                      drawn: 2,
                      committed: 1,
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      // Mock fetch to return our response
      global.fetch = createMockFetch(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await client.getPlayerStatsFromMatch(matchId, teamId);

      expect(result.response[0]?.team.id).toBe(teamId);
      expect(result.response[0]?.players[0]?.player.id).toBe(789);
    }, 10000);

    test('should handle API error response', async () => {
      global.fetch = createMockFetch(
        new Response('Not Found', {
          status: 404,
          statusText: 'Not Found',
        })
      );

      await expect(client.getPlayerStatsFromMatch(1, 1)).rejects.toThrow('HTTP error! status: 404');
    }, 10000);

    test('should retry on temporary failures', async () => {
      const attempts = 0;
      global.fetch = createMockFetch([
        new Response('Service Unavailable', {
          status: 503,
          statusText: 'Service Unavailable',
        }),
        new Response(
          JSON.stringify({
            response: [
              {
                team: { id: 1, name: 'Test' },
                players: [],
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        ),
      ]);

      const result = await client.getPlayerStatsFromMatch(1, 1);
      expect(result.response).toHaveLength(1);
    }, 10000);
  });
});
