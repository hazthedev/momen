# ============================================
# ENVIRONMENT SECRETS VALIDATION SCRIPT
# ============================================
# Run this script to verify all required environment variables are set
# Usage: node scripts/validate-env.js

const requiredVars = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'APP_URL',
  'NODE_ENV',
  'REDIS_URL',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL',
];

const recommendedVars = [
  'SENTRY_DSN',
];

function validateEnv() {
  const missing = [];
  const present = [];
  const recommendations = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      present.push(varName);
    }
  }

  for (const varName of recommendedVars) {
    if (!process.env[varName]) {
      recommendations.push(varName);
    }
  }

  // Output results
  console.log('\n=================================');
  console.log('🔍 Environment Validation');
  console.log('=================================\n');

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\n');
  } else {
    console.log('✅ All required environment variables are set!\n');
  }

  if (present.length > 0) {
    console.log('✓ Present variables:');
    present.forEach(v => console.log(`   ✓ ${v}`));
    console.log('\n');
  }

  if (recommendations.length > 0) {
    console.log('⚠️  Recommended variables (optional):');
    recommendations.forEach(v => console.log(`   - ${v}`));
    console.log('\n');
  }

  // Validate secret strength
  const secrets = [
    'SESSION_SECRET',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  console.log('🔐 Secret strength check:');
  for (const secret of secrets) {
    const value = process.env[secret];
    if (!value) {
      console.log(`   ⚠️  ${secret}: not set`);
    } else if (value.length < 32) {
      console.log(`   ❌ ${secret}: too short (${value.length} chars, min 32)`);
    } else {
      console.log(`   ✅ ${secret}: OK (${value.length} chars)`);
    }
  }
  console.log('\n');

  // Exit with error if missing required vars
  if (missing.length > 0) {
    console.error('❌ Validation failed! Please set all required variables.\n');
    process.exit(1);
  } else {
    console.log('✅ All checks passed!\n');
    process.exit(0);
  }
}

validateEnv();
