import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

async function main() {
  const adminEmail = "admin@university.edu";
  const adminPassword = "Admin@123";

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      first_name: "Admin",
      last_name: "User",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Admin account seeded:");
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log(`  Role:     ${admin.role}`);
  console.log(`  ID:       ${admin.id}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
