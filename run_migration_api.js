import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const runMigration = async () => {
  const sql = fs.readFileSync('./supabase/migrations/022_create_audit_logs.sql', 'utf8');
  
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF;

  if (!token || !projectRef) {
    console.error("Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF in .env");
    process.exit(1);
  }

  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    console.log('Migration executed successfully via Supabase Management API!');
  } catch (error) {
    console.error('Error executing migration:', error);
  }
};

runMigration();
