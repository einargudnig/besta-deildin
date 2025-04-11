import { err, ok, Result } from "neverthrow";
import defaultDb from "../config/database";
import { DatabaseError, NotFoundError } from "../errors/index";

export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  team_id: number;
  position: string;
  price: number;
  total_points: number;
}

export interface Database {
  query: (text: string, params?: any[]) => Promise<any>;
}

export const createPlayerRepository = (db: Database = defaultDb) => ({
  async findAll(): Promise<Result<Player[], DatabaseError>> {
    try {
      const result = await db.query("SELECT * FROM players");
      return ok(result.rows);
    } catch (error) {
      console.error("Failed to find all players", error);
      return err(new DatabaseError("Failed to find all players", { cause: error }));
    }
  },

  async findById(id: number): Promise<Result<Player, DatabaseError | NotFoundError>> {
    try {
      const result = await db.query("SELECT * FROM players WHERE id = $1", [id]);

      if (result.rows.length === 0) {
        return err(new NotFoundError(`Player with id ${id} not found`));
      }

      return ok(result.rows[0]);
    } catch (error) { 
      console.error("Failed to find player by id", error);
      return err(new DatabaseError("Failed to find player by id", { cause: error }));
    }
  },

  async create(player: Omit<Player, "id">): Promise<Result<Player, DatabaseError>> {
    try {
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
      return ok(result.rows[0]);
    } catch (error) {
      console.error("Failed to create player", error);
      return err(new DatabaseError("Failed to create player", { cause: error }));
    }
  },

  async update(id: number, player: Partial<Player>): Promise<Result<Player, DatabaseError | NotFoundError>> {
    try {
      // Build dynamic update query
      const keys = Object.keys(player);
      if (keys.length === 0) return this.findById(id);

    const sets = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    const values = Object.values(player);

    const result = await db.query(
      `UPDATE players SET ${sets}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id],
    );
      return ok(result.rows[0]);
    } catch (error) {
      console.error("Failed to update player", error);
      return err(new DatabaseError("Failed to update player", { cause: error }));
    }
  },

  async delete(id: number): Promise<Result<boolean, DatabaseError>> {
    try {
      const result = await db.query("DELETE FROM players WHERE id = $1", [id]);
      return ok(result.rowCount !== null && result.rowCount > 0);
    } catch (error) {
      console.error("Failed to delete player", error);
      return err(new DatabaseError("Failed to delete player", { cause: error }));
    }
  },

  async getPlayersByTeam(teamId: number): Promise<Result<Player[], DatabaseError>> {
    try {
      const result = await db.query("SELECT * FROM players WHERE team_id = $1", [
        teamId,
      ]);
      return ok(result.rows);
    } catch (error) {
      console.error("Failed to get players by team", error);
      return err(new DatabaseError("Failed to get players by team", { cause: error }));
    }
  },

  async getTopScorers(limit: number = 10): Promise<Result<Player[], DatabaseError>> {
    try {
      const result = await db.query(
        "SELECT * FROM players ORDER BY total_points DESC LIMIT $1",
        [limit],
      );
      return ok(result.rows);
    } catch (error) {
      console.error("Failed to get top scorers", error);
      return err(new DatabaseError("Failed to get top scorers", { cause: error }));
    }
  },
});

export const playerRepository = createPlayerRepository();
