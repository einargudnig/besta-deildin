import { config } from '../config';
import type { TeamsApiResponse } from '../types/api-football';

const API_BASE_URL = 'https://v3.football.api-sports.io';

// use bun to fetch data, could use axios or fetch
// but lets test out bun for as much as we can!


export class ApiFootballClient {
  private apiKey: string;
  private headers: Headers;

  constructor() {
    this.apiKey = config.apiKey;
    this.headers = new Headers({
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-rapidapi-key': this.apiKey,
    });
  }

  async getTeams(teamId: number, season: number): Promise<TeamsApiResponse> {
    console.log('Fetching teams for teamId in api-client:', teamId, 'and season:', season);
    try {
      const url = new URL('/teams', API_BASE_URL);
      url.searchParams.append('id', teamId.toString());
      // url.searchParams.append('season', season.toString());

      const response = await fetch(url, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as TeamsApiResponse;
      console.log('Teams fetched successfully in api-client:', data.response.length);
      return data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }
}
