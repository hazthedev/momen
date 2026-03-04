const path = require('path');
const fs = require('fs');

// Load environment variables
function loadEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#') || !trimmedLine) continue;

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
    // File doesn't exist
  }
}

loadEnvFile(path.join(__dirname, '..', '.env.local'));
loadEnvFile(path.join(__dirname, '..', '.env'));

async function checkUser() {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,
  });

  try {
    console.log('\n=================================');
    console.log('🔍 Checking User: organizer@gmail.com');
    console.log('=================================\n');

    const result = await pool.query(
      "SELECT id, email, name, role, tenant_id, password_hash IS NOT NULL as has_password FROM users WHERE email = $1",
      ['organizer@gmail.com']
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ User found:');
      console.log('  ID:', user.id);
      console.log('  Email:', user.email);
      console.log('  Name:', user.name);
      console.log('  Role:', user.role);
      console.log('  Tenant ID:', user.tenant_id);
      console.log('  Has Password:', user.has_password ? 'Yes' : 'No');
    } else {
      console.log('❌ User NOT found');
      console.log('\nAll users in database:');
      const allUsers = await pool.query('SELECT email, name, role FROM users ORDER BY email');
      console.log(`  Total: ${allUsers.rows.length} users`);
      allUsers.rows.forEach(u => {
        console.log(`  - ${u.email} (${u.name}) - ${u.role}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUser();
