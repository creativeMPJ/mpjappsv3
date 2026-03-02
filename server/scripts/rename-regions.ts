import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const updates = [
        { code: "04", newName: "PLAT AE" },
        { code: "06", newName: "OJOLAMBAN" },
        { code: "03", newName: "TULUNGGALEK" },
        { code: "12", newName: "MADURA RAYA" },
        { code: "10", newName: "DAPUL IV" },
    ];

    for (const u of updates) {
        const r = await prisma.region.update({ where: { code: u.code }, data: { name: u.newName } });
        console.log(`✅ ${r.code} → ${r.name}`);
    }

    const all = await prisma.region.findMany({ orderBy: { code: "asc" }, select: { code: true, name: true } });
    console.log("\n📋 Daftar Regional:");
    for (const r of all) console.log(`  ${r.code} | ${r.name}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
