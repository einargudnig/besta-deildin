import { z } from 'zod';
import type { playerSchema } from './player';
export * from './player';

// Fantasy Team Schema
export const fantasyTeamSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  budget: z.number(),
  total_points: z.number(),
  created_at: z.date(),
});

export type FantasyTeam = z.infer<typeof fantasyTeamSchema>;

// Team Selection Schema
export const teamSelectionSchema = z.object({
  id: z.number(),
  fantasy_team_id: z.number(),
  gameweek_id: z.number(),
  player_id: z.number(),
  is_captain: z.boolean(),
  is_vice_captain: z.boolean(),
  is_on_bench: z.boolean(),
});

export type TeamSelection = z.infer<typeof teamSelectionSchema>;

export type CreateTeamSelection = Omit<TeamSelection, 'id'>;

// Helper functions for parsing database results
export function parseDatabaseResult<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

export function parseDatabaseResults<T>(schema: z.ZodType<T>, data: unknown[]): T[] {
  return data.map((item) => schema.parse(item));
}

export const teamSchema = z.object({
  id: z.number(),
  api_id: z.number(),
  name: z.string(),
  short_name: z.string().length(3),
  logo_url: z.string().url().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const matchSchema = z.object({
  id: z.number(),
  api_id: z.number(),
  home_team_id: z.number(),
  away_team_id: z.number(),
  home_score: z.number().nullable(),
  away_score: z.number().nullable(),
  status: z.string(),
  date: z.string(),
  round: z.string(),
  season: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Team = z.infer<typeof teamSchema>;
export type Player = z.infer<typeof playerSchema>;
export type Match = z.infer<typeof matchSchema>;
