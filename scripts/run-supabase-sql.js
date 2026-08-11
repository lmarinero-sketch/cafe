import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;

async function runSql(query) {
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`SQL Execution failed (${res.status}): ${text}`);
  }
  return text;
}

async function main() {
  try {
    console.log("Executing 009_create_staff_users.sql via Supabase Management API...");
    const filePath = path.join(process.cwd(), 'supabase', 'migrations', '009_create_staff_users.sql');
    const sql = fs.readFileSync(filePath, 'utf-8');
    const result = await runSql(sql);
    console.log("Result:", result);
    console.log("✓ 009_create_staff_users.sql applied successfully!");
  } catch (err) {
    console.error("Error running SQL:", err);
  }
}

main();
