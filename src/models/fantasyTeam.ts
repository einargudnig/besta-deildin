import mongoose from 'mongoose';

export interface FantasyTeam {
  id: number;
  user_id: number;
  name: string;
  budget: number;
  total_points: number;
  created_at: Date;
}

const fantasyTeamSchema = new mongoose.Schema<FantasyTeam>({
  id: { type: Number, required: true },
  user_id: { type: Number, required: true },
  name: { type: String, required: true },
  budget: { type: Number, required: true },
  total_points: { type: Number, required: true },
  created_at: { type: Date, required: true },
});

export const FantasyTeam = mongoose.model<FantasyTeam>('FantasyTeam', fantasyTeamSchema); 