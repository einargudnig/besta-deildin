
export interface FantasyTeam { 
  id: number;
  user_id: string;
  name: string;
  budget: number;
  total_points: number;
  created_at: number;
}

export const fantasyTeamRepository = {
  // Might come handy for leaderboards
  async getAllFantasyTeams() { },

  async getUserTeams() { },

  async createFantasyTeam() { },
  
  async updateFantasyTeamName() { },

  // TODO: might have separate increase and decrease functions?
  async updateFantasyTeamBudget() { },
  
  async updateFantasyTeamPoints() { },

}