import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRaw`SELECT id, nama, is_super_admin FROM roles`;
  console.log(JSON.stringify(rows, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
