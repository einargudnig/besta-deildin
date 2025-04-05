import db from "./db";

export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  team_id: number;
  position: string;
  price: number;
  total_points: number;
}

export const playerRepository = {
  async findAll(): Promise<Player[]> {
    const result = await db.query("SELECT * FROM players");
    return result.rows;
  },

  async findById(id: number): Promise<Player | null> {
    const result = await db.query("SELECT * FROM players WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async create(player: Omit<Player, "id">): Promise<Player> {
    const result = await db.query(
      "INSERT INTO players (first_name, last_name, team_id, position, price, total_points) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        player.first_name,
        player.last_name,
        player.team_id,
        player.position,
        player.price,
        player.total_points,
      ],
    );
    return result.rows[0];
  },

  async update(id: number, player: Partial<Player>): Promise<Player | null> {
    // Build dynamic update query
    const keys = Object.keys(player);
    if (keys.length === 0) return this.findById(id);

    const sets = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    const values = Object.values(player);

    const result = await db.query(
      `UPDATE players SET ${sets}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id],
    );
    return result.rows[0] || null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await db.query("DELETE FROM players WHERE id = $1", [id]);
    return result.rowCount > 0;
  },

  async getPlayersByTeam(teamId: number): Promise<Player[]> {
    const result = await db.query("SELECT * FROM players WHERE team_id = $1", [
      teamId,
    ]);
    return result.rows;
  },

  async getTopScorers(limit: number = 10): Promise<Player[]> {
    const result = await db.query(
      "SELECT * FROM players ORDER BY total_points DESC LIMIT $1",
      [limit],
    );
    return result.rows;
  },
};
