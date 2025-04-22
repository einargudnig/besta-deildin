import { z } from 'zod';

export const playerSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  team_id: z.number(),
  position: z.enum(['GK', 'DEF', 'MID', 'FWD']),
  price: z.number(),
  total_points: z.number(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type Player = z.infer<typeof playerSchema>; 