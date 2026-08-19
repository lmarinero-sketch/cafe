import pg from 'pg';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
  if (match) env[match[1]] = match[2];
});

const connectionString = env.DATABASE_URL;

console.log('Connecting to PostgreSQL database via Direct DB URL...');
console.log('URL:', connectionString.replace(/:[^:@]+@/, ':****@'));

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Postgres database!');
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log('Tables found in DB:', res.rows.map(r => r.table_name));
    client.release();
  } catch (err) {
    console.error('❌ Connection error:', err);
  } finally {
    await pool.end();
  }
}

run();
