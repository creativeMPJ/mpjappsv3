import "dotenv/config";
import { AppRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "../prisma";

interface SeedUser {
    email: string;
    password: string;
    role: AppRole;
    namaPesantren?: string;
    namaPengasuh?: string;
}

const USERS: SeedUser[] = [
    {
        email: "user@mpj.id",
        password: "user1234",
        role: AppRole.user,
        namaPesantren: "Pesantren Nurul Huda",
        namaPengasuh: "KH. Ahmad",
    },
    {
        email: "regional@mpj.id",
        password: "regional1234",
        role: AppRole.admin_regional,
    },
    {
        email: "pusat@mpj.id",
        password: "pusat1234",
        role: AppRole.admin_pusat,
    },
    {
        email: "finance@mpj.id",
        password: "finance1234",
        role: AppRole.admin_finance,
    },
];

async function createUser(seed: SeedUser) {
    const passwordHash = await hash(seed.password, 10);

    // Upsert user
    const user = await prisma.user.upsert({
        where: { email: seed.email },
        update: { passwordHash },
        create: { email: seed.email, passwordHash },
    });

    // Find region for admin_regional
    let regionId: string | undefined;
    if (seed.role === AppRole.admin_regional) {
        const region = await prisma.region.findFirst({ where: { code: "35" } });
        regionId = region?.id;
    }

    // Upsert profile
    await prisma.profile.upsert({
        where: { id: user.id },
        update: {
            role: seed.role,
            statusAccount: "active",
            ...(regionId ? { regionId } : {}),
            ...(seed.namaPesantren ? { namaPesantren: seed.namaPesantren } : {}),
            ...(seed.namaPengasuh ? { namaPengasuh: seed.namaPengasuh } : {}),
        },
        create: {
            id: user.id,
            role: seed.role,
            statusAccount: "active",
            ...(regionId ? { regionId } : {}),
            ...(seed.namaPesantren ? { namaPesantren: seed.namaPesantren } : {}),
            ...(seed.namaPengasuh ? { namaPengasuh: seed.namaPengasuh } : {}),
        },
    });

    // Upsert user role
    const existingRole = await prisma.userRole.findFirst({ where: { userId: user.id } });
    if (existingRole) {
        await prisma.userRole.update({
            where: { id: existingRole.id },
            data: { role: seed.role },
        });
    } else {
        await prisma.userRole.create({
            data: { userId: user.id, role: seed.role },
        });
    }

    console.log(`  ✅ ${seed.role.padEnd(16)} | ${seed.email.padEnd(22)} | password: ${seed.password}`);
}

async function main() {
    console.log("\n🌱 Seeding users for all roles...\n");
    console.log("  Role               Email                    Password");
    console.log("  ────────────────   ──────────────────────   ────────────");

    for (const user of USERS) {
        await createUser(user);
    }

    console.log("\n✨ All users created successfully!\n");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
