// ============================================
// DATABASE CONNECTION TEST SCRIPT
// ============================================
// Run this script to verify database connectivity

const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#') || !trimmedLine) {
        continue;
      }

      const match = trimmedLine.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        process.env[key] = value;
      }
    }
  } catch (error) {
    // File doesn't exist or can't be read
  }
}

loadEnvFile(path.join(__dirname, '..', '.env.local'));
loadEnvFile(path.join(__dirname, '..', '.env'));

async function testConnection() {
  console.log('\n=================================');
  console.log('🔍 Database Connection Test');
  console.log('=================================\n');

  const { Pool } = require('pg');

  const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    min: 1,
    max: 2,
    connectionTimeoutMillis: 10000,
  };

  console.log('Database URL:', process.env.DATABASE_URL ? '✓ Set' : '✗ Not set');
  console.log('Host:', process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'Unknown');
  console.log('');

  const pool = new Pool(poolConfig);

  try {
    console.log('Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');

    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version.split(' ')[1]);

    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\nTables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    client.release();
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
