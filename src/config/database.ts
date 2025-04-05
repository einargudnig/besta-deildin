import { Pool } from "pg";
import { env } from "./env";

// const pool = new Pool({
//   connectionString: env.DATABASE_URL,
// });

const pool = new Pool({
  user: "fantasy_user",
  host: "localhost",
  database: "fantasy_football",
  password: "your_password",
  port: 5432,
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
};
