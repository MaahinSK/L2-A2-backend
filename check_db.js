require('./node_modules/dotenv').config();
const { Pool } = require('./node_modules/pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkAndCreateTables() {
  const client = await pool.connect();
  try {
    // Check which tables exist
    const check = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('users', 'issues')
    `);
    
    const existing = check.rows.map(r => r.table_name);
    console.log('Existing tables:', existing.length ? existing.join(', ') : 'none found');

    // Create users table if missing
    if (!existing.includes('users')) {
      console.log('Creating users table...');
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'contributor',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('users table created');
    } else {
      console.log('users table already exists');
    }

    // Create issues table if missing
    if (!existing.includes('issues')) {
      console.log('Creating issues table...');
      await client.query(`
        CREATE TABLE issues (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          status VARCHAR(50) NOT NULL DEFAULT 'open',
          priority VARCHAR(50) NOT NULL DEFAULT 'medium',
          type VARCHAR(50) NOT NULL DEFAULT 'bug',
          creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('issues table created');
    } else {
      console.log('issues table already exists');
    }

    console.log('\nDatabase ready!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndCreateTables();
