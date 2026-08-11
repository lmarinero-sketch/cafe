import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Missing DATABASE_URL");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    const sql = fs.readFileSync('supabase/migrations/create_storage_bucket.sql', 'utf-8');
    await client.query(sql);
    console.log("Migration executed successfully!");
  } catch (error) {
    console.error("Error executing migration:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
