import db from '../config/database';

export interface Team {
  id: number;
  name: string;
  short_name: string;
  logo_url: string;
}

export const teamRepository = {
  async findAll(): Promise<Team[]> {
    const result = await db.query('SELECT * FROM teams ORDER BY name');
    return result.rows;
  },

  async findById(id: number): Promise<Team | null> {
    const result = await db.query('SELECT * FROM teams WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByName(name: string): Promise<Team | null> {
    const result = await db.query('SELECT * FROM teams WHERE name ILIKE $1', [name]);
    return result.rows[0] || null;
  },
};
