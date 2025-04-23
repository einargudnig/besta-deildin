import { z } from 'zod';

export const PlayerStatsSchema = z.object({
  id: z.number().optional(),
  playerId: z.number(),
  matchId: z.number(),
  teamId: z.number(),
  minutesPlayed: z.number(),
  position: z.string(),
  goals: z.number(),
  assists: z.number(),
  yellowCards: z.number(),
  redCards: z.number(),
  passes: z.object({
    total: z.number(),
    accuracy: z.string(),
  }),
  shots: z.object({
    total: z.number(),
    onTarget: z.number(),
  }),
  tackles: z.object({
    total: z.number(),
    blocks: z.number(),
    interceptions: z.number(),
  }),
  duels: z.object({
    total: z.number(),
    won: z.number(),
  }),
  dribbles: z.object({
    attempts: z.number(),
    success: z.number(),
  }),
  fouls: z.object({
    drawn: z.number(),
    committed: z.number(),
  }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type PlayerStats = z.infer<typeof PlayerStatsSchema>; 