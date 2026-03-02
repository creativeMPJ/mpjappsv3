import "dotenv/config";
import { AppRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "../prisma";

async function main() {
  const email = "superadmin@mpj.id";
  const password = "bismillah";

  console.log(`Creating Super Admin...`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  const passwordHash = await hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  await prisma.profile.upsert({
    where: { id: user.id },
    update: {
      role: AppRole.admin_pusat,
      statusAccount: "active",
      profileLevel: "platinum", // Highest level for super admin context
    },
    create: {
      id: user.id,
      role: AppRole.admin_pusat,
      statusAccount: "active",
      profileLevel: "platinum",
    },
  });

  // Ensure role exists in UserRole table as well
  const existingRole = await prisma.userRole.findFirst({
    where: { userId: user.id },
  });

  if (existingRole) {
    await prisma.userRole.update({
      where: { id: existingRole.id },
      data: { role: AppRole.admin_pusat },
    });
  } else {
    await prisma.userRole.create({
      data: { userId: user.id, role: AppRole.admin_pusat },
    });
  }

  console.log(`Super Admin created successfully!`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
