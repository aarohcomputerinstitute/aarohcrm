import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("--- START DEBUG ---");
  for (const user of users) {
    console.log(`User: ${user.email}`);
    console.log(`Active: ${user.isActive}`);
    console.log(`Hash in DB: ${user.password}`);
    
    const isMatchAdmin123 = await bcrypt.compare("admin123", user.password);
    const isMatchAdminAt123 = await bcrypt.compare("Admin@123", user.password);
    
    console.log(`Matches "admin123": ${isMatchAdmin123}`);
    console.log(`Matches "Admin@123": ${isMatchAdminAt123}`);
    console.log("---");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
