import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OFF  = { view: false, create: false, update: false, delete: false };
const FULL = { view: true,  create: true,  update: true,  delete: true  };
const VIEW = { view: true,  create: false, update: false, delete: false };

const TEMPLATE = {
  // User / Admin Media
  identitas: OFF, pembayaran: OFF, tim: OFF, eid: OFF, hub: OFF, 'user-event': OFF,
  // Admin Pusat
  administrasi: OFF, 'master-data': OFF, 'master-regional': OFF, militansi: OFF, 'mpj-hub': OFF, 'admin-pusat-manajemen-event': OFF,
  // Admin Regional
  'data-master': OFF, 'validasi-pendaftar': OFF, laporan: OFF, 'late-payment': OFF, 'download-center': OFF, 'admin-regional-manajemen-event': OFF,
  // Admin Finance
  verifikasi: OFF, 'laporan-keuangan': OFF, harga: OFF, clearing: OFF, 'regional-monitoring': OFF,
  // Super Admin
  'user-management': OFF, hierarchy: OFF, finance: OFF, 'hak-akses': OFF,
  // Shared
  pengaturan: OFF,
};

const ROLES: Array<{ nama: string; akses: Record<string, object> }> = [
  {
    nama: 'Admin Keuangan',
    akses: {
      ...TEMPLATE,
      verifikasi: FULL, 'laporan-keuangan': FULL, harga: FULL,
      clearing: FULL, 'regional-monitoring': FULL, pengaturan: FULL,
    },
  },
  {
    nama: 'Pengguna Pesantren', // will be created if not exists
    akses: {
      ...TEMPLATE,
      eid: FULL, identitas: FULL, pembayaran: FULL,
      tim: FULL, 'user-event': FULL, hub: FULL, pengaturan: FULL,
    },
  },
  {
    nama: 'Kru Pesantren',
    akses: {
      ...TEMPLATE,
      eid: FULL,
      tim: { view: true, create: false, update: true, delete: false },
      militansi: VIEW, 'user-event': VIEW, hub: VIEW, pengaturan: FULL,
    },
  },
  {
    nama: 'Admin Regional',
    akses: {
      ...TEMPLATE,
      'validasi-pendaftar': FULL, 'data-master': FULL, laporan: FULL,
      'late-payment': FULL, 'download-center': FULL,
      'admin-regional-manajemen-event': FULL, hub: FULL, pengaturan: FULL,
    },
  },
  {
    nama: 'Admin Pusat',
    akses: {
      ...TEMPLATE,
      administrasi: FULL, 'master-data': FULL, 'master-regional': FULL,
      'admin-pusat-manajemen-event': FULL, militansi: FULL, 'mpj-hub': FULL,
      hub: FULL, finance: FULL, 'user-management': FULL,
      hierarchy: FULL, 'hak-akses': FULL, pengaturan: FULL,
    },
  },
];

async function main() {
  for (const role of ROLES) {
    const json = JSON.stringify(role.akses);
    const updated = await prisma.$executeRaw`
      UPDATE roles SET akses = ${json} WHERE nama = ${role.nama}
    `;
    if (updated === 0) {
      // Role belum ada di DB — buat baru
      const newId = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO roles (id, nama, is_super_admin, akses, created_at, updated_at)
        VALUES (${newId}, ${role.nama}, 0, ${json}, NOW(), NOW())
      `;
      console.log(`+ ${role.nama} — created (tidak ada sebelumnya)`);
    } else {
      console.log(`✓ ${role.nama} — ${updated} row updated`);
    }
  }
  console.log('\nSelesai. Silakan login ulang untuk verifikasi.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
