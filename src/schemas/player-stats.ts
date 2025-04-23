import { z } from 'zod';

export const PlayerStatsSchema = z.object({
  response: z.array(
    z.object({
      team: z.object({
        id: z.number(),
        name: z.string(),
      }),
      players: z.array(
        z.object({
          player: z.object({
            id: z.number(),
            name: z.string(),
          }),
          statistics: z.array(
            z.object({
              games: z.object({
                minutes: z.number(),
                position: z.string(),
              }),
              goals: z.object({
                total: z.number().nullable(),
                assists: z.number().nullable(),
              }),
              cards: z.object({
                yellow: z.number(),
                red: z.number(),
              }),
              passes: z.object({
                total: z.number(),
                accuracy: z.string(),
              }),
              shots: z.object({
                total: z.number(),
                on: z.number(),
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
            })
          ),
        })
      ),
    })
  ),
});

export type PlayerStatsApiResponse = z.infer<typeof PlayerStatsSchema>; 