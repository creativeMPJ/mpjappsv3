import "dotenv/config";
import { AppRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "../prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@gmail.com";
  const password = process.env.ADMIN_PASSWORD ?? "bismillah";

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
    },
    create: {
      id: user.id,
      role: AppRole.admin_pusat,
      statusAccount: "active",
    },
  });

  const existingRole = await prisma.userRole.findFirst({ where: { userId: user.id } });
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

  console.log(`Admin ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
