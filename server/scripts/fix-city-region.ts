import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Move 'Kota Surabaya' city to 'Surabaya' region (where admin_regional is)
    const suraRegion = await prisma.region.findFirst({ where: { code: "SUR" } });
    if (!suraRegion) {
        console.log("Region SUR not found");
        return;
    }

    const city = await prisma.city.findFirst({ where: { name: { contains: "Surabaya" } } });
    if (!city) {
        console.log("City Surabaya not found");
        return;
    }

    console.log(`Moving city "${city.name}" from regionId ${city.regionId} → ${suraRegion.id} (${suraRegion.name})`);

    await prisma.city.update({
        where: { id: city.id },
        data: { regionId: suraRegion.id },
    });

    // Verify
    const verify = await prisma.region.findUnique({
        where: { id: suraRegion.id },
        include: { cities: true },
    });
    console.log(`✅ Region "${verify?.name}" now has cities:`, verify?.cities.map((c) => c.name).join(", "));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
