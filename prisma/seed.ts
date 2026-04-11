import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // SECURITY: Read admin password from env var — never hardcode
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "ChangeMe@2026#Secure";
  const adminEmail = "aarohcomputerinstitute@gmail.com";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12); // 12 rounds for stronger hash

  console.log("Seeding database...");

  if (process.env.ADMIN_INITIAL_PASSWORD) {
    console.log("Using ADMIN_INITIAL_PASSWORD from environment variable.");
  } else {
    console.warn(
      "⚠️  WARNING: ADMIN_INITIAL_PASSWORD not set. Using default password. Change it immediately after first login!"
    );
  }

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

  console.log({ admin: { id: admin.id, email: admin.email, role: admin.role } });
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
