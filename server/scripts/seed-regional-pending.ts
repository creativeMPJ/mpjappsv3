import "dotenv/config";
import { AppRole, ClaimStatus, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding Regional Pending Claim with Detailed Profile...");

    // 1. Ensure Region
    // Use Surabaya to match seed-regional-dummy.ts admin (surabaya@mpj.id)
    let region = await prisma.region.findFirst({ where: { name: "Surabaya" } });
    if (!region) {
        region = await prisma.region.create({
            data: { name: "Surabaya", code: "SUR" }, // Matching dummy seed
        });
    }

    // 2. Create User
    const email = "pending_details@mpj.id";
    const passwordHash = await hash("123456", 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: { passwordHash },
        create: { email, passwordHash },
    });

    // 3. Create Detailed Profile
    // Note: niam unique constraint handled by upsert on ID, but if niam exists on another user it fails.
    // We assume test environment.

    // Check if niam exists elsewhere and clear it if needed for testing (optional safety)
    const existingNiam = await prisma.profile.findUnique({ where: { niam: "123456789" } });
    if (existingNiam && existingNiam.id !== user.id) {
        await prisma.profile.update({ where: { id: existingNiam.id }, data: { niam: null } });
    }

    await prisma.profile.upsert({
        where: { id: user.id },
        update: {
            role: AppRole.user,
            statusAccount: "pending",
            regionId: region.id,
            namaPesantren: "Pesantren Teknologi Modern",
            namaPengasuh: "Kyai Tech",
            // Identity
            niam: "123456789",
            isAlumni: true,
            // Address
            alamatSingkat: "Jl. Raya Tech No. 1",
            alamatLengkap: "Jl. Raya Teknologi No. 1, RT 01 RW 02, Dusun Cyber",
            kecamatan: "Kecamatan Digital",
            desa: "Desa Kode",
            kodePos: "60000",
            mapsLink: "https://maps.google.com/?q=-7.25,112.75",
            // Contact
            noWaPendaftar: "081234567890",
            // Media
            namaMedia: "Tech Media",
            ketuaMedia: "Santri Dev",
            tahunBerdiri: "2020",
            jumlahKru: 15,
            logoMediaUrl: "https://via.placeholder.com/150",
            fotoGedungUrl: "https://via.placeholder.com/400x200",
            // Socials
            website: "https://mpj.id",
            instagram: "@mpj_tech",
            facebook: "https://facebook.com/mpj_tech",
            youtube: "https://youtube.com/mpj_tech",
            tiktok: "https://tiktok.com/@mpj_tech",
            // Education
            jenjangPendidikan: ["SMP", "SMA", "Ma'had Aly"],
        },
        create: {
            id: user.id,
            role: AppRole.user,
            statusAccount: "pending",
            regionId: region.id,
            namaPesantren: "Pesantren Teknologi Modern",
            namaPengasuh: "Kyai Tech",
            // Identity
            niam: "123456789",
            isAlumni: true,
            // Address
            alamatSingkat: "Jl. Raya Tech No. 1",
            alamatLengkap: "Jl. Raya Teknologi No. 1, RT 01 RW 02, Dusun Cyber",
            kecamatan: "Kecamatan Digital",
            desa: "Desa Kode",
            kodePos: "60000",
            mapsLink: "https://maps.google.com/?q=-7.25,112.75",
            // Contact
            noWaPendaftar: "081234567890",
            // Media
            namaMedia: "Tech Media",
            ketuaMedia: "Santri Dev",
            tahunBerdiri: "2020",
            jumlahKru: 15,
            logoMediaUrl: "https://via.placeholder.com/150",
            fotoGedungUrl: "https://via.placeholder.com/400x200",
            // Socials
            website: "https://mpj.id",
            instagram: "@mpj_tech",
            facebook: "https://facebook.com/mpj_tech",
            youtube: "https://youtube.com/mpj_tech",
            tiktok: "https://tiktok.com/@mpj_tech",
            // Education
            jenjangPendidikan: ["SMP", "SMA", "Ma'had Aly"],
        },
    });

    // 4. Create Pending Claim
    // Delete existing claim first
    await prisma.pesantrenClaim.deleteMany({ where: { userId: user.id } });

    await prisma.pesantrenClaim.create({
        data: {
            userId: user.id,
            regionId: region.id,
            status: ClaimStatus.pending,
            pesantrenName: "Pesantren Teknologi Modern",
            namaPengelola: "Santri Admin",
            jenisPengajuan: "pesantren_baru",
            createdAt: new Date(),
        },
    });

    console.log("✅ Seed complete! Log in as Regional Admin (e.g. surabaya@mpj.id) to verify.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
