import { config } from '../config';
import { type PlayerStatsApiResponse, PlayerStatsSchema } from '../schemas/player-stats';
import type { MatchesApiResponse, PlayersApiResponse, TeamsApiResponse } from '../types/api-football';
import { RateLimiter, withRetry } from '../utils/rate-limiter';

const API_BASE_URL = 'https://v3.football.api-sports.io';
const REQUESTS_PER_MINUTE = 30; // Adjust based on your API plan

// use bun to fetch data, could use axios or fetch
// but lets test out bun for as much as we can!

export class ApiFootballClient {
  private apiKey: string;
  private headers: Headers;
  private rateLimiter: RateLimiter;

  constructor() {
    this.apiKey = config.apiKey;
    this.headers = new Headers({
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-rapidapi-key': this.apiKey,
    });
    this.rateLimiter = new RateLimiter(REQUESTS_PER_MINUTE);
  }

  private async makeRequest<T>(url: string | URL): Promise<T> {
    await this.rateLimiter.waitForNextSlot();

    return withRetry(async () => {
      const response = await fetch(url, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      return response.json() as Promise<T>;
    });
  }

  async getTeams(teamId: number, season: number): Promise<TeamsApiResponse> {
    console.log('Fetching teams for teamId in api-client:', teamId, 'and season:', season);
    try {
      const url = new URL('/teams', API_BASE_URL);
      url.searchParams.append('id', teamId.toString());
      // url.searchParams.append('season', season.toString());

      const data = await this.makeRequest<TeamsApiResponse>(url);
      console.log('Teams fetched successfully in api-client:', data.response.length);
      return data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  async getPlayers(teamId: number, season: number): Promise<PlayersApiResponse> {
    console.log('Fetching players for team:', teamId, 'and season:', season);
    try {
      const url = new URL('/players/squads', API_BASE_URL);
      url.searchParams.append('team', teamId.toString());
      // url.searchParams.append('season', season.toString());

      const data = await this.makeRequest<PlayersApiResponse>(url);
      console.log('Players fetched successfully in api-client:', data.response.length);
      return data;
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  }

  public async getMatches(leagueId: number, season: number): Promise<MatchesApiResponse> {
    const response = await fetch(
      `${API_BASE_URL}/fixtures?league=${leagueId}&season=${season}`,
      {
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch matches: ${response.statusText}`);
    }

    const data = await response.json();
    return data as MatchesApiResponse;
  }

  async getPlayerStatsFromMatch(matchId: number, teamId: number): Promise<PlayerStatsApiResponse> {
    if (matchId <= 0) {
      throw new Error('Invalid matchId');
    }

    if (teamId <= 0) {
      throw new Error('Invalid teamId');
    }

    const url = `${API_BASE_URL}/fixtures/players?fixture=${matchId}&team=${teamId}`;
    const data = await this.makeRequest<unknown>(url);
    return PlayerStatsSchema.parse(data);
  }
}
