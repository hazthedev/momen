const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

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

async function createUser() {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create tenant first
    const tenantId = uuidv4();
    const subdomain = `organizer-${uuidv4().slice(0, 6)}`;

    await client.query(
      `INSERT INTO tenants (id, subdomain, brand_name, company_name, contact_email, subscription_tier, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [tenantId, subdomain, "Organizer's Events", 'Organizer', 'organizer@gmail.com', 'free', 'trial']
    );

    // Hash password
    const passwordHash = await bcrypt.hash('organizer123@', 10);

    // Create user
    const userId = uuidv4();
    await client.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, name, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [userId, tenantId, 'organizer@gmail.com', passwordHash, 'Organizer', 'organizer']
    );

    await client.query('COMMIT');

    console.log('\n=================================');
    console.log('✅ User Created Successfully');
    console.log('=================================\n');
    console.log('Email: organizer@gmail.com');
    console.log('Password: organizer123@');
    console.log('Role: organizer');
    console.log('Tenant ID:', tenantId);
    console.log('User ID:', userId);
    console.log('\nYou can now log in with these credentials.\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating user:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

createUser();
