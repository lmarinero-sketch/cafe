import pkg from 'pg';
import fs from 'fs';
const { Client } = pkg;

const runMigration = async () => {
  const client = new Client({
    connectionString: "postgresql://postgres.dtjmckbrofevgfqbkzli:07052812Mv.@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
  });
  try {
    await client.connect();
    const sql = fs.readFileSync('./supabase/migrations/022_create_audit_logs.sql', 'utf8');
    await client.query(sql);
    console.log('Migration executed successfully via pooler!');
  } catch (error) {
    console.error('Error executing migration:', error);
  } finally {
    await client.end();
  }
};

runMigration();
