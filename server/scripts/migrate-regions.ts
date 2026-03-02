import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const migration: Record<string, string> = {
        SUR: "14",
        MAL: "01",
        KED: "07",
        MAD: "04",
        JEM: "10",
    };

    for (const [oldCode, newCode] of Object.entries(migration)) {
        const oldRegion = await prisma.region.findFirst({ where: { code: oldCode } });
        const newRegion = await prisma.region.findFirst({ where: { code: newCode } });

        if (!oldRegion || !newRegion) {
            console.log(`  ⏭️  Skip ${oldCode} → ${newCode}`);
            continue;
        }

        // Move ALL referencing tables
        await prisma.profile.updateMany({ where: { regionId: oldRegion.id }, data: { regionId: newRegion.id } });
        await prisma.pesantrenClaim.updateMany({ where: { regionId: oldRegion.id }, data: { regionId: newRegion.id } });
        await prisma.city.updateMany({ where: { regionId: oldRegion.id }, data: { regionId: newRegion.id } });
        await prisma.eventReport.updateMany({ where: { regionId: oldRegion.id }, data: { regionId: newRegion.id } });
        await prisma.followUpLog.updateMany({ where: { regionId: oldRegion.id }, data: { regionId: newRegion.id } });

        console.log(`  ✅ ${oldCode} (${oldRegion.name}) → ${newCode} (${newRegion.name})`);

        await prisma.region.delete({ where: { id: oldRegion.id } });
        console.log(`     🗑️  Deleted ${oldRegion.name}`);
    }

    // Handle "35 - Jawa Timur"
    const jatim = await prisma.region.findFirst({ where: { code: "35" } });
    if (jatim) {
        const newRegion = await prisma.region.findFirst({ where: { code: "14" } });
        if (newRegion) {
            await prisma.profile.updateMany({ where: { regionId: jatim.id }, data: { regionId: newRegion.id } });
            await prisma.pesantrenClaim.updateMany({ where: { regionId: jatim.id }, data: { regionId: newRegion.id } });
            await prisma.city.updateMany({ where: { regionId: jatim.id }, data: { regionId: newRegion.id } });
            await prisma.eventReport.updateMany({ where: { regionId: jatim.id }, data: { regionId: newRegion.id } });
            await prisma.followUpLog.updateMany({ where: { regionId: jatim.id }, data: { regionId: newRegion.id } });
            console.log(`  ✅ 35 (Jawa Timur) → 14 (${newRegion.name})`);
            await prisma.region.delete({ where: { id: jatim.id } });
            console.log(`     🗑️  Deleted Jawa Timur`);
        }
    }

    const total = await prisma.region.count();
    console.log(`\n📊 Final: ${total} regions`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
