import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Referensi Kode Regional MPJ — Seluruh Kabupaten/Kota se-Jawa Timur
 *
 * Kode | Regional
 * 01   | MALANG RAYA
 * 02   | BLITAR RAYA
 * 03   | TULUNGAGUNG–TRENGGALEK
 * 04   | MADIUN–MAGETAN–NGAWI–PONOROGO–PACITAN
 * 05   | BANYUWANGI
 * 06   | BOJONEGORO–LAMONGAN–TUBAN
 * 07   | KEDIRI RAYA
 * 08   | JOMBANG
 * 09   | MOJOKERTO
 * 10   | JEMBER–LUMAJANG
 * 11   | NGANJUK
 * 12   | MADURA RAYA
 * 13   | PROBOLINGGO RAYA
 * 14   | SURABAYA–GRESIK
 * 15   | SIDOARJO–PASURUAN
 * 16   | SITUBONDO–BONDOWOSO
 */

interface RegionSeed {
    code: string;
    name: string;
    cities: string[];
}

const REGIONS: RegionSeed[] = [
    {
        code: "01",
        name: "MALANG RAYA",
        cities: ["Kota Malang", "Kabupaten Malang", "Kota Batu"],
    },
    {
        code: "02",
        name: "BLITAR RAYA",
        cities: ["Kota Blitar", "Kabupaten Blitar"],
    },
    {
        code: "03",
        name: "TULUNGGALEK",
        cities: ["Kabupaten Tulungagung", "Kabupaten Trenggalek"],
    },
    {
        code: "04",
        name: "PLAT AE",
        cities: [
            "Kota Madiun",
            "Kabupaten Madiun",
            "Kabupaten Magetan",
            "Kabupaten Ngawi",
            "Kabupaten Ponorogo",
            "Kabupaten Pacitan",
        ],
    },
    {
        code: "05",
        name: "BANYUWANGI",
        cities: ["Kabupaten Banyuwangi"],
    },
    {
        code: "06",
        name: "OJOLAMBAN",
        cities: ["Kabupaten Bojonegoro", "Kabupaten Lamongan", "Kabupaten Tuban"],
    },
    {
        code: "07",
        name: "KEDIRI RAYA",
        cities: ["Kota Kediri", "Kabupaten Kediri"],
    },
    {
        code: "08",
        name: "JOMBANG",
        cities: ["Kabupaten Jombang"],
    },
    {
        code: "09",
        name: "MOJOKERTO",
        cities: ["Kota Mojokerto", "Kabupaten Mojokerto"],
    },
    {
        code: "10",
        name: "DAPUL IV",
        cities: ["Kabupaten Jember", "Kabupaten Lumajang"],
    },
    {
        code: "11",
        name: "NGANJUK",
        cities: ["Kabupaten Nganjuk"],
    },
    {
        code: "12",
        name: "MADURA RAYA",
        cities: [
            "Kabupaten Bangkalan",
            "Kabupaten Sampang",
            "Kabupaten Pamekasan",
            "Kabupaten Sumenep",
        ],
    },
    {
        code: "13",
        name: "PROBOLINGGO RAYA",
        cities: ["Kota Probolinggo", "Kabupaten Probolinggo"],
    },
    {
        code: "14",
        name: "SURABAYA–GRESIK",
        cities: ["Kota Surabaya", "Kabupaten Gresik"],
    },
    {
        code: "15",
        name: "SIDOARJO–PASURUAN",
        cities: ["Kabupaten Sidoarjo", "Kota Pasuruan", "Kabupaten Pasuruan"],
    },
    {
        code: "16",
        name: "SITUBONDO–BONDOWOSO",
        cities: ["Kabupaten Situbondo", "Kabupaten Bondowoso"],
    },
];

async function main() {
    console.log("🗺️  Seeding 16 regional zones with all Kabupaten/Kota Jawa Timur...\n");

    // First, remove OLD data that doesn't match the new structure
    // We keep existing profiles/claims references intact by updating regions

    for (const r of REGIONS) {
        // Upsert region by code
        const region = await prisma.region.upsert({
            where: { code: r.code },
            update: { name: r.name },
            create: { code: r.code, name: r.name },
        });

        console.log(`  ✅ Region ${r.code} - ${r.name} (id: ${region.id})`);

        // Upsert cities for this region
        for (const cityName of r.cities) {
            // Check if city with this name already exists
            const existing = await prisma.city.findFirst({
                where: { name: cityName },
            });

            if (existing) {
                // Update the region assignment if needed
                if (existing.regionId !== region.id) {
                    await prisma.city.update({
                        where: { id: existing.id },
                        data: { regionId: region.id },
                    });
                    console.log(`     🔄 ${cityName} (moved to this region)`);
                } else {
                    console.log(`     ✓  ${cityName} (already exists)`);
                }
            } else {
                await prisma.city.create({
                    data: {
                        name: cityName,
                        regionId: region.id,
                    },
                });
                console.log(`     ➕ ${cityName} (created)`);
            }
        }
    }

    // Clean up old regions that no longer match -- only ones without any profile/claim references
    const oldRegions = await prisma.region.findMany({
        where: {
            code: { notIn: REGIONS.map((r) => r.code) },
        },
        include: {
            _count: {
                select: {
                    profiles: true,
                    claims: true,
                    cities: true,
                },
            },
        },
    });

    for (const old of oldRegions) {
        if (old._count.profiles === 0 && old._count.claims === 0) {
            // Delete orphan cities first
            await prisma.city.deleteMany({ where: { regionId: old.id } });
            await prisma.region.delete({ where: { id: old.id } });
            console.log(`\n  🗑️  Removed unused old region: ${old.code} - ${old.name}`);
        } else {
            console.log(
                `\n  ⚠️  Kept old region: ${old.code} - ${old.name} (has ${old._count.profiles} profiles, ${old._count.claims} claims)`
            );
        }
    }

    // Summary
    const totalRegions = await prisma.region.count();
    const totalCities = await prisma.city.count();
    console.log(`\n📊 Summary: ${totalRegions} regions, ${totalCities} cities\n`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
