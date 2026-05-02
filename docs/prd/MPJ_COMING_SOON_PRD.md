# PRD — Spesifikasi Lengkap Fitur "Coming Soon" MPJ
**Versi:** 4.0 · **Tanggal:** 30 April 2026

---

## MODUL 1: LEADERBOARD MILITANSI

**Route (Crew Dashboard):** Tab "Leaderboard" (`/crew` → tab leaderboard)  
**Route (Admin):** `/admin-pusat/militansi` → sub-tab Leaderboard

### 1.1 Tampilan Crew (Mobile)

```
Header: "🏆 Leaderboard Militansi"
Filter: [Bulan Ini ▼] [Regional ▼]

── PODIUM TOP 3 ──────────────────
     🥈 #2           🥇 #1        🥉 #3
   Siti A.        Ahmad F.       Rizki M.
   850 XP         1.240 XP       720 XP
  Santri Giat     Pejuang      Santri Giat

── RANKING 4–50 ──────────────────
#4  Nurul H.   PP Al-Hikmah    680 XP  [🥈]
#5  Farid M.   PP Darul Ulum   650 XP  [🥈]
...

── POSISI SAYA (sticky bottom) ───
#12 Ahmad Fauzi · PP Nurul Huda · 150 XP [🥉]
```

### 1.2 Filter Leaderboard

| Filter | Opsi |
|---|---|
| Periode | Bulan Ini / Kuartal Ini / Tahun Ini / Sepanjang Masa |
| Scope | Semua Regional / [Nama Regional] / Pesantren Saya |

### 1.3 Data Model

```typescript
interface LeaderboardEntry {
  rank: number;
  crew_id: string;
  nama: string;
  niam: string;
  jabatan: string;
  pesantren_name: string;
  region_name: string;
  xp_total: number;
  xp_level: XPLevel; // 'bronze'|'silver'|'gold'|'platinum'
  xp_this_period: number;
}
```

### 1.4 API Endpoint

```
GET /api/crew/leaderboard?period=monthly&region_id=&limit=50
Response: { entries: LeaderboardEntry[], my_rank: LeaderboardEntry }
```

### 1.5 Aturan Bisnis

- Hanya kru dari pesantren `status_account = active` yang masuk ranking
- Skor dihitung dari `crews.xp_level` (kumulatif)
- Periode "Bulan Ini" dihitung dari XP yang ditambahkan bulan berjalan (butuh tabel `xp_transactions`)
- Posisi kru sendiri selalu tampil di sticky bottom (meski di luar top-50)
- Refresh otomatis setiap 5 menit

---

## MODUL 2: MPJ HUB — FILE REPOSITORY

### 2.1 CMS Admin (Upload)

**Tab File Pusat — Form Upload:**

```
Dialog: Upload File Baru
  [Nama File*]
  [Kategori*: Branding Kit / Template / SOP / Panduan / Lainnya]
  [Tipe: PDF / PSD / XLSX / ZIP]
  [Drop area: drag file atau klik]
  [Deskripsi singkat]
  [Akses: Semua Regional / Regional Tertentu]
  [Upload]
```

**Tab File Regional — Form Upload (Admin Regional):**

```
Dialog: Upload Laporan/Dokumen Regional
  [Nama File*]
  [Periode: Jan 2025 / Feb 2025 / ...]
  [Tipe: PDF / XLSX]
  [Drop area]
  [Upload]
```

### 2.2 Halaman Hub Kru (Tab MPJ HUB)

```
Header: "📁 MPJ HUB"
Subtitle: "Resource & file resmi MPJ Jawa Timur"

[Search: Cari nama file...]
[Filter Kategori: Semua | Branding | Template | SOP | Panduan]

── File Pusat ─────────────────────
📄 Panduan Branding MPJ 2025     [PDF]  [↓ Unduh]
🎨 Template Poster Event         [PSD]  [↓ Unduh]
📋 SOP Dokumentasi Kegiatan      [PDF]  [↓ Unduh]

── File Regional ──────────────────
📊 Laporan Surabaya Q4 2024     [XLSX] [↓ Unduh]
```

### 2.3 Data Model

```typescript
interface HubFile {
  id: string;
  nama: string;
  kategori: 'branding' | 'template' | 'sop' | 'panduan' | 'laporan' | 'lainnya';
  tipe: 'PDF' | 'PSD' | 'XLSX' | 'ZIP';
  file_url: string;        // URL Supabase Storage
  file_size_kb: number;
  deskripsi: string | null;
  scope: 'all' | 'regional';
  region_id: string | null;
  uploaded_by: string;     // user_id
  created_at: string;
  download_count: number;
}
```

### 2.4 API Endpoints

```
GET    /api/hub/files?kategori=&scope=
POST   /api/admin/hub/upload         (multipart/form-data)
DELETE /api/admin/hub/files/:id
GET    /api/hub/files/:id/download   (redirect ke signed URL)
```

### 2.5 Aturan Bisnis

- Upload file max 50MB
- Format: PDF, PSD, XLSX, ZIP, PNG
- File disimpan di Supabase Storage bucket `mpj-hub`
- Admin Pusat: bisa upload ke File Pusat dan File Regional mana pun
- Admin Regional: hanya bisa upload ke file Regional sendiri
- Download count di-increment setiap unduh

---

## MODUL 3: NOTIFIKASI

### 3.1 Bell Notifikasi (Crew Dashboard)

**Sumber notifikasi:**

| Trigger | Pesan |
|---|---|
| Naik XP Level | "🎉 Selamat! Kamu naik ke level [Pejuang]!" |
| Event baru tersedia | "📅 Event baru: [Nama Event] — Daftar sekarang!" |
| Sertifikat diterbitkan | "🏆 Sertifikat [Event] sudah bisa diunduh!" |
| Tiket dikonfirmasi | "✅ Pendaftaran [Event] berhasil dikonfirmasi" |
| Token sertifikat | "🎫 Token sertifikat baru tersedia: [TOKEN]" |
| File baru di Hub | "📁 File baru di MPJ HUB: [Nama File]" |

**UI Notifikasi Dropdown:**

```
🔔 (badge merah = jumlah unread)

Dropdown:
┌─ Notifikasi (3 baru) ─────────────────┐
│ ● 🎉 Naik level ke Santri Giat!        │
│   2 menit lalu                         │
│ ● 📅 Kopdar Akbar — Daftar sekarang    │
│   1 jam lalu                           │
│ ─ ─ ─ ─ ─ ─ (read) ─ ─ ─ ─ ─ ─       │
│   🏆 Sertifikat Training tersedia      │
│   Kemarin                              │
│ [Tandai semua sudah dibaca]            │
└────────────────────────────────────────┘
```

### 3.2 Notifikasi Naik Level XP

Trigger: saat `crews.xp_level` melewati threshold:
- 0→500: "Selamat! Kamu naik ke **Santri Giat** 🥈"
- 500→2000: "Selamat! Kamu naik ke **Pejuang** 🥇"
- 2000→5000: "Selamat! Kamu naik ke **Jawara** 💎"

Dikirim via:
1. Push notification (in-app bell)
2. WhatsApp (opsional, jika nomor WA terisi di profil)

### 3.3 Data Model

```typescript
interface Notification {
  id: string;
  crew_id: string;
  type: 'xp_level_up' | 'new_event' | 'certificate' | 'ticket_confirmed' | 'hub_file';
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  action_url: string | null;  // deeplink ke halaman terkait
}
```

### 3.4 API Endpoints

```
GET  /api/crew/notifications?limit=20&offset=0
POST /api/crew/notifications/mark-read        { ids: string[] }
POST /api/crew/notifications/mark-all-read
```

---

## MODUL 4: XP OTOMATIS & SISTEM TRANSAKSI

### 4.1 Tabel XP Transactions (Database)

```typescript
interface XPTransaction {
  id: string;
  crew_id: string;
  amount: number;          // positif = earned
  source: XPSource;
  source_id: string | null; // event_id / content_id / mission_id
  notes: string | null;
  created_at: string;
}

type XPSource = 
  | 'event_regional'       // +10 XP
  | 'event_nasional'       // +25 XP
  | 'konten_dakwah'        // +5 XP per konten
  | 'misi_bulanan'         // +50 XP
  | 'admin_manual';        // manual oleh Admin Pusat
```

### 4.2 XP Otomatis Setelah Event Check-in

**Trigger:** Saat Admin scan QR kru di event (`status → ATTENDED`)

```
QR Scan berhasil → Ticket.status = ATTENDED
    ↓
Tentukan XP berdasarkan event.tipe:
  - event.scope = 'regional' → +10 XP
  - event.scope = 'nasional' → +25 XP
    ↓
INSERT xp_transactions (crew_id, amount, source='event_regional', source_id=event_id)
    ↓
UPDATE crews SET xp_level = xp_level + amount
    ↓
Cek threshold naik level → kirim notifikasi jika naik
    ↓
Toast Admin: "✅ Check-in berhasil · +10 XP untuk [Nama Kru]"
```

### 4.3 Upload Konten Dakwah → XP

**Tab baru di Crew Dashboard:**

```
Route: Tab "Konten" (Crew Dashboard, Icon: Upload)

Form Submit Konten:
  [URL Instagram / YouTube / TikTok*]
  [Jenis: Reels / Video / Post / Story]
  [Caption singkat konten]
  [Submit Konten]

Status review:
  ● Pending (Abu-abu) — menunggu verifikasi admin
  ● Disetujui (Hijau) — +5 XP credited
  ● Ditolak (Merah) — alasan penolakan
```

**CMS Admin — Verifikasi Konten:**

```
Tab "Konten Dakwah" di Admin Pusat:
  List pending konten (URL, nama kru, pesantren, tanggal)
  [✅ Setujui +5 XP] [❌ Tolak]
  Filter: Pending / Disetujui / Ditolak
```

**Data Model:**

```typescript
interface ContentSubmission {
  id: string;
  crew_id: string;
  url: string;
  jenis: 'reels' | 'video' | 'post' | 'story';
  caption: string | null;
  status: 'pending' | 'approved' | 'rejected';
  xp_awarded: number;       // 5 jika approved, 0 jika rejected
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}
```

**API:**

```
POST /api/crew/content/submit
GET  /api/crew/content/my-submissions
GET  /api/admin/content/pending
POST /api/admin/content/:id/approve
POST /api/admin/content/:id/reject   { reason: string }
```

---

## MODUL 5: MISI BULANAN

### 5.1 Konsep

Setiap bulan Admin Pusat menerbitkan **3–5 misi** yang dapat diselesaikan kru untuk mendapatkan XP ekstra (+50 XP per misi).

### 5.2 Tampilan Kru (Tab "Misi")

```
Header: "🎯 Misi Bulan Ini — April 2025"
Sub: "Selesaikan misi untuk mendapatkan XP tambahan!"

── Misi Aktif ──────────────────────────
✅ Hadir 1 event bulan ini       +50 XP  [Selesai]
⏳ Upload 3 konten dakwah        +50 XP  [1/3]
⏳ Lengkapi profil 100%          +50 XP  [80%]
🔒 Ajak 1 pesantren baru daftar  +50 XP  [Terkunci]

── Selesai Bulan Lalu ──────────────────
✅ Hadir event regional           +50 XP
✅ Upload 3 konten                +50 XP
Total bulan lalu: +100 XP
```

### 5.3 CMS Admin — Buat Misi Bulanan

```
Tab "Misi Bulanan" di Admin Pusat:

[+ Buat Misi Baru]
  Form:
    Judul misi*
    Deskripsi
    XP reward* (default: 50)
    Tipe verifikasi: Otomatis / Manual
    Target: Semua kru / Regional tertentu
    Aktif untuk bulan: [Bulan Tahun]
    [Simpan]

List misi bulan ini:
  | Judul | XP | Selesai | Aksi |
```

### 5.4 Data Model

```typescript
interface Mission {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  verification_type: 'auto' | 'manual';
  target: 'all' | 'regional';
  region_id: string | null;
  period_month: number;
  period_year: number;
  is_active: boolean;
}

interface MissionProgress {
  id: string;
  crew_id: string;
  mission_id: string;
  status: 'locked' | 'in_progress' | 'completed';
  progress_current: number;
  progress_target: number;
  completed_at: string | null;
}
```

---

## MODUL 6: EDIT XP CONFIG (CMS ADMIN)

**Route:** `/admin-pusat/militansi` → tombol [Edit XP Config] (sekarang disabled)

### 6.1 Form Konfigurasi XP

```
Dialog: Konfigurasi Formula XP

┌─ Aksi & Reward ──────────────────────┐
│ Hadir Event Regional    [10] XP      │
│ Hadir Event Nasional    [25] XP      │
│ Upload Konten Dakwah    [5]  XP      │
│ Selesaikan Misi Bulanan [50] XP      │
│ [+ Tambah Aksi Baru]                 │
└──────────────────────────────────────┘

┌─ Level Thresholds ───────────────────┐
│ Bronze (Khodim Baru)  [0]   – [499] │
│ Silver (Santri Giat)  [500] – [1999]│
│ Gold   (Pejuang)      [2000]– [4999]│
│ Platinum (Jawara)     [5000]– ∞     │
│ (Threshold otomatis dihitung)        │
└──────────────────────────────────────┘

[Simpan Konfigurasi]
```

### 6.2 Data Model

```typescript
interface XPConfig {
  id: string;
  action_key: string;   // 'event_regional', 'event_nasional', dll
  action_label: string;
  xp_amount: number;
  is_active: boolean;
  updated_at: string;
}

interface LevelThreshold {
  level: XPLevel;
  min_xp: number;
}
```

### 6.3 API

```
GET  /api/admin/xp-config
PUT  /api/admin/xp-config          { configs: XPConfig[] }
GET  /api/admin/xp-config/history  (audit log perubahan)
```

---

## MODUL 7: SERTIFIKAT — BACKEND REAL

### 7.1 Token Sertifikat Sistem

**Sumber token:** Digenerate otomatis saat event `status = FINISHED` & peserta `status = ATTENDED`

**Flow lengkap:**

```
Event FINISHED → Admin trigger "Terbitkan Sertifikat"
    ↓
Backend generate unique token per peserta yang ATTENDED
    ↓
INSERT certificates (crew_id, event_id, token, xp_earned)
    ↓
Kirim WhatsApp ke kru:
  "🏆 Sertifikat [Event] siap! Token: XXXX123
   Klaim di MPJ Apps: mpjapps.com/crew"
    ↓
Kru buka tab Sertifikat → input token → klaim
    ↓
Backend: validasi token, tandai used=true
    ↓
Sertifikat muncul di galeri kru
    ↓
Kru download PDF → backend generate PDF via server
```

### 7.2 Generate PDF Sertifikat

- Template: nama event, nama kru, NIAM, tanggal, XP earned, logo MPJ
- Engine: backend (Node.js puppeteer atau TCPDF)
- Disimpan di Supabase Storage: `certificates/[event_id]/[niam].pdf`

### 7.3 Data Model

```typescript
interface Certificate {
  id: string;
  crew_id: string;
  event_id: string;
  event_name: string;
  token: string;           // unique, satu kali pakai
  token_used: boolean;
  xp_earned: number;
  pdf_url: string | null;  // URL setelah di-generate
  claimed_at: string | null;
  issued_at: string;
}
```

### 7.4 API

```
POST /api/crew/certificates/claim  { token: string }
GET  /api/crew/certificates
GET  /api/crew/certificates/:id/download
POST /api/admin/events/:id/issue-certificates  (trigger penerbitan)
```

---

## MODUL 8: UPLOAD FOTO & CV PROFIL

### 8.1 Upload Foto Profil

**Flow:**

```
Klik "Update Foto Profil" di halaman Profil
    ↓
File picker: JPG/PNG, max 2MB
    ↓
Preview gambar sebelum upload
    ↓
[Konfirmasi Upload]
    ↓
POST /api/crew/profile/photo (multipart)
    ↓
Backend compress & resize ke 400×400px
    ↓
Simpan di Supabase Storage: avatars/[crew_id].jpg
    ↓
UPDATE crews SET photo_url = [url]
    ↓
Avatar di Beranda & E-ID Card langsung update
```

### 8.2 Upload CV/Portofolio

```
Klik "Upload CV / Portofolio"
    ↓
File picker: PDF, max 5MB
    ↓
POST /api/crew/profile/cv (multipart)
    ↓
Simpan di Supabase Storage: documents/[crew_id]/cv.pdf
    ↓
INSERT crew_documents (crew_id, type='cv', file_url, uploaded_at)
    ↓
Tampil di list "Dokumen Terunggah" dengan status Aktif
```

### 8.3 Data Model

```typescript
interface CrewDocument {
  id: string;
  crew_id: string;
  type: 'cv' | 'portfolio' | 'sk' | 'other';
  file_name: string;
  file_url: string;
  file_size_kb: number;
  status: 'active' | 'archived';
  uploaded_at: string;
}
```

### 8.4 API

```
POST   /api/crew/profile/photo         multipart
POST   /api/crew/profile/cv            multipart
GET    /api/crew/profile/documents
DELETE /api/crew/profile/documents/:id
```

---

## MODUL 9: NOTIFIKASI WHATSAPP (EVENT)

> Sudah dirancang di PRD Event. Spesifikasi lengkap di sini.

### 9.1 Trigger & Pesan

| Trigger | Penerima | Pesan WhatsApp |
|---|---|---|
| Registrasi berhasil (UMUM) | Peserta | "✅ Registrasi [Event] berhasil! No. tiket: [TICKET_CODE]. Tunjukkan QR saat check-in." |
| Registrasi NIAM terverifikasi | Kru peserta | Sama + NIAM terformat |
| Pembayaran diverifikasi | Peserta | "💳 Pembayaran [Event] dikonfirmasi! Tiket Anda aktif." |
| Pembayaran ditolak | Peserta | "❌ Pembayaran ditolak. Alasan: [ALASAN]. Upload ulang bukti." |
| Sertifikat diterbitkan | Peserta hadir | "🏆 Sertifikat [Event] siap! Token: [TOKEN]. Klaim di MPJ Apps." |
| H-1 Event | Peserta terdaftar | "⏰ Pengingat: [Event] besok jam [JAM] di [LOKASI]. Sampai jumpa!" |
| Naik XP Level | Kru | "🎉 Selamat [NAMA]! Kamu naik ke level [LEVEL] di MPJ Apps!" |

### 9.2 Integrasi WhatsApp API

- Provider: **Fonnte** atau **WA Cloud API** (Meta)
- Template pesan disimpan di database (`whatsapp_templates`)
- Retry 3x jika gagal
- Log setiap pengiriman di tabel `whatsapp_logs`

### 9.3 Data Model

```typescript
interface WhatsappLog {
  id: string;
  recipient_phone: string;
  template_key: string;
  payload: Record<string, string>;
  status: 'sent' | 'failed' | 'pending';
  sent_at: string | null;
  error: string | null;
}
```

### 9.4 API Admin

```
GET /api/admin/whatsapp-logs?status=&date=
POST /api/admin/whatsapp/test-send  { phone, template_key, payload }
GET /api/admin/whatsapp-templates
PUT /api/admin/whatsapp-templates/:key
```

---

## RINGKASAN CHECKLIST SEMUA FITUR (STATUS SETELAH DIAKTIFKAN)

### Leaderboard
| Fitur | Spesifikasi |
|---|---|
| Leaderboard crew (mobile) | Podium top-3 + ranking list + posisi saya sticky |
| Filter periode & regional | Monthly/Quarterly/Yearly/All-time |
| API `GET /api/crew/leaderboard` | Query param: period, region_id, limit |

### MPJ Hub
| Fitur | Spesifikasi |
|---|---|
| Upload file Admin Pusat | PDF/PSD/XLSX/ZIP max 50MB, kategori, scope |
| Upload laporan Admin Regional | PDF/XLSX, periode bulan |
| Download file kru | Signed URL, increment download_count |
| Search & filter | Cari nama, filter kategori |

### Notifikasi
| Fitur | Spesifikasi |
|---|---|
| Bell dropdown in-app | Unread badge, list notifikasi, mark read |
| Notifikasi naik level | Push saat XP melewati threshold |
| Notifikasi event baru | Push saat event dipublish |
| Notifikasi sertifikat | Push + WhatsApp saat diterbitkan |

### XP & Misi
| Fitur | Spesifikasi |
|---|---|
| XP otomatis event check-in | Trigger scan QR → INSERT xp_transactions |
| Upload konten dakwah | Submit URL, review admin, +5 XP jika approve |
| Misi bulanan | Admin buat misi, kru selesaikan, +50 XP per misi |
| Edit XP Config CMS | Form edit amount per aksi & threshold level |

### Sertifikat
| Fitur | Spesifikasi |
|---|---|
| Token real backend | Generate saat event FINISHED, satu kali pakai |
| Kirim token via WhatsApp | Otomatis ke kru yang ATTENDED |
| Generate PDF sertifikat | Server-side, simpan di Storage |
| Download PDF kru | GET /api/crew/certificates/:id/download |

### Profil Kru
| Fitur | Spesifikasi |
|---|---|
| Upload foto profil | JPG/PNG max 2MB, resize 400px, update avatar |
| Upload CV/portofolio | PDF max 5MB, list dokumen, delete |

### WhatsApp Notifikasi
| Fitur | Spesifikasi |
|---|---|
| Registrasi event berhasil | Otomatis saat ticket created |
| Pembayaran diverifikasi/ditolak | Otomatis saat admin update status |
| Sertifikat diterbitkan | Token dikirim via WA |
| Pengingat H-1 event | Cron job tiap malam pukul 19.00 |
| Naik XP level | Trigger setelah UPDATE crews.xp_level |
