import { PrismaClient } from "@prisma/client";

async function test() {
  const url = "postgresql://postgres:Charmy%401986%23@db.xazcowgxkjtlhqgwrqtj.supabase.co:6543/postgres?pgbouncer=true&sslmode=require";
  console.log(`Connecting to: ${url}`);
  
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });

  try {
    const admin = await prisma.user.findUnique({
      where: { email: "aarohcomputerinstitute@gmail.com" }
    });
    console.log("SUCCESS: Admin user found:", !!admin);
  } catch (error) {
    console.error("FAILURE:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
