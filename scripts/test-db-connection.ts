import db from '../src/config/database';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.query('SELECT NOW()');
    console.log('Connection successful! Current time:', result.rows[0].now);

    // Try to list tables
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('Tables in database:');
    if (tables.rows.length === 0) {
      console.log('No tables found. Database is empty.');
    } else {
      tables.rows.forEach((row, i) => {
        console.log(`${i + 1}. ${row.table_name}`);
      });
    }
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    process.exit(0);
  }
}

testConnection();
