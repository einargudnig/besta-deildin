import db from '../config/database';
import type { TeamResponse, TeamsApiResponse } from '../types/api-football';
import { ApiFootballClient } from './api-football-client';

export class TeamsService {
  private apiClient: ApiFootballClient;

  constructor() {
    this.apiClient = new ApiFootballClient();
  }

  async fetchAndStoreTeams(teamId: number, season: number): Promise<void> {
    console.log('Fetching teams for teamId:', teamId, 'and season:', season);
    try {
      const response = (await this.apiClient.getTeams(teamId, season)) as TeamsApiResponse;
      console.log('Teams fetched successfully:', response.response.length);

      if (response.response && response.response.length > 0) {
        const teams = response.response.map((teamData: TeamResponse) => ({
          api_id: teamData.team.id,
          name: teamData.team.name,
          code: teamData.team.code,
          country: teamData.team.country,
          founded: teamData.team.founded,
          national: teamData.team.national,
          logo: teamData.team.logo,
          venue_id: teamData.venue.id,
          venue_name: teamData.venue.name,
          venue_address: teamData.venue.address,
          venue_city: teamData.venue.city,
          venue_capacity: teamData.venue.capacity,
          venue_surface: teamData.venue.surface,
          venue_image: teamData.venue.image,
        }));

        // Store teams in database
        for (const team of teams) {
          await db.query(
            `INSERT INTO teams (
              api_id, name, code, country, founded, national, logo,
              venue_id, venue_name, venue_address, venue_city,
              venue_capacity, venue_surface, venue_image
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (api_id) DO UPDATE SET
              name = EXCLUDED.name,
              code = EXCLUDED.code,
              country = EXCLUDED.country,
              founded = EXCLUDED.founded,
              national = EXCLUDED.national,
              logo = EXCLUDED.logo,
              venue_id = EXCLUDED.venue_id,
              venue_name = EXCLUDED.venue_name,
              venue_address = EXCLUDED.venue_address,
              venue_city = EXCLUDED.venue_city,
              venue_capacity = EXCLUDED.venue_capacity,
              venue_surface = EXCLUDED.venue_surface,
              venue_image = EXCLUDED.venue_image`,
            [
              team.api_id,
              team.name,
              team.code,
              team.country,
              team.founded,
              team.national,
              team.logo,
              team.venue_id,
              team.venue_name,
              team.venue_address,
              team.venue_city,
              team.venue_capacity,
              team.venue_surface,
              team.venue_image,
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error in fetchAndStoreTeams:', error);
      throw error;
    }
  }
}
