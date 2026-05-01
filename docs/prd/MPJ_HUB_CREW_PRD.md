# PRD — Modul MPJ Hub & Crew Dashboard
**Versi:** 4.0 · **Tanggal:** 30 April 2026  
**Sumber:** Analisis source code `AdminPusatHub.tsx`, `CrewDashboard.tsx`, `CrewBerandaPage.tsx`, `CrewEIDCardPage.tsx`, `CrewEventPage.tsx`, `CrewSertifikatPage.tsx`, `CrewProfilPage.tsx`

---

## 1. Latar Belakang & Tujuan

Modul MPJ Hub & Crew Dashboard adalah **ekosistem digital untuk kru media pesantren** MPJ Jawa Timur yang terdiri dari dua bagian:

1. **MPJ Hub (Admin)** — Repositori file dan resource resmi MPJ yang dapat diunduh oleh regional dan kru
2. **Crew Dashboard (Kru)** — Aplikasi mobile-first untuk kru media: identitas digital, event, sertifikat, dan profil

Tujuan keseluruhan:
- Menyediakan satu pintu akses resource resmi MPJ (branding kit, template, SOP)
- Memberikan identitas digital (E-ID Card) yang bisa dibawa ke event
- Memudahkan kru memantau event, mendaftar, dan melihat tiket
- Mengelola koleksi sertifikat dan mengklaim sertifikat baru
- Membangun profil kru yang kaya (skill, tim, arsip)

---

## 2. Aktor & Akses

| Aktor | Akses |
|---|---|
| **Admin Pusat** | Upload file ke Hub (coming soon), lihat file Pusat & Regional |
| **Admin Regional** | Upload file regional ke Hub (coming soon) |
| **Kru Media** | Akses Crew Dashboard — event, sertifikat, E-ID Card, profil |
| **Sistem** | Auto-distribusi sertifikat saat event FINISHED |

---

## 3. MPJ HUB (Admin Pusat)

**Route:** `/admin-pusat/mpj-hub`  
**Komponen:** `AdminPusatHub.tsx`  
**Status CMS:** Preview/Read-only (Upload belum aktif)

### 3.1 Layout

```
Header: "MPJ-HUB"
Subtitle: "Pusat file dan resources MPJ"
[Upload File] — disabled + lock icon + toast "Coming Soon"

Info Banner (amber): "Fitur Upload sedang dalam pengembangan."

Tabs: [File Pusat] | [File Regional]
```

### 3.2 Tab File Pusat

File resmi yang diterbitkan oleh Admin Pusat untuk seluruh anggota.

**Contoh file (mock):**
| Nama File | Tipe | Tanggal |
|---|---|---|
| Panduan Branding MPJ 2025 | PDF | 10 Jan 2025 |
| Template Poster Event | PSD | 05 Jan 2025 |
| SOP Dokumentasi Kegiatan | PDF | 01 Jan 2025 |

**UI:** List card — icon file, nama, tipe + tanggal, tombol link/download

### 3.3 Tab File Regional

File yang diunggah oleh masing-masing regional (laporan, rekap, dokumentasi).

**Contoh file (mock):**
| Nama File | Tipe | Tanggal |
|---|---|---|
| Laporan Surabaya Q4 2024 | PDF | 28 Dec 2024 |
| Rekap Malang Raya | XLSX | 20 Dec 2024 |

**UI:** List card identik dengan File Pusat, warna aksen biru

### 3.4 Rencana Fitur Upload (Coming Soon)

- Admin Pusat upload file PDF/PSD/XLSX ke bucket storage
- Admin Regional upload laporan regional
- Kru dapat mengunduh semua file yang tersedia
- Kategorisasi: Branding Kit, Template, SOP, Laporan, Panduan
- Search & filter berdasarkan kategori dan tanggal

---

## 4. Crew Dashboard — Overview

**Route:** `/crew`  
**Komponen:** `CrewDashboard.tsx`  
**Desain:** Mobile-first, PWA-ready, bottom navigation

### 4.1 Bottom Navigation (6 Tab)

| Tab | Icon | Label | Status |
|---|---|---|---|
| `beranda` | Home | Beranda | ✅ Aktif |
| `leaderboard` | Trophy | Leaderboard | 🔲 Coming Soon |
| `hub` | Compass | MPJ HUB | 🔲 Coming Soon |
| `event` | Calendar | Event | ✅ UI Done |
| `eid` | IdCard | E-ID | ✅ Aktif |
| `profil` | User | Profil | ✅ Aktif |

> Tab Coming Soon ditandai **dot amber kecil** di icon. Klik tetap navigate tapi tampilkan `ComingSoonOverlay`.

### 4.2 Header (Non-Beranda)

Tampil hanya saat bukan di Beranda:
- Judul halaman (h1)
- Back button (khusus E-ID: kembali ke Profil)
- Bell icon + red dot (notifikasi)
- Logout button (merah)

### 4.3 Debug Mode

- Diakses via `location.state.isDebugMode = true`
- `location.state.debugCrew` menyediakan mock data kru
- Toggle button (debug only): "🏅 Gold" / "🔒 Basic" untuk test locked E-ID

---

## 5. Halaman Beranda (`CrewBerandaPage`)

Halaman utama dashboard. Tidak menampilkan header terpisah — semua di dalam konten.

### 5.1 Header Section (Gradient Primary, rounded-bottom-3xl)

```
┌────────────────────────────────────────────────────┐
│ [Avatar Kru]     Nama Kru              🔔 [Logout] │
│ [XPBadge]        Pesantren Asal                    │
│                  [Badge Jabatan]                    │
├─ NIAM Card (jika NIAM terisi) ─────────────────────│
│ 🪪  Nomor Induk Anggota Media                      │
│     AM.26.01.001.01  (font mono, besar)            │
├─ XP Progress Card ─────────────────────────────────│
│ ⚡ Militansi XP          [🥉 Khodim Baru (150 XP)] │
│ 150 XP                                   [🥉 icon] │
│ ████░░░░░░ (30%)                                   │
│ 350 XP lagi ke Silver                              │
└────────────────────────────────────────────────────┘
```

### 5.2 Quick Action — E-ID Card

Card clickable → navigate ke tab `eid`:
- Icon 🪪
- Judul: "Lihat E-ID Card"
- Subtitle: "Kartu identitas digital Anda"

### 5.3 Certificate Counter

Card amber:
- Icon 🏆
- Label: "Total Sertifikat"
- Nilai angka besar
- Badge "Coming Soon" (karena belum integrasi backend)

### 5.4 Info Terkini (News Feed)

ScrollArea horizontal list berita MPJ:
- Thumbnail (landscape)
- Judul berita (line-clamp-2)
- Tanggal
- Tombol "Lihat Semua"

---

## 6. Halaman E-ID Card (`CrewEIDCardPage`)

Kartu identitas digital resmi kru yang bisa ditunjukkan di event dan di-print.

### 6.1 Gate: Locked jika pesantren belum Gold

Jika `isGold = false` dan bukan debug mode:
- Tampil blur overlay di atas card dummy
- Lock icon + "Fitur Terkunci"
- Pesan: "Upgrade ke status Gold untuk mengakses E-Kartu Anggota"
- Tombol "Upgrade to Gold"

### 6.2 Dua Tab Kartu (jika isGold = true)

#### Tab 1: Kartu Virtual (Landscape 16:9)

Komponen: `VirtualMemberCard` — **tanpa foto & barcode**, untuk tampilan di layar.

**Konten tampak depan:**
- Logo MPJ + nama organisasi
- NIAM (font mono, prominent)
- Nama kru
- Jabatan
- Pesantren asal
- XP Level badge

**Konten tampak belakang (flip card):**
- Social media: Instagram, YouTube
- Alamat pesantren

**Catatan:** Card dapat di-flip dengan klik/tap (CSS 3D transform)

**Info Notice (amber):**  
"Kartu Virtual — Tanpa foto & barcode untuk tampilan aplikasi."

#### Tab 2: Pratinjau Fisik (Portrait)

Komponen: `PhysicalMemberCard` — **dengan foto & barcode**, untuk cetak di event.

**Konten:**
- Semua konten virtual PLUS:
- Foto profil kru (PNG/JPG)
- QR Code / Barcode identitas untuk scan absensi
- Format portrait (credit card ratio 85.6×53.98mm)

**Tombol Download:**
- [↓ Download Layout Cetak (PDF)] — proses via backend (UI ready)

**Info Card:**
> "Format kartu fisik (portrait) untuk keperluan cetak dan event. Dilengkapi dengan foto dan QR Code untuk proses absensi."

**Info Kartu:**
- Status Keanggotaan: Aktif
- Berlaku Hingga: 31 Desember [tahun berjalan]
- No. ID: NIAM

---

## 7. Halaman Event Kru (`CrewEventPage`)

Pusat informasi event dari sudut pandang kru — melihat, mendaftar, dan melacak keikutsertaan.

### 7.1 3-Tab Layout (sticky header)

```
Tabs: [Upcoming] | [Terdaftar] | [Riwayat]
```

#### Tab Upcoming — Event Mendatang

List card event yang tersedia untuk didaftar:

**Per card:**
- Gambar event (landscape full-width)
- Badge "+XX XP" (di pojok kanan atas)
- Judul event
- 📅 Tanggal + ⏰ Jam
- 📍 Lokasi
- 👥 Terdaftar/Quota
- [Daftar Sekarang] — tombol primary

#### Tab Terdaftar — Event Sudah Daftar

List event yang sudah diikuti tapi belum selesai:

**Per card:** Identik, tapi tombol:
- [🔲 Lihat Tiket] → buka dialog tiket QR

**Dialog Tiket:**
- Card gradient primary: judul event, tanggal, waktu
- QR Code (icon placeholder, real akan generate dari ticket_code)
- "Tunjukkan QR Code ini kepada panitia"
- Lokasi event

#### Tab Riwayat — Event Sudah Dihadiri

List event selesai:
- [Lihat Detail →] — navigasi ke detail event

### 7.2 Data Model Event (Crew View)

| Field | Keterangan |
|---|---|
| `id` | ID event |
| `title` | Judul event |
| `date` | Tanggal (string) |
| `time` | Waktu (WIB) |
| `location` | Nama lokasi |
| `image` | URL thumbnail |
| `quota` | Kapasitas total |
| `registered` | Sudah terdaftar |
| `xpReward` | XP yang didapat jika hadir |

---

## 8. Halaman Sertifikat Kru (`CrewSertifikatPage`)

Koleksi dan klaim sertifikat digital kru.

### 8.1 Bagian Klaim Sertifikat

```
Section: Klaim Sertifikat (gradient background)
🔑 [Input: Masukkan Token Sertifikat]  [Klaim]
Hint: "Token diberikan setelah menghadiri event. Coba: TEST123"
```

**Flow klaim:**
```
Input token → [Klaim] (loading 1 detik simulasi)
    ↓
Token valid (TEST123):
  → Sertifikat baru muncul di galeri
  → Toast: "Sertifikat Diklaim! Berhasil ditambahkan ke koleksi"
Token tidak valid:
  → Toast error: "Token Tidak Valid"
```

### 8.2 Galeri Sertifikat (2-column grid)

**Per card:**
- Thumbnail gambar sertifikat (aspect 4:3)
- Gradient overlay dari bawah (hitam transparan)
- Badge "+XX XP" (pojok kiri bawah)
- Icon 🏆 (pojok kanan atas)
- Judul event (line-clamp-2)
- Tanggal

**Klik card → Dialog Preview:**
- Gambar besar dengan overlay info
- Badge XP
- Judul sertifikat (tipe: Peserta/Workshop/Kehadiran)
- Nama event
- Tanggal terbit
- [↓ Download PDF]

### 8.3 Data Model Sertifikat

| Field | Keterangan |
|---|---|
| `id` | ID sertifikat |
| `title` | Tipe (Sertifikat Peserta/Workshop/Kehadiran) |
| `eventName` | Nama event |
| `date` | Tanggal diterbitkan |
| `xpEarned` | XP yang diperoleh |
| `thumbnail` | URL gambar preview |

---

## 9. Halaman Profil Kru (`CrewProfilPage`)

Manajemen data diri kru, skill, tim, dan arsip dokumen.

### 9.1 Header Profil

- Avatar kru (96×96, fallback inisial 2 huruf)
- Nama lengkap (h2)
- Badge jabatan
- NIAM card (jika ada): emerald, font mono besar, tracking-widest
- XPLevelBadge (medium, dengan angka XP)

### 9.2 Quick Access — E-ID Card

Card clickable (gradient primary/accent):
- Navigate ke tab `eid`
- Badge "BARU"

### 9.3 Bagian 1: Data Pribadi (Editable)

Form input:
- Nama Lengkap
- Nama Panggilan
- No. WhatsApp (💬)
- Pesantren Asal
- Alamat Asal (textarea)
- Prinsip Hidup / Motto (textarea)
- Ganti Password (→ button outline)

### 9.4 Bagian 2: Manajemen Keahlian (Skill)

- Daftar 12 skill tersedia:
  `Videography, Photography, Video Editing, Desain Grafis, Ilustrator, Social Media, Writing, Content Creator, Motion Graphics, Drone Pilot, Live Streaming, Audio Editing`
- Pilih maksimal **5 skill**
- Skill terpilih tampil sebagai badge (klik untuk hapus)
- Tombol "+ Tambah" → toggle skill picker
- Catatan: "Skill akan ditampilkan di E-ID Card"

### 9.5 Bagian 3: Tim Saya

Daftar rekan satu lembaga (pesantren) — **read-only**:
- Avatar, nama, jabatan per kru

### 9.6 Bagian 4: Arsip & Berkas Legal

- Upload Foto Profil (JPG/PNG, max 2MB) — Coming Soon
- Upload CV/Portofolio (PDF, max 5MB) — Coming Soon
- Daftar dokumen terunggah (nama file, tanggal, badge Aktif)

### 9.7 Simpan Perubahan

`[Simpan Perubahan]` → PUT ke API profil kru

---

## 10. Komponen Shared Terkait

| Komponen | File | Fungsi |
|---|---|---|
| `VirtualMemberCard` | `components/shared/MemberCard.tsx` | Kartu virtual landscape + flip |
| `PhysicalMemberCard` | `components/shared/MemberCard.tsx` | Kartu fisik portrait + download |
| `XPLevelBadge` | `components/shared/LevelBadge.tsx` | Badge level XP kru |
| `ComingSoonOverlay` | `components/shared/ComingSoonOverlay.tsx` | Overlay tab belum aktif |

---

## 11. API Endpoints (Rencana)

### MPJ Hub (Admin)
| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/admin/hub/files` | GET | List semua file (pusat & regional) |
| `/api/admin/hub/upload` | POST | Upload file baru |
| `/api/admin/hub/files/:id` | DELETE | Hapus file |

### Crew Dashboard
| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/crew/profile` | GET | Profil kru + XP + NIAM |
| `/api/crew/profile` | PUT | Update data pribadi, skill |
| `/api/crew/events/upcoming` | GET | List event mendatang |
| `/api/crew/events/registered` | GET | Event yang sudah didaftar |
| `/api/crew/events/history` | GET | Riwayat event hadir |
| `/api/crew/events/:id/register` | POST | Daftar event |
| `/api/crew/events/:id/ticket` | GET | Tiket QR event terdaftar |
| `/api/crew/certificates` | GET | Koleksi sertifikat |
| `/api/crew/certificates/claim` | POST | Klaim sertifikat via token |
| `/api/crew/certificates/:id/download` | GET | Download PDF sertifikat |
| `/api/crew/eid-card/download` | GET | Download E-ID Card PDF |
| `/api/crew/team` | GET | Daftar rekan satu lembaga |

---

## 12. Aturan Bisnis

1. **E-ID Card terkunci** jika `pesantren.profile_level < gold` (Basic/Silver tidak bisa akses)
2. **Token sertifikat** satu kali pakai — diklaim oleh satu kru
3. **Skill maksimal 5** — tidak bisa tambah lebih dari 5 sekaligus
4. **Kartu Virtual** tidak tampilkan foto & barcode (untuk preview di layar)
5. **Kartu Fisik** menyertakan foto + QR Code (untuk print & event)
6. **Coming Soon tabs** tetap bisa diklik tapi hanya tampil overlay teks
7. **Berlaku Hingga** kartu = 31 Desember tahun berjalan
8. **Tim Saya** adalah read-only — kru tidak bisa mengubah data rekan
9. **NIAM card** di Beranda hanya tampil jika field `niam` terisi (tidak null)
10. **Download PDF** E-ID Card diproses via backend (layout cetak fisik)

---

## 13. Checklist Fitur (Status)

### MPJ Hub Admin
| Fitur | Status |
|---|---|
| Preview daftar file (Pusat & Regional) | ✅ UI Done (dummy data) |
| Upload file oleh Admin Pusat | 🔲 Coming Soon |
| Upload file oleh Admin Regional | 🔲 Coming Soon |
| Download file oleh kru | 🔲 Planned |
| Kategorisasi file | 🔲 Planned |
| Search & filter file | 🔲 Planned |

### Crew Dashboard
| Fitur | Status |
|---|---|
| Bottom navigation 6-tab | ✅ Done |
| Beranda: XP progress card | ✅ UI Done |
| Beranda: NIAM card | ✅ UI Done |
| Beranda: News feed | ✅ UI Done (mock) |
| E-ID Card — Kartu Virtual (flip) | ✅ UI Done |
| E-ID Card — Pratinjau Fisik (portrait) | ✅ UI Done |
| E-ID Card — Gate Gold/Platinum | ✅ UI Done |
| E-ID Card — Download PDF | ✅ UI (backend pending) |
| Event Tab — Upcoming list | ✅ UI Done (mock) |
| Event Tab — Daftar event | ✅ UI (backend pending) |
| Event Tab — Tiket QR dialog | ✅ UI Done |
| Event Tab — Riwayat | ✅ UI Done (mock) |
| Sertifikat — Klaim via token | ✅ UI Done (mock) |
| Sertifikat — Galeri grid | ✅ UI Done (mock) |
| Sertifikat — Preview dialog | ✅ UI Done |
| Sertifikat — Download PDF | ✅ UI (backend pending) |
| Profil — Edit data pribadi | ✅ UI Done |
| Profil — Manajemen skill (max 5) | ✅ UI Done |
| Profil — Tim Saya (read-only) | ✅ UI Done (mock) |
| Profil — Upload foto profil | 🔲 Coming Soon |
| Profil — Upload CV/portofolio | 🔲 Coming Soon |
| Leaderboard tab | 🔲 Coming Soon |
| MPJ HUB tab (kru) | 🔲 Coming Soon |
| Notifikasi (bell icon) | 🔲 Planned |
| Backend API integration penuh | 🔲 Semua masih mock/UI |
