# PRD — Modul Master Data MPJ (Pesantren, Media & Kru)
**Versi:** 4.0 · **Tanggal:** 30 April 2026  
**Sumber:** Analisis source code `AdminPusatMasterData.tsx`, `PublicPesantrenProfile.tsx`, `PublicCrewProfile.tsx`, `PublicDirektori.tsx`, `GlobalSearchNIPNIAM.tsx`, `ExcelImportDialog.tsx`

---

## 1. Latar Belakang & Tujuan

Modul Master Data adalah **database resmi** seluruh anggota MPJ Jawa Timur yang mencakup tiga entitas utama:
- **Pesantren** — lembaga pesantren yang terdaftar beserta nama pengasuh dan profil media
- **Media** — unit media pesantren (nama media, admin, contact)
- **Kru** — personel/anggota media per pesantren dengan jabatan dan NIAM

Modul ini berfungsi sebagai:
1. Sumber data tunggal (single source of truth) untuk identitas seluruh anggota
2. Basis verifikasi untuk modul lain (Event, Administrasi, Regional)
3. Halaman publik verifikasi keanggotaan (profil pesantren & kru dapat dicek siapa pun)

---

## 2. Sistem Identitas (NIP & NIAM)

### 2.1 NIP — Nomor Induk Pesantren
- Format: `XX.YY.ZZZ` (contoh: `25.07.001`)
- Bagian: `[Kode Regional].[Tahun Daftar].[Nomor Urut]`
- **Bersifat permanen** setelah diterbitkan, tidak dapat diubah
- Digunakan untuk URL profil publik: `/pesantren/25.07.001`

### 2.2 NIAM — Nomor Induk Anggota Media
- Format mengikuti sistem internal MPJ
- Diformat via `formatNIAM()` dari `@/lib/id-utils`
- Suffix 2 digit terakhir dipakai untuk URL kru: `/pesantren/25.07.001/crew/01`
- **Bersifat permanen** setelah diterbitkan

### 2.3 Profile Level (Keanggotaan Pesantren)

| Level | Badge | Verifikasi |
|---|---|---|
| `basic` | Abu-abu | Belum terverifikasi |
| `silver` | Silver | Anggota biasa |
| `gold` | Kuning emas | Terverifikasi |
| `platinum` | Cyan/biru | Terverifikasi penuh + verified badge ✓ |

> Gold & Platinum mendapatkan **verified badge** (tanda centang biru) di profil publik

### 2.4 XP Level (Kru)
- Kru memiliki field `xp_level` (integer)
- Ditampilkan via `XPLevelBadge` di profil kru publik
- Bagian sistem gamifikasi (Manajemen Militansi — *coming soon*)

---

## 3. Aktor & Akses

| Aktor | Akses |
|---|---|
| **Admin Pusat** | Lihat, edit, import, export semua data |
| **Publik / Masyarakat** | Lihat direktori, profil pesantren, profil kru (read-only) |
| **Sistem (API)** | NIAM lookup untuk Event, Administrasi |

---

## 4. Data Model

### 4.1 Pesantren (`Profile`)

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `nama_pesantren` | string? | Nama pesantren |
| `nama_pengasuh` | string? | Nama pengasuh/kiai |
| `nip` | string? | Nomor Induk Pesantren (permanen) |
| `region_id` | UUID? | FK ke Regional |
| `region_name` | string? | Nama regional (join) |
| `city_name` | string? | Nama kota (join) |
| `status_account` | string | `active` / `pending` / `rejected` |
| `profile_level` | string | `basic` / `silver` / `gold` / `platinum` |
| `alamat_singkat` | string? | Alamat singkat |
| `nama_media` | string? | Nama unit media pesantren |
| `logo_url` | string? | URL logo pesantren |
| `social_links` | JSON? | `{ instagram, youtube, website }` |
| `no_wa_pendaftar` | string? | WhatsApp admin pendaftar |

### 4.2 Kru (`Crew`)

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `nama` | string | Nama lengkap kru |
| `niam` | string? | Nomor Induk Anggota Media (permanen) |
| `jabatan` | string? | Jabatan (Videografer, Editor, dll) |
| `xp_level` | number? | Level XP gamifikasi |
| `profile_id` | UUID | FK ke Pesantren (`profiles`) |
| `pesantren_name` | string? | Nama pesantren (join) |
| `region_id` | UUID? | FK ke Regional |
| `region_name` | string? | Nama regional (join) |

### 4.3 Status Akun Pesantren

| Status | Badge UI | Keterangan |
|---|---|---|
| `active` | Hijau / "Aktif" | Anggota aktif terdaftar |
| `pending` | Kuning / "Pending" | Mendaftar, belum diverifikasi |
| `rejected` | Merah / "Ditolak" | Ditolak admin |

---

## 5. Halaman CMS Admin — Master Data

**Route:** `/admin-pusat/master-data`  
**Komponen:** `AdminPusatMasterData.tsx`

### 5.1 Layout

```
Header: "Master Data"
Subtitle: "Database lengkap pesantren, media, dan kru MPJ Jawa Timur"

┌─ Filter Bar ────────────────────────┐
│ [Dropdown: Filter Regional]         │
│ [Search Input: Cari nama/NIP/NIAM]  │
│                            [×Clear] │
└─────────────────────────────────────┘

┌─ Tabs ──────────────┐
│ Pesantren | Media | Kru
└─────────────────────┘

[Table / Card Grid sesuai tab aktif]
```

### 5.2 Tab Pesantren

**Kolom Tabel (desktop):**

| Kolom | Keterangan |
|---|---|
| NIP | Format `XX.YY.ZZZ` (font mono) |
| Nama Pesantren | Nama utama |
| Regional | Badge regional |
| Status | Badge: Aktif / Pending / Ditolak |
| Level | Badge: Basic / Silver / Gold / Platinum |
| Aksi | 👁 Detail, ✏️ Edit |

**Mobile:** Card per item (nama, NIP, status badge, level badge, region badge)

**Aksi per item:**
- **Detail:** Dialog popup — NIP, Status, Nama Pesantren, Pengasuh, Alamat, Regional, Kota, Level
- **Edit:** Dialog form — Nama Pesantren, Nama Pengasuh, Alamat Singkat (NIP read-only + label "Permanen")
- **Hapus:** Tidak diizinkan dari Master Data (redirect ke Administrasi)

**Toolbar:**
- `[Export Excel]` — download `.xlsx` kolom: NIP, Nama Pesantren, Nama Pengasuh, Alamat, Regional, Kota, Status, Level
- `[Import Excel]` — buka ExcelImportDialog

### 5.3 Tab Media

Menampilkan daftar pengelola media (data kru yang memiliki jabatan terkait media).

**Kolom Tabel:**

| Kolom | Keterangan |
|---|---|
| NIAM | Format khusus (font mono) |
| Nama Pengelola | Nama kru |
| Jabatan | Jabatan di media |
| Pesantren | Nama pesantren asal |
| Regional | Regional |
| Aksi | ✏️ Edit, 🗑 Hapus |

**Edit Media Dialog:** Nama Pesantren, Nama Media, Nomor WhatsApp (NIP read-only)

**Toolbar:**
- `[Export Excel]` — kolom: NIAM, Nama Pengelola, Jabatan, Pesantren, Regional, XP Level
- `[Import Excel]`

### 5.4 Tab Kru

Menampilkan seluruh kru dari semua pesantren.

**Kolom Tabel:**

| Kolom | Keterangan |
|---|---|
| NIAM | Format khusus (font mono) |
| Nama Kru | Nama lengkap |
| Jabatan | Jabatan (contoh: Videografer) |
| Pesantren | Pesantren asal |
| Regional | Regional |
| Aksi | ✏️ Edit, 🗑 Hapus |

**Edit Kru Dialog:** Nama Lengkap, Jabatan (NIAM read-only + label "Permanen")

**Hapus Kru:** Dapat dihapus (DELETE ke API), dengan konfirmasi AlertDialog

**Toolbar:**
- `[Export Excel]` — kolom: NIAM, Nama Kru, Jabatan, Pesantren, Regional, XP Level
- `[Import Excel]`

---

## 6. Filter & Search Global

- **Filter Regional:** Dropdown semua regional (`[code] Nama Regional`)
- **Search:** Mencari di nama, NIP/NIAM, nama pengasuh, nama pesantren, jabatan
- Filter berlaku untuk ketiga tab sekaligus
- Tombol `×` untuk clear search

---

## 7. Excel Import System

**Komponen:** `ExcelImportDialog.tsx`  
**Library:** `xlsx` (SheetJS)

### 7.1 Flow Import

```
Admin klik [Import Excel]
    ↓
Dialog buka: "Import [Pesantren/Media/Kru]"
    ↓
Upload area (drag or click) → select .xlsx / .xls
    ↓
Parse file → validasi kolom wajib:
  - Pesantren: "NIP", "Nama Pesantren"
  - Media: "NIP", "Nama Pesantren"
  - Kru: "NIAM", "Nama Kru"
    ↓
Jika kolom kurang → error merah (parse error)
Jika OK → tampil preview tabel (5 baris pertama, 6 kolom pertama)
    ↓
Admin konfirmasi → [Import N Data]
    ↓
POST /api/admin/master-data/import → { type, rows }
    ↓
Response: { imported, skipped, errors }
    ↓
Tampil hasil:
  - ✅ "Import Selesai" — X berhasil · Y dilewati
  - Error list (jika ada)
```

### 7.2 Aturan Import

- **Upsert berdasarkan NIP/NIAM** — hanya data yang cocok yang diupdate
- Data baru (NIP/NIAM tidak ada) → di-skip (tidak create)
- Error per baris dicatat dan ditampilkan
- Tombol "Ganti file" untuk upload ulang

---

## 8. Global Search NIP/NIAM

**Komponen:** `GlobalSearchNIPNIAM.tsx` (di header Admin Pusat, only desktop `lg:block`)

**Format input:** Contoh: `25.07.001` (NIP) atau NIAM

**Flow:**
```
Input → Enter / klik [Cari]
    ↓
GET /api/admin/global-search?query=...
    ↓
Hasil: list {type, nomorId, nama, jabatan, status, lembagaInduk, region}
    ↓
Klik hasil → Detail Dialog
  - NIP atau NIAM (besar, font mono)
  - Nama Pesantren / Nama Personil
  - Jabatan (jika kru)
  - Lembaga Induk (jika kru)
  - Regional
  - Status badge
```

---

## 9. Halaman Publik — Direktori Pesantren

**Route:** `/direktori`  
**Komponen:** `PublicDirektori.tsx`

**Fitur:**
- Header MPJ branded (logo + judul)
- Search bar (nama pesantren / NIP) — sync ke URL params `?q=`
- Filter regional (dropdown) — sync ke URL params `?region=`
- Counter "Menampilkan X pesantren [di Regional Y]"
- Grid card 2 kolom (desktop) / 1 kolom (mobile):
  - Logo pesantren (avatar dengan fallback inisial)
  - Nama pesantren
  - NIP (font mono amber)
  - Badge regional
  - Badge profile level
  - → link ke `/pesantren/:nip`
- Loading skeleton saat fetch
- Empty state dengan tombol reset filter

**SEO:** Meta title/description/OG tags untuk halaman direktori

---

## 10. Halaman Publik — Profil Pesantren

**Route:** `/pesantren/:nip` (NIP diformat dengan titik: `25.07.001`)  
**Komponen:** `PublicPesantrenProfile.tsx`

**Sections:**

### Header
- Logo MPJ + judul "Media Pesantren Jawa Timur" + link ke Direktori

### Profile Card
- Logo pesantren (Avatar, 96×96) + verified badge jika Gold/Platinum
- Nama pesantren + VerifiedBadge (✓ ikon)
- Nama media (subtitle di bawah nama)
- Banner "ANGGOTA AKTIF MPJ JAWA TIMUR" (hijau)

### Info Grid (2×2)
| Cell | Konten |
|---|---|
| NIP | Nomor Induk Pesantren (font mono, amber) |
| Level Keanggotaan | ProfileLevelBadge |
| Wilayah | Nama regional |
| Pengasuh | Nama pengasuh |

### Social Links
- Instagram → `https://instagram.com/@handle` (gradient pink-purple pill)
- YouTube → link langsung (red pill)
- Website → link langsung (slate pill)
- Hanya tampil jika field terisi

### Daftar Kru Resmi
- Card list semua kru pesantren
- Per kru: avatar inisial, nama, jabatan, NIAM (format)
- Klik → `/pesantren/:nip/crew/:niamSuffix`

### Not Found State
- Pesan: "identitas ini tidak terdaftar atau belum diaktivasi"

**SEO:** Dynamic meta title/description/OG tags per pesantren

---

## 11. Halaman Publik — Profil Kru

**Route:** `/pesantren/:nip/crew/:niamSuffix`  
**Komponen:** `PublicCrewProfile.tsx`

**Sections:**

### ID Card Kru
- Avatar besar (112×112) + verified badge
- Nama kru (heading besar)
- Jabatan (subtitle)
- XPLevelBadge (jika xp_level terisi)
- Banner "PERSONEL TERVERIFIKASI" (hijau)

### Detail Kru
| Box | Konten |
|---|---|
| NIAM | Nomor Induk Anggota Media (font mono, besar, amber) |
| Jabatan | Jabatan di media (blue box) |
| Lembaga | Logo + nama pesantren + NIP (slate box) |
| Pernyataan Resmi | "[Nama] adalah kru media resmi dari [Pesantren] yang terdaftar dalam database MPJ Jawa Timur" |

### Back Link
- "← Lihat Profil Pesantren" (back ke `/pesantren/:nip`)

**SEO:** Dynamic meta title/description/OG per kru

---

## 12. API Endpoints

### Admin
| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/admin/master-data` | GET | Fetch semua profiles, crews, regions |
| `/api/admin/master-data/pesantren/:id` | PUT | Update data pesantren |
| `/api/admin/master-data/media/:id` | PUT | Update data media |
| `/api/admin/master-data/crew/:id` | PUT | Update data kru |
| `/api/admin/master-data/crew/:id` | DELETE | Hapus kru |
| `/api/admin/master-data/import` | POST | Bulk import dari Excel |
| `/api/admin/global-search?query=` | GET | Search NIP/NIAM lintas tabel |

### Publik
| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/public/directory` | GET | List semua pesantren aktif |
| `/api/public/regions` | GET | List semua regional |
| `/api/public/pesantren/:nip/profile` | GET | Profil pesantren + list kru |
| `/api/public/pesantren/:nip/crew/:niamSuffix` | GET | Profil kru |

### Shared (dipakai modul lain)
| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/members/lookup?niam=` | GET | Lookup NIAM untuk Event |

---

## 13. Aturan Bisnis

1. **NIP & NIAM tidak dapat diubah** setelah diterbitkan (read-only di semua form)
2. **Hapus pesantren** tidak diizinkan dari Master Data (hanya dari menu Administrasi — karena RLS Supabase)
3. **Hapus kru** diizinkan
4. **Import Excel** hanya update data yang sudah ada (match NIP/NIAM), tidak create baru
5. **Profil publik** hanya accessible jika `status_account = active`
6. **Verified badge** tampil jika `profile_level = gold` atau `platinum`
7. **Direktori publik** hanya menampilkan pesantren aktif
8. **Data terformat** — NIP: `XX.YY.ZZZ`, NIAM sesuai format internal

---

## 14. Komponen UI Utama

| Komponen | File | Fungsi |
|---|---|---|
| `AdminPusatMasterData` | `components/admin-pusat/AdminPusatMasterData.tsx` | CMS tabel 3-tab + CRUD |
| `ExcelImportDialog` | `components/admin-pusat/ExcelImportDialog.tsx` | Import bulk dari Excel |
| `GlobalSearchNIPNIAM` | `components/admin-pusat/GlobalSearchNIPNIAM.tsx` | Search NIP/NIAM di header |
| `PublicDirektori` | `pages/PublicDirektori.tsx` | Direktori publik pesantren |
| `PublicPesantrenProfile` | `pages/PublicPesantrenProfile.tsx` | Profil publik pesantren |
| `PublicCrewProfile` | `pages/PublicCrewProfile.tsx` | Profil publik kru |
| `ProfileLevelBadge` | `components/shared/LevelBadge.tsx` | Badge level keanggotaan |
| `XPLevelBadge` | `components/shared/LevelBadge.tsx` | Badge XP kru |
| `VerifiedBadge` | `components/shared/LevelBadge.tsx` | Centang biru verified |

---

## 15. Integrasi dengan Modul Lain

| Modul | Ketergantungan |
|---|---|
| **Event** | NIAM lookup untuk verifikasi peserta NIAM saat registrasi |
| **Administrasi** | Validasi NIP saat approval pendaftaran anggota baru |
| **Regional Dashboard** | Filter data berdasarkan `region_id` |
| **Militansi (Coming Soon)** | `xp_level` kru digunakan untuk leaderboard & gamifikasi |
| **MPJ Hub (Coming Soon)** | Data pesantren & kru untuk kolaborasi |

---

## 16. Checklist Fitur (Status)

| Fitur | Status |
|---|---|
| Tabel pesantren + filter regional + search | ✅ Done |
| Detail dialog pesantren | ✅ Done |
| Edit pesantren (nama, pengasuh, alamat) | ✅ Done (backend) |
| Tabel media + filter + search | ✅ Done |
| Edit media (nama, nama media, WA) | ✅ Done (backend) |
| Tabel kru + filter + search | ✅ Done |
| Edit kru (nama, jabatan) | ✅ Done (backend) |
| Hapus kru | ✅ Done (backend) |
| Export Excel (pesantren, media, kru) | ✅ Done |
| Import Excel (bulk update) | ✅ Done (backend) |
| Global search NIP/NIAM di header | ✅ Done |
| Direktori publik pesantren | ✅ Done (backend) |
| Profil publik pesantren + crew list | ✅ Done (backend) |
| Profil publik kru individual | ✅ Done (backend) |
| SEO meta tags semua halaman publik | ✅ Done |
| Verified badge Gold/Platinum | ✅ Done |
| XP Level badge kru | ✅ Done (UI) |
| Debug mode (mock data) | ✅ Done |
| Hapus pesantren | 🔲 Tidak diizinkan dari Master Data |
| Tambah pesantren baru dari CMS | 🔲 Melalui modul Administrasi |
| Tambah kru baru dari CMS | 🔲 Planned |
| Gamifikasi XP (Militansi) | 🔲 Coming Soon |
| MPJ Hub (kolaborasi) | 🔲 Coming Soon |
