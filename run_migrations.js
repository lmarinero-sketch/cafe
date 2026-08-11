import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const dbPassword = process.env.SUPABASE_DB_PASSWORD || '07052812Mv.';
const projectRef = process.env.SUPABASE_PROJECT_REF || 'dtjmckbrofevgfqbkzli';

const regions = ['us-east-1', 'us-west-1', 'sa-east-1', 'eu-central-1', 'ap-southeast-1'];
const ports = [6543, 5432];

const connectionConfigs = [];

for (const region of regions) {
  for (const port of ports) {
    connectionConfigs.push({
      host: `aws-0-${region}.pooler.supabase.com`,
      port,
      user: `postgres.${projectRef}`,
      password: dbPassword,
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    });
  }
}

async function run() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files:`, files);

  let client = null;
  for (const config of connectionConfigs) {
    console.log(`Trying ${config.host}:${config.port}...`);
    try {
      const c = new Client(config);
      await c.connect();
      console.log(`Connected successfully to ${config.host}:${config.port}!`);
      client = c;
      break;
    } catch (err) {
      if (!err.message.includes('tenant/user') && !err.message.includes('ENOTFOUND')) {
        console.error(`Error on ${config.host}:${config.port}: ${err.message}`);
      }
    }
  }

  if (!client) {
    console.error('Could not connect via poolers. Testing direct SQL execution via Supabase API...');
    process.exit(1);
  }

  try {
    for (const file of files) {
      console.log(`Executing migration ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      await client.query(sql);
      console.log(`SUCCESS: ${file}`);
    }
    console.log('All migrations executed successfully!');
  } catch (err) {
    console.error(`Error executing migration: ${err.message}`);
  } finally {
    await client.end();
  }
}

run();
