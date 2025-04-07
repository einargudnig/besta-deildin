import db from '../config/database';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export const userRepository = {
  async findAll(): Promise<User[]> {
    const result = await db.query('SELECT * FROM users');
    return result.rows;
  },
  
  async findById(id: number): Promise<User | null> {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },
  
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },
  
  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.username, user.email, user.password_hash, user.role]
    );
    return result.rows[0];
  },
  
  async update(id: number, user: Partial<User>): Promise<User | null> {
    // Build dynamic update query
    const keys = Object.keys(user);
    if (keys.length === 0) return this.findById(id);
    
    const sets = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = Object.values(user);
    
    const result = await db.query(
      `UPDATE users SET ${sets}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0] || null;
  },
  
  async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
};
