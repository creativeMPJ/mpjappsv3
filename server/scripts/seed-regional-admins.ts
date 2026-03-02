import "dotenv/config";
import { AppRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "../prisma";

/**
 * Seed 16 Admin Regional accounts with named email format.
 *
 * Email format:  adminregional.{nama}@mpj.id
 * Password:      mpj{nama}2026
 */

interface RegionalAccount {
    code: string;
    emailSlug: string; // used in email: adminregional.{slug}@mpj.id
    passwordSlug: string; // used in password: mpj{slug}2026
}

const ACCOUNTS: RegionalAccount[] = [
    { code: "01", emailSlug: "malangraya", passwordSlug: "malangraya" },
    { code: "02", emailSlug: "blitarraya", passwordSlug: "blitarraya" },
    { code: "03", emailSlug: "tulunggalek", passwordSlug: "tulunggalek" },
    { code: "04", emailSlug: "platae", passwordSlug: "platae" },
    { code: "05", emailSlug: "banyuwangi", passwordSlug: "banyuwangi" },
    { code: "06", emailSlug: "ojolamban", passwordSlug: "ojolamban" },
    { code: "07", emailSlug: "kediriraya", passwordSlug: "kediriraya" },
    { code: "08", emailSlug: "jombang", passwordSlug: "jombang" },
    { code: "09", emailSlug: "mojokerto", passwordSlug: "mojokerto" },
    { code: "10", emailSlug: "dapuliv", passwordSlug: "dapuliv" },
    { code: "11", emailSlug: "nganjuk", passwordSlug: "nganjuk" },
    { code: "12", emailSlug: "maduraraya", passwordSlug: "maduraraya" },
    { code: "13", emailSlug: "probolinggoraya", passwordSlug: "probolinggoraya" },
    { code: "14", emailSlug: "surabayagresik", passwordSlug: "surabayagresik" },
    { code: "15", emailSlug: "sidoarjopasuruan", passwordSlug: "sidoarjopasuruan" },
    { code: "16", emailSlug: "situbondobondowoso", passwordSlug: "situbondobondowoso" },
];

async function main() {
    console.log("\n🌱 Seeding Admin Regional accounts (named format)...\n");
    console.log("  Kode  Email                                          Password");
    console.log("  ────  ─────────────────────────────────────────────   ────────────────────────");

    for (const acc of ACCOUNTS) {
        const region = await prisma.region.findUnique({ where: { code: acc.code } });
        if (!region) {
            console.log(`  ❌ Region ${acc.code} not found, skipping`);
            continue;
        }

        const email = `adminregional.${acc.emailSlug}@mpj.id`;
        const password = `mpj${acc.passwordSlug}2026`;
        const passwordHash = await hash(password, 10);

        // Upsert user
        const user = await prisma.user.upsert({
            where: { email },
            update: { passwordHash },
            create: { email, passwordHash },
        });

        // Upsert profile
        await prisma.profile.upsert({
            where: { id: user.id },
            update: {
                role: AppRole.admin_regional,
                statusAccount: "active",
                regionId: region.id,
                namaPesantren: `Admin ${region.name}`,
            },
            create: {
                id: user.id,
                role: AppRole.admin_regional,
                statusAccount: "active",
                regionId: region.id,
                namaPesantren: `Admin ${region.name}`,
            },
        });

        // Upsert user role
        const existingRole = await prisma.userRole.findFirst({ where: { userId: user.id } });
        if (existingRole) {
            await prisma.userRole.update({
                where: { id: existingRole.id },
                data: { role: AppRole.admin_regional },
            });
        } else {
            await prisma.userRole.create({
                data: { userId: user.id, role: AppRole.admin_regional },
            });
        }

        console.log(
            `  ✅ ${acc.code}  ${email.padEnd(49)} ${password}`
        );
    }

    console.log("\n✨ All 16 admin regional accounts created!\n");
    console.log("📌 Login di: http://localhost:5173/login");
    console.log("📌 Dashboard: /admin-regional\n");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
