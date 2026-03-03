// ============================================
// APPLICATION STARTUP VALIDATION SCRIPT
// ============================================
// Run this script to verify all required dependencies and configurations

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

console.log('\n=================================');
console.log('🚀 Application Startup Validation');
console.log('=================================\n');

// 1. Check environment files
console.log('📁 Environment Files:');
const envFiles = ['.env', '.env.local', '.env.example'];
envFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// 2. Check critical environment variables
console.log('\n🔐 Environment Variables:');
const criticalVars = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'REDIS_URL',
  'R2_ACCOUNT_ID',
];

let allVarsPresent = true;
criticalVars.forEach(varName => {
  const present = !!process.env[varName];
  if (!present) allVarsPresent = false;
  console.log(`  ${present ? '✅' : '❌'} ${varName}`);
});

// 3. Check critical directories
console.log('\n📂 Directory Structure:');
const dirs = [
  'app',
  'lib',
  'lib/db',
  'lib/auth',
  'lib/services',
  'lib/validation',
  'lib/storage',
  'public',
  'drizzle/migrations',
];

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  const exists = fs.existsSync(dirPath);
  console.log(`  ${exists ? '✅' : '❌'} ${dir}/`);
});

// 4. Check critical files
console.log('\n📄 Critical Files:');
const files = [
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  'lib/db/schema.ts',
  'lib/db/index.ts',
  'drizzle.config.ts',
  'drizzle/migrations/0001_momen_schema.sql',
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// 5. Try to load critical modules
console.log('\n📦 Module Loading:');
try {
  require('pg');
  console.log('  ✅ pg (PostgreSQL driver)');
} catch (e) {
  console.log('  ❌ pg (PostgreSQL driver) - NOT INSTALLED');
}

try {
  require('drizzle-orm');
  console.log('  ✅ drizzle-orm');
} catch (e) {
  console.log('  ❌ drizzle-orm - NOT INSTALLED');
}

try {
  require('next');
  console.log('  ✅ next');
} catch (e) {
  console.log('  ❌ next - NOT INSTALLED');
}

try {
  require('react');
  console.log('  ✅ react');
} catch (e) {
  console.log('  ❌ react - NOT INSTALLED');
}

// 6. Database connection test
console.log('\n🗄️  Database Connection:');
const { Pool } = require('pg');

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  min: 1,
  max: 2,
  connectionTimeoutMillis: 10000,
};

const pool = new Pool(poolConfig);

(async () => {
  try {
    const client = await pool.connect();
    console.log('  ✅ Connected to database');

    // Check if tables exist
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

    const expectedTables = ['tenants', 'users', 'events', 'photos', 'attendances'];
    expectedTables.forEach(table => {
      const exists = result.rows.some(row => row.table_name === table);
      console.log(`  ${exists ? '✅' : '❌'} Table: ${table}`);
    });

    client.release();
  } catch (error) {
    console.log(`  ❌ Database connection failed: ${error.message}`);
  } finally {
    await pool.end();
  }

  // Final summary
  console.log('\n=================================');
  if (allVarsPresent) {
    console.log('✅ All critical environment variables are set');
  } else {
    console.log('❌ Some critical environment variables are missing');
    console.log('   Run: npm run validate-env');
  }
  console.log('=================================\n');

  process.exit(allVarsPresent ? 0 : 1);
})();
