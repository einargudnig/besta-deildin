import fs from 'node:fs';
import path from 'node:path';
import db from '../src/config/database';

async function createTables() {
  try {
    // Read SQL file
    const sql = fs.readFileSync(
      path.join(__dirname, '../migrations/001_initial_schema.sql'),
      'utf8'
    );

    // Execute SQL
    await db.query(sql);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    process.exit(0);
  }
}

createTables();
