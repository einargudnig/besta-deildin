export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  team_id: number;
  position: string;
  price: number;
  total_points: number;
}

export type CreatePlayerDTO = Omit<Player, 'id' | 'total_points'> & {
  total_points?: number;
};
export type UpdatePlayerDTO = Partial<CreatePlayerDTO>;
