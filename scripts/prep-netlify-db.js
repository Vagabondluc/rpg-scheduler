const fs = require('fs');
const path = require('path');

function log(...args) {
  console.log('[prep-netlify-db]', ...args);
}

// If DATABASE_URL already set, do nothing.
if (process.env.DATABASE_URL) {
  log('DATABASE_URL already present; no changes needed.');
  process.exit(0);
}

// Check Netlify-provided env vars (unpooled has connection string suitable for serverless)
const candidates = [
  process.env.NETLIFY_DATABASE_URL_UNPOOLED,
  process.env.NETLIFY_DATABASE_URL,
  process.env.VERCEL_POSTGRES_URL,
  process.env.DATABASE_URL
];

const dbUrl = candidates.find(Boolean);

if (!dbUrl) {
  log('No Netlify database env var found. Leaving build to proceed without writing .env.');
  process.exit(0);
}

// Write a .env file in project root with DATABASE_URL for build/runtime
const envPath = path.resolve(process.cwd(), '.env');
const content = `DATABASE_URL="${dbUrl.replace(/"/g, '\\"')}"\n`;

try {
  fs.writeFileSync(envPath, content, { encoding: 'utf8' });
  log('.env written with DATABASE_URL from Netlify env var.');
} catch (err) {
  console.error('Failed to write .env:', err);
  process.exit(1);
}

process.exit(0);
