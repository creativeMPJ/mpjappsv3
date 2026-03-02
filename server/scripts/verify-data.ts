import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Verifying Profile Data...");

    const user = await prisma.user.findUnique({
        where: { email: "pending_details@mpj.id" },
    });

    if (!user) {
        console.error("❌ User not found!");
        return;
    }

    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
    });

    if (!profile) {
        console.error("❌ Profile not found!");
        return;
    }

    console.log("✅ Profile Found:", {
        namaPengasuh: profile.namaPengasuh, // Was visible
        niam: profile.niam, // Was missing
        alamatLengkap: profile.alamatLengkap, // Was missing
        kecamatan: profile.kecamatan, // Was missing
        jumlahKru: profile.jumlahKru, // Was missing
        socialLinks: profile.socialLinks,
    });
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
