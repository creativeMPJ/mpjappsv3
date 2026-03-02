import "dotenv/config";
import { AppRole, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Regional Data & Events...");

    // 1. Create Regional Admins
    const regions = [
        { name: "Surabaya", email: "surabaya@mpj.id" },
        { name: "Malang", email: "malang@mpj.id" },
        { name: "Kediri", email: "kediri@mpj.id" },
        { name: "Madiun", email: "madiun@mpj.id" },
        { name: "Jember", email: "jember@mpj.id" },
    ];

    const passwordHash = await hash("bismillah", 10);
    const regionMap = new Map<string, string>(); // name -> regionId

    for (const r of regions) {
        // Generate Region Data if not exists
        let region = await prisma.region.findFirst({ where: { name: r.name } });
        if (!region) {
            region = await prisma.region.create({
                data: { name: r.name, code: r.name.toUpperCase().substring(0, 3) },
            });
        }
        regionMap.set(r.name, region.id);

        // Create User & Profile
        const user = await prisma.user.upsert({
            where: { email: r.email },
            update: { passwordHash },
            create: { email: r.email, passwordHash },
        });

        await prisma.profile.upsert({
            where: { id: user.id },
            update: {
                role: AppRole.admin_regional,
                statusAccount: "active",
                regionId: region.id,
                profileLevel: "gold",
            },
            create: {
                id: user.id,
                role: AppRole.admin_regional,
                statusAccount: "active",
                regionId: region.id,
                profileLevel: "gold",
            },
        });

        // Ensure role in UserRole
        const existingRole = await prisma.userRole.findFirst({ where: { userId: user.id } });
        if (!existingRole) {
            await prisma.userRole.create({
                data: { userId: user.id, role: AppRole.admin_regional },
            });
        }

        console.log(`Created admin for ${r.name}: ${r.email}`);
    }

    // 2. Create Events
    const events = [
        {
            name: "Rapat Kerja Wilayah 2025",
            date: new Date("2025-01-15T09:00:00Z"),
            location: "Hotel Majapahit Surabaya",
            description: "Rapat koordinasi awal tahun seluruh wilayah.",
            status: "completed",
        },
        {
            name: "Kopdar Akbar MPJ",
            date: new Date("2026-03-20T08:00:00Z"),
            location: "Islamic Center Malang",
            description: "Silaturahmi akbar anggota MPJ se-Jatim.",
            status: "upcoming",
        },
        {
            name: "Pelatihan Digital Marketing Pesantren",
            date: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days ago
            location: "Zoom Meeting",
            description: "Pelatihan optimalisasi media sosial untuk dakwah.",
            status: "ongoing",
        },
    ];

    for (const e of events) {
        const event = await prisma.event.create({
            data: e,
        });
        console.log(`Created event: ${e.name}`);

        // 3. Create Dummy Reports for "Completed" or "Ongoing" events
        if (e.status !== "upcoming") {
            // Randomly select some regions to submit reports
            for (const [rName, rId] of regionMap.entries()) {
                if (Math.random() > 0.3) { // 70% chance to submit
                    await prisma.eventReport.create({
                        data: {
                            eventId: event.id,
                            regionId: rId,
                            participationCount: Math.floor(Math.random() * 50) + 10,
                            notes: `Laporan dari ${rName}: Kegiatan berjalan lancar.`,
                            submittedAt: new Date(),
                        },
                    });
                    console.log(`  -> Report submitted by ${rName}`);
                }
            }
        }
    }

    console.log("Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
