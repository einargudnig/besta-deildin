import db from '../config/database';
import type { Player, PlayersApiResponse } from '../types/api-football';
import { ApiFootballClient } from './api-football-client';

export class PlayersService {
  private static instance: PlayersService;
  private players: Player[] = [];
  private apiClient: ApiFootballClient;

  private constructor() {
    this.apiClient = new ApiFootballClient();
  }

  public static getInstance(): PlayersService {
    if (!PlayersService.instance) {
      PlayersService.instance = new PlayersService();
    }
    return PlayersService.instance;
  }

  public async fetchAndStorePlayers(teamId: string | number, season?: number): Promise<void> {
    try {
      if (typeof teamId === 'number' && season !== undefined) {
        const response = await this.apiClient.getPlayers(teamId, season);

        if (response.response && response.response.length > 0) {
          const teamData = response.response[0];
          if (teamData?.players) {
            const players = teamData.players;

            for (const player of players) {
              await db.query(
                `INSERT INTO players (
                  api_id, team_id, name, age, number, position, photo
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (api_id) DO UPDATE SET
                  team_id = EXCLUDED.team_id,
                  name = EXCLUDED.name,
                  age = EXCLUDED.age,
                  number = EXCLUDED.number,
                  position = EXCLUDED.position,
                  photo = EXCLUDED.photo,
                  updated_at = CURRENT_TIMESTAMP`,
                [
                  player.id,
                  teamId,
                  player.name,
                  player.age,
                  player.number,
                  player.position,
                  player.photo,
                ]
              );
            }
          }
        }
      } else {
        const response = await fetch(`/api/players?team=${teamId}`);
        const data = (await response.json()) as PlayersApiResponse;

        if (data.response && data.response.length > 0 && data.response[0]?.players) {
          this.players = data.response[0].players;
        } else {
          this.players = [];
        }
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      this.players = [];
      throw error;
    }
  }

  public getPlayers(): Player[] {
    return this.players;
  }
}
