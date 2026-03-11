import pg from 'pg';
const { Client } = pg;

async function test() {
  // Testing both Direct and Pooled with SSL requirement
  const configs = [
    { name: "Direct (5432) SSL", connectionString: "postgresql://postgres:Charmy%401986%23@db.xazcowgxkjtlhqgwrqtj.supabase.co:5432/postgres?sslmode=require" },
    { name: "Pooled (6543) No SSL", connectionString: "postgresql://postgres:Charmy%401986%23@db.xazcowgxkjtlhqgwrqtj.supabase.co:6543/postgres?pgbouncer=true" },
    { name: "Pooled (6543) SSL", connectionString: "postgresql://postgres:Charmy%401986%23@db.xazcowgxkjtlhqgwrqtj.supabase.co:6543/postgres?pgbouncer=true&sslmode=require" }
  ];

  for (const config of configs) {
    console.log(`\nTesting: ${config.name}`);
    const client = new Client({ connectionString: config.connectionString });
    try {
      await client.connect();
      console.log(`  SUCCESS: Connected to ${config.name}`);
      await client.end();
    } catch (err) {
      console.error(`  FAILED: ${config.name}`);
      console.error(`  Error Code: ${err.code}`);
      console.error(`  Message: ${err.message}`);
    }
  }
}

test();
