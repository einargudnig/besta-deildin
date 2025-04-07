// import { Pool } from "pg";

// // const pool = new Pool({
// //   connectionString: env.DATABASE_URL,
// // });

// const pool = new Pool({
//   user: process.env.DATABASE_USER,
//   host: process.env.DATABASE_HOST,
//   database: process.env.DATABASE_NAME,
//   password: process.env.DATABASE_PASSWORD,
//   port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : undefined,
// });

// export default {
//   query: (text: string, params?: any[]) => pool.query(text, params),
//   getClient: () => pool.connect(),
// };

import { Pool } from 'pg';
import { env } from './env';

// Parse connection string or use individual parameters
function createPool() {
  // If using a connection string
  if (env.DATABASE_URL) {
    try {
      const url = new URL(env.DATABASE_URL);
      
      return new Pool({
        user: url.username,
        password: url.password,
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.split('/')[1], // Extract database name from path
        ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
    } catch (error) {
      console.error('Error parsing DATABASE_URL:', error);
      
      // Fallback to direct parameters if URL parsing fails
      const [userInfo = '', hostInfo = ''] = env.DATABASE_URL.split('@');
      const [user = '', password = ''] = userInfo.replace('postgres://', '').split(':');
      const [hostPort = '', database = ''] = hostInfo.split('/');
      const [host = 'localhost', port = '5432'] = hostPort.split(':');
      
      return new Pool({
        user,
        password,
        host,
        port: parseInt(port) || 5432,
        database,
        ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
    }
  }
  
  // Default fallback
  return new Pool({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : undefined,
    database: process.env.DATABASE_NAME
  });
}

const pool = createPool();

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
};
