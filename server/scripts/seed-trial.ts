import "dotenv/config";
import { AppRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "../prisma";

/**
 * seed-trial.ts
 * 
 * Prepares a clean environment for end-to-end trial testing.
 * Ensures: regions, cities, system settings, and test accounts for all roles.
 * 
 * Usage: npx tsx server/scripts/seed-trial.ts
 */

const TRIAL_USERS = [
    {
        email: "trial@mpj.id",
        password: "trial1234",
        role: AppRole.user,
        description: "Fresh user for registration trial",
    },
    {
        email: "regional@mpj.id",
        password: "regional1234",
        role: AppRole.admin_regional,
        description: "Admin Regional (approves claims)",
    },
    {
        email: "pusat@mpj.id",
        password: "pusat1234",
        role: AppRole.admin_pusat,
        description: "Admin Pusat (master data, final approval)",
    },
    {
        email: "finance@mpj.id",
        password: "finance1234",
        role: AppRole.admin_finance,
        description: "Admin Finance (payment verification)",
    },
];

async function main() {
    console.log("\n🧪 SEED TRIAL — Preparing E2E Test Environment\n");

    // ── 1. Region & City ──────────────────────────────────────────────
    console.log("📍 Setting up region & city...");
    let region = await prisma.region.findFirst({ where: { code: "35" } });
    if (!region) {
        region = await prisma.region.create({
            data: { name: "Jawa Timur", code: "35" },
        });
        console.log("   Created region: Jawa Timur (35)");
    } else {
        console.log("   Region exists: Jawa Timur (35)");
    }

    const cityExists = await prisma.city.findFirst({
        where: { name: "Kota Surabaya", regionId: region.id },
    });
    if (!cityExists) {
        await prisma.city.create({
            data: { name: "Kota Surabaya", regionId: region.id },
        });
        console.log("   Created city: Kota Surabaya");
    } else {
        console.log("   City exists: Kota Surabaya");
    }

    // ── 2. System Settings ────────────────────────────────────────────
    console.log("\n💰 Setting up system settings...");
    const settings = [
        { key: "registration_base_price", value: 50000, description: "Harga pendaftaran pesantren baru" },
        { key: "claim_base_price", value: 20000, description: "Harga klaim akun lama" },
        { key: "bank_name", value: "Bank Syariah Indonesia (BSI)", description: "Nama bank tujuan" },
        { key: "bank_account_number", value: "7171234567890", description: "Nomor rekening tujuan" },
        { key: "bank_account_name", value: "MEDIA PONDOK JAWA TIMUR", description: "Nama pemilik rekening" },
    ];

    for (const s of settings) {
        const existing = await prisma.systemSetting.findFirst({ where: { key: s.key } });
        if (!existing) {
            await prisma.systemSetting.create({ data: s });
            console.log(`   Created: ${s.key} = ${s.value}`);
        } else {
            console.log(`   Exists: ${s.key} = ${existing.value}`);
        }
    }

    // ── 3. User Accounts ──────────────────────────────────────────────
    console.log("\n👥 Setting up user accounts...\n");
    console.log("   Role               Email                    Password       Description");
    console.log("   ────────────────   ──────────────────────   ────────────   ─────────────────────────");

    for (const u of TRIAL_USERS) {
        const passwordHash = await hash(u.password, 10);

        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: { passwordHash },
            create: { email: u.email, passwordHash },
        });

        const profileData: any = {
            role: u.role,
            statusAccount: "active",
        };

        // Assign admin_regional to the Jawa Timur region
        if (u.role === AppRole.admin_regional) {
            profileData.regionId = region.id;
        }

        // Fresh trial user — keep status active but no pesantren data
        // so they go through CheckInstitution flow

        await prisma.profile.upsert({
            where: { id: user.id },
            update: profileData,
            create: { id: user.id, ...profileData },
        });

        // Upsert role
        const existingRole = await prisma.userRole.findFirst({ where: { userId: user.id } });
        if (existingRole) {
            await prisma.userRole.update({
                where: { id: existingRole.id },
                data: { role: u.role },
            });
        } else {
            await prisma.userRole.create({
                data: { userId: user.id, role: u.role },
            });
        }

        console.log(
            `   ✅ ${u.role.padEnd(16)} | ${u.email.padEnd(22)} | ${u.password.padEnd(12)} | ${u.description}`
        );
    }

    console.log("\n" + "═".repeat(80));
    console.log("🎯 TRIAL FLOW:");
    console.log("   1. Login as trial@mpj.id → CheckInstitution → daftarkan pesantren baru");
    console.log("   2. Login as regional@mpj.id → Validasi Pendaftar → approve claim");
    console.log("   3. Login as trial@mpj.id → halaman Payment → upload bukti bayar");
    console.log("   4. Login as finance@mpj.id → Verifikasi → approve pembayaran");
    console.log("   5. Login as pusat@mpj.id → Master Data → cek pesantren baru");
    console.log("   6. Login as trial@mpj.id → akses dashboard user ✅");
    console.log("═".repeat(80) + "\n");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
