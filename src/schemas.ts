import { z } from 'zod';

// Base schemas for each table
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  role: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const teamSchema = z.object({
  id: z.number(),
  name: z.string(),
  short_name: z.string().length(3),
  logo_url: z.string().url().optional(),
});

export const playerSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  team_id: z.number(),
  position: z.enum(['GK', 'DEF', 'MID', 'FWD']),
  price: z.string().transform(val => Number(val)),
  total_points: z.number(),
});

export const gameweekSchema = z.object({
  id: z.number(),
  name: z.string(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  deadline_date: z.string().datetime(),
  is_current: z.boolean(),
  is_finished: z.boolean(),
});

export const matchSchema = z.object({
  id: z.number(),
  gameweek_id: z.number(),
  home_team_id: z.number(),
  away_team_id: z.number(),
  kickoff_time: z.string().datetime(),
  home_score: z.number().nullable(),
  away_score: z.number().nullable(),
  is_finished: z.boolean(),
});

export const playerPerformanceSchema = z.object({
  id: z.number(),
  player_id: z.number(),
  match_id: z.number(),
  gameweek_id: z.number(),
  minutes_played: z.number(),
  goals: z.number(),
  assists: z.number(),
  clean_sheet: z.boolean(),
  yellow_cards: z.number(),
  red_cards: z.number(),
  saves: z.number(),
  bonus_points: z.number(),
  total_points: z.number(),
});

export const fantasyTeamSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  budget: z.number(),
  total_points: z.number(),
  created_at: z.date(),
});

export const teamSelectionSchema = z.object({
  id: z.number(),
  fantasy_team_id: z.number(),
  gameweek_id: z.number(),
  player_id: z.number(),
  is_captain: z.boolean(),
  is_vice_captain: z.boolean(),
  is_on_bench: z.boolean(),
});

export const leagueSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_by: z.number(),
  join_code: z.string().length(10).optional(),
  is_public: z.boolean(),
  created_at: z.date(),
});

export const leagueMembershipSchema = z.object({
  id: z.number(),
  league_id: z.number(),
  fantasy_team_id: z.number(),
  joined_at: z.date(),
});

// Export inferred types
export type User = z.infer<typeof userSchema>;
export type Team = z.infer<typeof teamSchema>;
export type Player = z.infer<typeof playerSchema>;
export type Gameweek = z.infer<typeof gameweekSchema>;
export type Match = z.infer<typeof matchSchema>;
export type PlayerPerformance = z.infer<typeof playerPerformanceSchema>;
export type FantasyTeam = z.infer<typeof fantasyTeamSchema>;
export type TeamSelection = z.infer<typeof teamSelectionSchema>;
export type CreateTeamSelection = Omit<TeamSelection, 'id'>;
export type League = z.infer<typeof leagueSchema>;
export type LeagueMembership = z.infer<typeof leagueMembershipSchema>;

// Helper function to parse database results
export function parseDatabaseResult<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    // First parse the raw data
    const parsed = schema.parse(data);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
    }
    throw error;
  }
}

// Helper function to parse array of database results
export function parseDatabaseResults<T>(schema: z.ZodType<T>, data: unknown[]): T[] {
  return data.map(item => parseDatabaseResult(schema, item));
} 