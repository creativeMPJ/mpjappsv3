# PRD — Modul Militansi MPJ (Sistem XP & Gamifikasi)
**Versi:** 4.0 · **Tanggal:** 30 April 2026  
**Sumber:** Analisis source code `AdminPusatMilitansi.tsx`, `CrewDashboard.tsx`, `CrewBerandaPage.tsx`, `LevelBadge.tsx`, `id-utils.ts`

---

## 1. Latar Belakang & Tujuan

Modul Militansi adalah **sistem gamifikasi dan engagement** untuk kru media pesantren MPJ Jawa Timur. Tujuannya:

1. **Mendorong partisipasi aktif** kru dalam kegiatan MPJ (event, konten, misi)
2. **Memberikan pengakuan digital** atas kontribusi kru melalui XP, level, dan sertifikat
3. **Membangun kompetisi sehat** antar kru melalui leaderboard regional/nasional
4. **Menghubungkan militansi** dengan profil keanggotaan yang terverifikasi

Modul ini terdiri dari dua sub-sistem:
- **XP Kru** — sistem poin pengalaman individual untuk kru media
- **Profile Level Pesantren** — level keanggotaan institusi berdasarkan kelengkapan profil

---

## 2. Sub-Sistem 1: XP Level Kru (Militansi)

### 2.1 Definisi XP

XP (Experience Points) adalah poin yang diperoleh kru media dari aktivitas nyata dalam ekosistem MPJ. XP bersifat kumulatif — tidak berkurang.

### 2.2 Level XP Kru

| Level | Nama | Range XP | Icon | Warna Badge |
|---|---|---|---|---|
| `bronze` | **Khodim Baru** | 0 – 499 XP | 🥉 | Gradient Orange |
| `silver` | **Santri Giat** | 500 – 1.999 XP | 🥈 | Gradient Slate |
| `gold` | **Pejuang** | 2.000 – 4.999 XP | 🥇 | Gradient Kuning-Amber |
| `platinum` | **Jawara** | 5.000+ XP | 💎 | Gradient Purple-Pink |

> Logika dihitung via `getXPLevel(xp)` dari `@/lib/id-utils.ts`

### 2.3 Formula XP (Preview — Konfigurasi Belum Aktif)

| Aksi | XP Diperoleh |
|---|---|
| Hadir Event Regional | +10 XP |
| Hadir Event Nasional | +25 XP |
| Upload Konten Dakwah | +5 XP |
| Menyelesaikan Misi Bulanan | +50 XP |

> Catatan: Formula ini masih preview. Konfigurasi XP per aksi akan dapat diubah Admin setelah fitur selesai dikembangkan.

### 2.4 Progress Bar XP

Ditampilkan di Beranda Crew Dashboard:
- **Current XP** (angka besar)
- **Target XP** (batas atas level saat ini)
- **Progress bar** = `(currentXP - minXP) / (targetXP - minXP) * 100%`
- **Label:** "X XP lagi ke [Level Berikutnya]"
- Jika sudah Jawara (Platinum): "🎉 Level Tertinggi Tercapai!"

---

## 3. Sub-Sistem 2: Profile Level Pesantren

### 3.1 Definisi

Profile Level adalah **status keanggotaan institusi pesantren** berdasarkan kelengkapan data profil di sistem MPJ. Berbeda dengan XP Kru yang bersifat aktif/earned, Profile Level bersifat **otomatis** — dihitung berdasarkan field yang terisi.

### 3.2 Level Pesantren

| Level | Nama | Kondisi | Icon | Verified Badge |
|---|---|---|---|---|
| `basic` | **Basic** | Akun belum aktif (`status_account ≠ active`) | 🏅 | ❌ |
| `silver` | **Silver** | Akun aktif (minimal) | 🥈 | ❌ |
| `gold` | **Gold** | Sejarah + Visi/Misi + Logo terisi | 🥇 | ❌ |
| `platinum` | **Platinum** | Semua field ERD lengkap | 💎 | ✅ Centang Biru |

### 3.3 Field Penentu Level

#### Gold (minimal harus terisi semua):
- `sejarah` (teks sejarah pesantren)
- `visi_misi` (teks visi & misi)
- `logo_url` (URL logo pesantren)

#### Platinum (semua harus terisi):
- Semua field Gold PLUS:
- `nama_pesantren`
- `nama_pengasuh`
- `alamat_singkat`
- `jumlah_santri`
- `foto_pengasuh_url`
- `latitude` & `longitude` (koordinat GPS)

> Logika dihitung via `calculateProfileLevel(profile)` dari `@/lib/id-utils.ts`

### 3.4 Hubungan Level dengan Fitur

| Level | Hak Akses Tambahan |
|---|---|
| Basic | Akun terdaftar, belum bisa akses penuh |
| Silver | Akses dashboard kru, bisa daftar event |
| Gold | E-ID Card aktif (isGold = true), tampil di direktori publik |
| Platinum | Verified badge ✓ biru di profil publik & direktori |

---

## 4. Aktor & Akses

| Aktor | Akses |
|---|---|
| **Admin Pusat** | Lihat formula XP, konfigurasi (coming soon), lihat level pesantren |
| **Kru** | Lihat XP pribadi, progress bar, level badge, E-ID Card |
| **Publik** | Lihat XP Level badge di profil kru publik |
| **Sistem** | Auto-calculate profile level saat data diupdate |

---

## 5. Crew Dashboard — Tampilan Militansi

**Route:** `/crew` (mobile-first, bottom navigation)  
**Komponen utama:** `CrewDashboard.tsx`

### 5.1 Bottom Navigation (6 Tab)

| Tab | Label | Status |
|---|---|---|
| Beranda | Home | ✅ Aktif |
| Leaderboard | Trophy | 🔲 Coming Soon |
| MPJ HUB | Compass | 🔲 Coming Soon |
| Event | Calendar | 🔲 Coming Soon |
| E-ID | IdCard | ✅ Aktif |
| Profil | User | ✅ Aktif |

> Tab Coming Soon ditandai dengan dot amber kecil di icon-nya

### 5.2 Halaman Beranda (`CrewBerandaPage`)

**Header (gradient primary, rounded-bottom-3xl):**

```
┌─ Avatar + XPLevelBadge overlay ────────────────────────┐
│ [Foto Kru]       Nama Kru                  🔔 [Logout] │
│ [🥉]             Pesantren Asal                        │
│                  [Badge: Jabatan]                       │
├─ NIAM Card (jika NIAM ada) ──────────────────────────  │
│ 🪪 Nomor Induk Anggota Media: AM2601001-01             │
├─ XP Progress Card ─────────────────────────────────────│
│ ⚡ Militansi XP              [🥉 Khodim Baru (150 XP)] │
│ 150 XP                                    [🥉]         │
│ ████░░░░░░ (30%)                                       │
│ 350 XP lagi ke Silver                                  │
└────────────────────────────────────────────────────────┘
```

**Quick Action Card:**
- [🪪 Lihat E-ID Card] → navigate ke tab E-ID

**Certificate Counter Card:**
- Total Sertifikat: X — badge "Coming Soon"

**Info Terkini (News Feed):**
- Scroll list berita/pengumuman MPJ (thumbnail + judul + tanggal)

### 5.3 Halaman E-ID Card (`CrewEIDCardPage`)

Digital identity card resmi kru yang bisa di-screenshot/share.

**Kondisi:** Hanya bisa diakses penuh jika `isGold = true` (pesantren level Gold+)

**Konten:**
- Logo MPJ + branding "Media Pesantren Jawa Timur"
- Foto profil kru (avatar)
- Nama lengkap
- NIAM (font mono, besar)
- Jabatan
- XPLevelBadge
- Nama & NIP pesantren asal
- QR Code atau barcode identitas
- Watermark/nomor sertifikat

### 5.4 Halaman Profil (`CrewProfilPage`)

Data diri kru yang bisa diedit:
- Foto profil
- Nama panggilan
- Jabatan
- Pesantren asal
- Alamat asal
- WhatsApp
- Prinsip hidup
- Skill/keahlian (array tag)
- Navigate ke E-ID Card

---

## 6. CMS Admin Pusat — Manajemen Militansi

**Route:** `/admin-pusat/manajemen-militansi` (di sidebar Admin Pusat, marked "Coming Soon")  
**Komponen:** `AdminPusatMilitansi.tsx`

### 6.1 Tampilan Saat Ini (Status: Preview Only)

**Header:**
- Judul "Manajemen Militansi" + Subtitle "Kelola sistem XP dan gamifikasi"
- Tombol [Edit XP Config] — disabled + lock icon + toast "Coming Soon"

**Info Banner (amber):**
> "Konfigurasi XP sedang dalam pengembangan. Saat ini Anda hanya dapat melihat formula XP."

**Formula XP Preview (2-col grid):**
- Card per aksi: icon, nama aksi, reward "+XX XP"
- 4 aksi terdaftar: Event Regional, Event Nasional, Upload Konten, Misi Bulanan

**Level Thresholds Preview:**

| Level | Range |
|---|---|
| Basic | 0 – 99 XP |
| Silver | 100 – 499 XP |
| Gold | 500 – 999 XP |
| Platinum | 1000+ XP |

> ⚠️ Catatan: Range di CMS preview ini (0-99, 100-499, dst) **berbeda** dengan yang diimplementasikan di `id-utils.ts` (0-499 Bronze, 500-1999 Silver, 2000-4999 Gold, 5000+ Platinum). Range di `id-utils.ts` yang aktif digunakan.

---

## 7. Leaderboard (Planned)

**Route:** Tab "Leaderboard" di Crew Dashboard (Coming Soon)  
**Deskripsi di UI:** "Papan peringkat anggota berdasarkan XP Militansi akan segera hadir."

**Rencana fitur:**
- Ranking kru berdasarkan XP tertinggi
- Filter: per regional / nasional / pesantren
- Podium top-3 (tampilan khusus)
- Rank badge per kru
- Periode: bulanan / sepanjang masa

---

## 8. MPJ HUB (Planned)

**Route:** Tab "MPJ HUB" di Crew Dashboard (Coming Soon)  
**Deskripsi di UI:** "Pusat koneksi dan kolaborasi antar anggota MPJ se-Jawa Timur."

---

## 9. Event Integration (Planned untuk Kru)

**Route:** Tab "Event" di Crew Dashboard (Coming Soon)  
**Deskripsi di UI:** "Jadwal event, pendaftaran kegiatan, dan riwayat partisipasi."

**Rencana:**
- List event yang bisa didaftar kru
- Riwayat keikutsertaan event
- XP otomatis credited setelah hadir (check-in via QR)

---

## 10. Sertifikat Digital (Partial Coming Soon)

**Ditampilkan di Beranda:** Counter "Total Sertifikat" — badge "Coming Soon"

**Rencana:**
- Sertifikat diterima otomatis saat event status `FINISHED`
- PDF via WhatsApp (sudah dirancang di modul Event)
- Ditampilkan di profil kru sebagai portofolio
- Bisa di-share / di-download

---

## 11. Komponen UI

| Komponen | File | Fungsi |
|---|---|---|
| `AdminPusatMilitansi` | `components/admin-pusat/AdminPusatMilitansi.tsx` | CMS preview formula XP + level |
| `CrewDashboard` | `pages/CrewDashboard.tsx` | Shell dashboard kru + bottom nav |
| `CrewBerandaPage` | `components/crew-dashboard/CrewBerandaPage.tsx` | Beranda: XP card, NIAM, news |
| `CrewEIDCardPage` | `components/crew-dashboard/CrewEIDCardPage.tsx` | E-ID Card digital |
| `CrewProfilPage` | `components/crew-dashboard/CrewProfilPage.tsx` | Profil & edit data kru |
| `XPLevelBadge` | `components/shared/LevelBadge.tsx` | Badge XP level dengan gradient |
| `ProfileLevelBadge` | `components/shared/LevelBadge.tsx` | Badge profile level pesantren |
| `VerifiedBadge` | `components/shared/LevelBadge.tsx` | Centang biru Platinum |
| `getXPLevel()` | `lib/id-utils.ts` | Fungsi hitung level dari XP |
| `calculateProfileLevel()` | `lib/id-utils.ts` | Fungsi hitung level profil pesantren |

---

## 12. Integrasi dengan Modul Lain

| Modul | Hubungan Militansi |
|---|---|
| **Event** | Hadir event → +XP (otomatis saat ATTENDED); sertifikat dikirim saat FINISHED |
| **Master Data** | `xp_level` disimpan di tabel `crews`; `profile_level` di tabel `profiles` |
| **Direktori Publik** | XPLevelBadge tampil di profil kru publik |
| **Administrasi** | Level Gold/Platinum menentukan hak fitur |

---

## 13. Data Model Terkait

### Kru (field militansi)
```
crews.xp_level        → integer (total XP kumulatif)
```

### Pesantren/Profile (field level)
```
profiles.profile_level  → 'basic' | 'silver' | 'gold' | 'platinum'
profiles.sejarah        → text (penentu Gold)
profiles.visi_misi      → text (penentu Gold)
profiles.logo_url       → text (penentu Gold)
profiles.jumlah_santri  → integer (penentu Platinum)
profiles.foto_pengasuh_url → text (penentu Platinum)
profiles.latitude       → float (penentu Platinum)
profiles.longitude      → float (penentu Platinum)
```

---

## 14. Checklist Fitur (Status)

| Fitur | Status |
|---|---|
| XP Level system (4 level kru) | ✅ Done (logika `id-utils.ts`) |
| XPLevelBadge UI komponen | ✅ Done |
| Profile Level system pesantren (4 level) | ✅ Done |
| ProfileLevelBadge UI komponen | ✅ Done |
| VerifiedBadge Platinum | ✅ Done |
| calculateProfileLevel() otomatis | ✅ Done |
| XP Progress bar di Crew Beranda | ✅ Done (UI) |
| NIAM card di Crew Beranda | ✅ Done |
| E-ID Card digital | ✅ Done (UI) |
| Crew profil page | ✅ Done (UI) |
| CMS: formula XP preview | ✅ Done (read-only) |
| CMS: level thresholds preview | ✅ Done (read-only) |
| Debug mode (mock crew data) | ✅ Done |
| Leaderboard kru | 🔲 Coming Soon |
| MPJ HUB | 🔲 Coming Soon |
| Event tab di Crew Dashboard | 🔲 Coming Soon |
| Sertifikat counter (tampil saja) | ✅ UI Done |
| Sertifikat full (list, download) | 🔲 Coming Soon |
| CMS: edit XP config | 🔲 Coming Soon |
| XP otomatis setelah event check-in | 🔲 Planned (butuh backend) |
| Misi bulanan sistem | 🔲 Planned |
| Upload konten dakwah → XP | 🔲 Planned |
| Notifikasi naik level | 🔲 Planned |
