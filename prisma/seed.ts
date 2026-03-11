import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@aaroh.com";
  const hashedAdminPassword = await bcrypt.hash("Admin@123", 10);

  console.log("Seeding database...");

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedAdminPassword,
    },
    create: {
      email: adminEmail,
      name: "Admin User",
      password: hashedAdminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log({ admin });
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
