
export interface TeamSelection {
  id: number;
  fantasy_team_id: number;
  gameweek_id: number;
  player_id: number;
  is_captain: boolean;
  is_vice_captain: boolean;
  is_on_bench: boolean;
}

export const teamSelectionRepository = {
  async getTeamSelection() {},

  async getTeamSelectionForWeek() { },

  async selectPlayer() { },

  async makeCaptain() { },

  async makeViceCaptain() { },

  async moveToBench() { },

  async moveToStarting() { },
}