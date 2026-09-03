import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;

if (!token || !projectRef) {
  console.error('Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF in .env');
  process.exit(1);
}

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`Executing ${files.length} migrations using Supabase Management API for project ${projectRef}...`);

function makeIdempotent(sql) {
  // Make CREATE TYPE idempotent without string replacement dollar bug
  let result = sql.replace(
    /CREATE TYPE (\w+) AS ENUM \(([^)]+)\);/g,
    `DO $typeblock$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '$1') THEN CREATE TYPE $1 AS ENUM ($2); END IF; END $typeblock$;`
  );

  // Make CREATE POLICY idempotent for storage.objects
  result = result.replace(
    /CREATE POLICY "([^"]+)"\s+ON storage\.objects/g,
    `DROP POLICY IF EXISTS "$1" ON storage.objects;\nCREATE POLICY "$1" ON storage.objects`
  );

  // Make CREATE POLICY idempotent for normal tables
  result = result.replace(
    /CREATE POLICY "([^"]+)"\s+ON ((?:public\.)?\w+)/g,
    `DROP POLICY IF EXISTS "$1" ON $2;\nCREATE POLICY "$1" ON $2`
  );

  // Make CREATE TRIGGER idempotent
  result = result.replace(
    /CREATE TRIGGER (\w+)\s+([A-Z\s]+)\s+ON (\w+)/g,
    `DROP TRIGGER IF EXISTS $1 ON $3;\nCREATE TRIGGER $1 $2 ON $3`
  );

  // Make INSERT INTO site_content idempotent
  result = result.replace(
    /INSERT INTO site_content \(([^)]+)\) VALUES/g,
    `INSERT INTO site_content ($1) VALUES`
  );
  if (result.includes('INSERT INTO site_content') && !result.includes('ON CONFLICT')) {
    result = result.replace(
      /;\s*$/g,
      ` ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();`
    );
  }

  return result;
}

async function runSQL(sql, filename) {
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API returned ${res.status} ${res.statusText}: ${errorText}`);
  }

  const data = await res.json();
  console.log(`✅ Migration ${filename} executed successfully!`);
  return data;
}

async function main() {
  let successCount = 0;
  for (const file of files) {
    console.log(`Running migration: ${file}...`);
    const rawSql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const idempotentSql = makeIdempotent(rawSql);
    try {
      await runSQL(idempotentSql, file);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed on ${file}: ${err.message}`);
    }
  }
  console.log(`\n🎉 Completed ${successCount}/${files.length} migrations successfully!`);
}

main();
