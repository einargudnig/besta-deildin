import { z } from 'zod';
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
  return data.map(item => schema.parse(item));
} 