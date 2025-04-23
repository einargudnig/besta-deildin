import db from '../config/database';
import type { Match } from '../types/api-football';
import { ApiFootballClient } from './api-football-client';

export class MatchesService {
  private static instance: MatchesService;
  private apiClient: ApiFootballClient;

  private constructor() {
    this.apiClient = new ApiFootballClient();
  }

  public static getInstance(): MatchesService {
    if (!MatchesService.instance) {
      MatchesService.instance = new MatchesService();
    }
    return MatchesService.instance;
  }

  public async fetchAndStoreMatches(leagueId: number, season: number): Promise<void> {
    try {
      const response = await this.apiClient.getMatches(leagueId, season);

      if (response.response && response.response.length > 0) {
        for (const match of response.response) {
          await db.query(
            `INSERT INTO matches (
              api_id, home_team_id, away_team_id, home_score, away_score,
              status, date, round, season
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (api_id) DO UPDATE SET
              home_score = EXCLUDED.home_score,
              away_score = EXCLUDED.away_score,
              status = EXCLUDED.status,
              date = EXCLUDED.date,
              round = EXCLUDED.round,
              updated_at = CURRENT_TIMESTAMP`,
            [
              match.fixture.id,
              match.teams.home.id,
              match.teams.away.id,
              match.goals.home,
              match.goals.away,
              match.fixture.status.short,
              match.fixture.date,
              match.league.round,
              season
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error fetching and storing matches:', error);
      throw error;
    }
  }

  public async getMatchesByTeam(teamId: number, season: number): Promise<Match[]> {
    try {
      const result = await db.query(
        `SELECT * FROM matches 
          WHERE (home_team_id = $1 OR away_team_id = $1) 
          AND season = $2
          ORDER BY date ASC`,
        [teamId, season]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting matches by team:', error);
      throw error;
    }
  }

  public async getMatchById(matchId: number): Promise<Match | null> {
    try {
      const result = await db.query(
        'SELECT * FROM matches WHERE api_id = $1',
        [matchId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting match by id:', error);
      throw error;
    }
  }
} 