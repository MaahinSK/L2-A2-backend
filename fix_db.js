require('./node_modules/dotenv').config();
const { Pool } = require('./node_modules/pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixIssuesTable() {
  const client = await pool.connect();
  try {
    console.log('Dropping existing issues table...');
    await client.query('DROP TABLE IF EXISTS issues');
    
    console.log('Creating issues table with correct reporter_id column...');
    await client.query(`
      CREATE TABLE issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'open',
        priority VARCHAR(50) NOT NULL DEFAULT 'medium',
        type VARCHAR(50) NOT NULL DEFAULT 'bug',
        reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ issues table successfully recreated!');
  } catch (err) {
    console.error('❌ Error recreating table:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixIssuesTable();
