import "dotenv/config";
import { AppRole, ClaimStatus, PaymentVerificationStatus } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "../prisma";

/**
 * seed-admin-flow.ts
 * 
 * Creates a specific scenario for Administration Verification:
 * 1. User registers & submits claim (Pesantren Al-Ikhlas)
 * 2. Regional approves claim
 * 3. User uploads payment proof (simulated)
 * 4. Payment enters 'pending_verification' state
 * 
 * Target: Admin Pusat dashboard should show 1 pending payment.
 */

async function main() {
    console.log("\n🧪 SEED ADMIN FLOW — Preparing Verification Scenario\n");

    // 1. Ensure Region (Jawa Timur)
    let region = await prisma.region.findFirst({ where: { code: "35" } });
    if (!region) {
        region = await prisma.region.create({
            data: { name: "Jawa Timur", code: "35" },
        });
        console.log("   📍 Region created/found: Jawa Timur (35)");
    }

    const city = await prisma.city.findFirst({ where: { regionId: region.id } })
        || await prisma.city.create({ data: { name: "Kota Surabaya", regionId: region.id } });

    // 2. Create Actors
    const passwordHash = await hash("123456", 10);

    const createUser = async (email: string, role: AppRole, name: string) => {
        const user = await prisma.user.upsert({
            where: { email },
            update: { passwordHash },
            create: { email, passwordHash },
        });

        await prisma.profile.upsert({
            where: { id: user.id },
            update: { role, statusAccount: "active", regionId: role === AppRole.admin_regional ? region!.id : undefined },
            create: { id: user.id, role, statusAccount: "active", regionId: role === AppRole.admin_regional ? region!.id : undefined },
        });

        // Also update UserRole table
        const existingRole = await prisma.userRole.findFirst({ where: { userId: user.id } });
        if (existingRole) {
            await prisma.userRole.update({ where: { id: existingRole.id }, data: { role } });
        } else {
            await prisma.userRole.create({ data: { userId: user.id, role } });
        }

        console.log(`   👤 Created/Updated ${role}: ${email} (${name})`);
        return user;
    };

    const adminPusat = await createUser("pusat_flow@mpj.id", AppRole.admin_pusat, "Admin Pusat");
    const adminRegional = await createUser("regional_flow@mpj.id", AppRole.admin_regional, "Admin Jatim");
    const user = await createUser("user_flow@mpj.id", AppRole.user, "User Pesantren");

    // 3. Create Claim & Simulate Flow
    console.log("\n   📝 Creating Claim & Payment Flow...");

    // Cleanup existing claims for this user to avoid conflicts
    await prisma.payment.deleteMany({ where: { userId: user.id } });
    await prisma.pesantrenClaim.deleteMany({ where: { userId: user.id } });

    const claim = await prisma.pesantrenClaim.create({
        data: {
            userId: user.id,
            pesantrenName: "Pesantren Al-Ikhlas Modern",
            namaPengelola: "Ust. Ahmad Fauzi",
            jenisPengajuan: "pesantren_baru",
            regionId: region.id,
            status: ClaimStatus.regional_approved, // Already approved by regional
            regionalApprovedAt: new Date(),
        }
    });
    console.log("      ✅ Claim created & Regional Approved");

    // 4. Create Payment Pending Verification
    const payment = await prisma.payment.create({
        data: {
            userId: user.id,
            pesantrenClaimId: claim.id,
            baseAmount: 50000,
            uniqueCode: 123,
            totalAmount: 50123,
            status: PaymentVerificationStatus.pending_verification, // User has paid & uploaded proof
            proofFileUrl: "https://via.placeholder.com/300x400.png?text=Bukti+Transfer", // Mock proof URL
            createdAt: new Date(),
        }
    });
    console.log("      ✅ Payment created: Pending Verification (Rp 50.123)");

    console.log("\n" + "═".repeat(50));
    console.log("🚀 READY FOR ADMIN VERIFICATION");
    console.log("   Login as: pusat_flow@mpj.id / 123456");
    console.log("   Go to:    Administrasi > Verifikasi");
    console.log("   Expect:   1 Payment from 'Pesantren Al-Ikhlas Modern'");
    console.log("═".repeat(50) + "\n");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
