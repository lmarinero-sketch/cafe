import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
  if (match) env[match[1]] = match[2];
});

const token = env.SUPABASE_ACCESS_TOKEN;
const ref = env.SUPABASE_PROJECT_REF;

console.log('Applying migrations via Supabase API...');
console.log('Project Ref:', ref);
console.log('Token defined:', !!token);

async function runSql(sql) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`API Error (${response.status}): ${text}`);
  }
  return text;
}

async function main() {
  const migrationsDir = path.resolve('supabase/migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    console.log(`\nRunning migration: ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    try {
      const res = await runSql(sql);
      console.log(`✅ ${file} applied successfully!`);
    } catch (err) {
      console.error(`❌ Error running ${file}:`, err.message);
    }
  }
}

main();
