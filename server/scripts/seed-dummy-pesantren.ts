/**
 * seed-dummy-pesantren.ts
 *
 * Membuat 917 data dummy pesantren untuk keperluan tampilan dashboard admin pusat.
 * Tiap pesantren: User + Profile (active/paid) + UserRole + 1-3 Crew.
 * 28 wilayah Jawa Timur dibuat otomatis jika belum ada.
 *
 * Usage: npx tsx server/scripts/seed-dummy-pesantren.ts
 */

import "dotenv/config";
import { AppRole, PrismaClient, ProfileLevel } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// ─── 28 Wilayah Jawa Timur ───────────────────────────────────────────────────
const WILAYAH = [
  { name: "Surabaya",    code: "01", quota: 72 },
  { name: "Malang",      code: "02", quota: 65 },
  { name: "Kediri",      code: "03", quota: 52 },
  { name: "Sidoarjo",    code: "04", quota: 48 },
  { name: "Gresik",      code: "05", quota: 42 },
  { name: "Jombang",     code: "06", quota: 40 },
  { name: "Mojokerto",   code: "07", quota: 37 },
  { name: "Pasuruan",    code: "08", quota: 35 },
  { name: "Jember",      code: "09", quota: 38 },
  { name: "Probolinggo", code: "10", quota: 32 },
  { name: "Blitar",      code: "11", quota: 28 },
  { name: "Tulungagung", code: "12", quota: 27 },
  { name: "Nganjuk",     code: "13", quota: 25 },
  { name: "Lamongan",    code: "14", quota: 30 },
  { name: "Bojonegoro",  code: "15", quota: 22 },
  { name: "Tuban",       code: "16", quota: 20 },
  { name: "Madiun",      code: "17", quota: 24 },
  { name: "Ngawi",       code: "18", quota: 16 },
  { name: "Ponorogo",    code: "19", quota: 18 },
  { name: "Pacitan",     code: "20", quota: 12 },
  { name: "Banyuwangi",  code: "21", quota: 30 },
  { name: "Situbondo",   code: "22", quota: 18 },
  { name: "Bondowoso",   code: "23", quota: 17 },
  { name: "Lumajang",    code: "24", quota: 22 },
  { name: "Bangkalan",   code: "25", quota: 20 },
  { name: "Sampang",     code: "26", quota: 16 },
  { name: "Pamekasan",   code: "27", quota: 18 },
  { name: "Sumenep",     code: "28", quota: 13 },
];
// Total quota = 917

// ─── Data Generator ──────────────────────────────────────────────────────────
const NAMA_PREFIXES = ["PP", "PP", "PP", "MA", "Madrasah", "Pondok", "PP"];
const NAMA_TENGAH = [
  "Al-Falah", "Darussalam", "Nurul Huda", "Al-Hidayah", "Raudlatul Ulum",
  "Al-Ikhlas", "Miftahul Ulum", "Ar-Ridha", "Al-Amin", "Tarbiyatul Ulum",
  "Bahrul Ulum", "Al-Mubarok", "Darul Huda", "Al-Anwar", "Salafiyah",
  "Nurul Islam", "Al-Falahiyah", "Darul Ulum", "Al-Hikmah", "Nurul Falah",
  "Al-Barokah", "Mambaus Sholihin", "Lirboyo", "Sidogiri", "Al-Munawwir",
  "Tebuireng", "Langitan", "Maskumambang", "Al-Fatah", "Al-Quraniyah",
  "Al-Kautsar", "Nurul Jadid", "Annuqayah", "Zainul Hasan", "Al-Hamid",
  "Ihyaul Ulum", "Al-Muhtadi", "Roudlotul Mubtadi'in", "Al-Basyariyah",
  "Assalafi", "Miftahussalam", "Nurul Qur'an", "Baitul Arqom", "Al-Karimiyah",
];
const PENGASUH_PREFIX = ["KH.", "KH.", "Gus", "Ustadz", "Nyai"];
const PENGASUH_NAMA = [
  "Ahmad Fauzi", "Muhammad Kholil", "Abdullah Syafi'i", "Abdul Ghofur",
  "Hasan Basri", "Mujib Rahman", "Syukri Fatah", "Zainal Arifin",
  "Nur Hadi", "Imam Ghozali", "Yusuf Mansur", "Musthofa Asy'ari",
  "Idris Hamid", "Miftahul Huda", "Sholeh Bahruddin", "Khoirul Anam",
  "Bajuri Hasyim", "Agus Salim", "Hamid Fahmi", "Sofyan Tsauri",
  "Lutfi Bashori", "Nasrulloh Afandi", "Rifa'i Arief", "Sholahuddin Wahid",
  "Taufiq Hidayat", "Ubaid Abdillah", "Wahid Hasyim", "Yahya Cholil",
  "Zubair Umar", "Aris Munandar",
];
const NAMA_KRU = [
  "Ahmad Rizki", "Muhammad Faris", "Abdullah Haikal", "Hafiz Maulana",
  "Ilham Akbar", "Farhan Dzikri", "Ghifari Rayhan", "Hilmi Aufa",
  "Ibrahim Zaki", "Jabir Luqman", "Karim Shaleh", "Lathif Naufal",
  "Mansur Dzaki", "Nabil Arkan", "Omar Bilal", "Qais Afkar",
  "Rafi Sakha", "Salim Wahib", "Thariq Yazid", "Umar Shidqi",
  "Siti Aisyah", "Fatimah Zahra", "Khadijah Nur", "Mariam Aulia",
  "Nadia Safira", "Putri Hasanah", "Qonita Hana", "Rania Salsabila",
  "Sarah Muslimah", "Tsaniya Fathi",
];
const JABATAN_OPTIONS = ["Ketua", "Videografer", "Fotografer", "Desainer", "Copywriter", "Admin"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomLevel(): ProfileLevel {
  const r = Math.random();
  if (r < 0.35) return ProfileLevel.basic;
  if (r < 0.60) return ProfileLevel.silver;
  if (r < 0.82) return ProfileLevel.gold;
  return ProfileLevel.platinum;
}

function randomDate(daysBack: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, daysBack));
  return d;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🕌  SEED DUMMY PESANTREN — 917 data\n");

  const passwordHash = await hash("bismillah", 10);
  const year = new Date().getFullYear().toString().slice(-2);

  // ── 1. Ensure regions ────────────────────────────────────────────────────
  console.log("📍 Mempersiapkan 28 wilayah Jawa Timur...");
  const regionIds = new Map<string, string>(); // code -> id

  for (const w of WILAYAH) {
    let region = await prisma.region.findFirst({ where: { code: w.code } });
    if (!region) {
      region = await prisma.region.create({ data: { name: w.name, code: w.code } });
      process.stdout.write(`  + ${w.name}\n`);
    }
    regionIds.set(w.code, region.id);
  }

  // ── 2. Check how many dummy pesantren already exist ─────────────────────
  const existingCount = await prisma.profile.count({
    where: {
      role: AppRole.user,
      statusAccount: "active",
      nip: { not: null },
    },
  });
  console.log(`\n📊 Pesantren aktif saat ini: ${existingCount}`);

  if (existingCount >= 917) {
    console.log("✅ Data dummy sudah ada (>= 917). Tidak ada yang ditambahkan.");
    return;
  }

  const toCreate = 917 - existingCount;
  console.log(`🚀 Membuat ${toCreate} pesantren baru...\n`);

  // Build distribution plan (subtract existing)
  let totalPlanned = 0;
  const plan: Array<{ regionCode: string; count: number }> = [];
  const ratio = toCreate / 917;
  for (const w of WILAYAH) {
    const count = Math.max(0, Math.round(w.quota * ratio));
    plan.push({ regionCode: w.code, count });
    totalPlanned += count;
  }
  // Adjust rounding diff on first region
  plan[0].count += toCreate - totalPlanned;

  // ── 3. Create pesantren ──────────────────────────────────────────────────
  let created = 0;
  let seqMap = new Map<string, number>(); // regionCode -> current seq

  // Seed seqMap from existing NIPs per region
  for (const w of WILAYAH) {
    const lastProfile = await prisma.profile.findFirst({
      where: { regionId: regionIds.get(w.code), nip: { not: null } },
      orderBy: { nip: "desc" },
    });
    const lastSeq = lastProfile?.nip
      ? parseInt(lastProfile.nip.slice(-4), 10)
      : 0;
    seqMap.set(w.code, isNaN(lastSeq) ? 0 : lastSeq);
  }

  for (const { regionCode, count } of plan) {
    if (count <= 0) continue;
    const regionId = regionIds.get(regionCode)!;

    for (let i = 0; i < count; i++) {
      const seq = (seqMap.get(regionCode) ?? 0) + 1;
      seqMap.set(regionCode, seq);
      const nip = `${year}${regionCode}${String(seq).padStart(4, "0")}`;

      const namaPesantren = `${pick(NAMA_PREFIXES)} ${pick(NAMA_TENGAH)} ${WILAYAH.find(w => w.code === regionCode)!.name}`;
      const namaPengasuh = `${pick(PENGASUH_PREFIX)} ${pick(PENGASUH_NAMA)}`;
      const level = randomLevel();
      const createdAt = randomDate(730); // up to 2 years ago

      // User
      const userId = randomUUID();
      const email = `pesantren.${nip}@dummy.mpj.id`;

      try {
        await prisma.user.create({
          data: {
            id: userId,
            email,
            passwordHash,
            createdAt,
          },
        });

        await prisma.profile.create({
          data: {
            id: userId,
            role: AppRole.user,
            statusAccount: "active",
            statusPayment: "paid",
            profileLevel: level,
            namaPesantren,
            namaPengasuh,
            nip,
            regionId,
            noWaPendaftar: `08${randInt(100000000, 999999999)}`,
            jumlahSantri: randInt(50, 800),
            createdAt,
          },
        });

        await prisma.userRole.create({
          data: { userId, role: AppRole.user },
        });

        // Crew: 1–3 per pesantren
        const crewCount = randInt(1, 3);
        for (let c = 0; c < crewCount; c++) {
          await prisma.crew.create({
            data: {
              profileId: userId,
              nama: pick(NAMA_KRU),
              jabatan: pick(JABATAN_OPTIONS),
              createdAt,
            },
          });
        }

        created++;
        if (created % 50 === 0) {
          process.stdout.write(`  ✓ ${created}/${toCreate}\n`);
        }
      } catch (err: any) {
        // Skip if email conflict (idempotent)
        if (!err?.message?.includes("Unique constraint")) throw err;
      }
    }
  }

  const finalCount = await prisma.profile.count({
    where: { role: AppRole.user, statusAccount: "active", nip: { not: null } },
  });
  const totalCrew = await prisma.crew.count();

  console.log(`\n${"═".repeat(60)}`);
  console.log(`✅  Selesai!`);
  console.log(`   Total Pesantren Aktif : ${finalCount}`);
  console.log(`   Total Wilayah         : ${WILAYAH.length}`);
  console.log(`   Total Kru (Anggota)   : ${totalCrew}`);
  console.log(`${"═".repeat(60)}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
