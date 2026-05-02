# PRD — Modul Event MPJ (Media Pesantren Jawa Timur)
**Versi:** 4.0 · **Tanggal:** 29 April 2026  
**Sumber:** Analisis source code frontend

---

## 1. Latar Belakang & Tujuan

Modul Event adalah sistem manajemen acara terpadu MPJ yang menangani seluruh siklus hidup event — dari pembuatan oleh admin, publikasi ke publik, pendaftaran peserta (NIAM/Umum), pembayaran, verifikasi, absensi check-in QR, hingga penerbitan sertifikat otomatis.

---

## 2. Aktor & Peran

| Aktor | Akses |
|---|---|
| **Admin Pusat** | CRUD event, approve/reject pembayaran, kelola SDM & narasumber, generate sertifikat, ekspor data |
| **Crew/Panitia (NIAM)** | Scanner QR check-in via `/event-scan` |
| **Anggota MPJ (NIAM)** | Daftar event gratis/diskon, lihat tiket, QR check-in |
| **Publik Umum** | Daftar event berbayar, upload KTP, upload bukti transfer |

---

## 3. Routing

| Route | Komponen | Akses |
|---|---|---|
| `/events` | `EventListing.tsx` | Publik |
| `/events/:id` | `EventDetail.tsx` | Publik |
| `/ticket/:code` | `EventTicket.tsx` | Peserta |
| `/event-scan` | `EventScan.tsx` | Panitia/Crew |
| `/cms/admin-pusat-event` | `AdminPusatEvent.tsx` | Admin Pusat |
| `/cms/admin-pusat-event-peserta` | `EventMasterPeserta.tsx` | Admin Pusat |
| `/cms/admin-pusat-event-narasumber` | `EventNarasumber.tsx` | Admin Pusat |

---

## 4. Data Model

### 4.1 Event

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | string | UUID event |
| `title` | string | Nama event |
| `description` | string | Deskripsi panjang |
| `poster_url` | string | URL gambar poster |
| `date_start` | ISO datetime | Waktu mulai |
| `date_end` | ISO datetime | Waktu selesai |
| `location` | string | Nama lokasi / "Zoom Meeting" |
| `location_maps_url` | string? | Link Google Maps |
| `status` | EventStatus | DRAFT/PENDING/APPROVED/FINISHED |
| `price_niam` | number | Harga anggota (0 = gratis) |
| `price_umum` | number | Harga publik umum |
| `quota` | number | Kapasitas maksimal |
| `registered_count` | number | Jumlah terdaftar |
| `attended_count` | number | Jumlah hadir |
| `speakers` | Speaker[] | Daftar narasumber |
| `custom_fields` | CustomField[] | Form tambahan dinamis |
| `category` | string | Workshop/Pelatihan/Festival/Rapat Koordinasi/Seminar |

### 4.2 Peserta

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | string | UUID |
| `event_id` | string | FK ke Event |
| `type` | NIAM/UMUM | Jalur pendaftaran |
| `niam` | string? | Nomor Induk Anggota |
| `full_name` | string | Nama lengkap |
| `whatsapp` | string | No. WhatsApp |
| `institution` | string? | Asal instansi |
| `ktp_url` | string? | Foto KTP (UMUM) |
| `ticket_status` | TicketStatus | Status tiket |
| `invoice_amount` | number | Harga dasar |
| `unique_code` | number | Kode unik 3 digit |
| `total_amount` | number | invoice + unique_code |
| `payment_proof_url` | string? | Bukti transfer |
| `rejection_reason` | string? | Alasan jika ditolak |
| `paid_at` | datetime? | Waktu konfirmasi |
| `ticket_code` | string | Format: TKT-EVT001-XXXX |
| `attended_at` | datetime? | Waktu check-in |
| `custom_answers` | Record | Jawaban field tambahan |

### 4.3 Status Tiket

```
PENDING_PAYMENT → PENDING_APPROVAL → PAID → ATTENDED
                                   ↘ REJECTED
```

| Status | Keterangan |
|---|---|
| `PENDING_PAYMENT` | Terdaftar, belum bayar |
| `PENDING_APPROVAL` | Upload bukti, menunggu verifikasi |
| `PAID` | Dikonfirmasi, QR aktif |
| `ATTENDED` | Check-in berhasil |
| `REJECTED` | Pembayaran ditolak |

### 4.4 Status Event

| Status | Label UI | Publik |
|---|---|---|
| `DRAFT` | Draft (kuning) | ❌ |
| `PENDING` | Pending (oranye) | ❌ |
| `APPROVED` | LIVE (hijau + pulse) | ✅ |
| `FINISHED` | Selesai (abu) | ✅ read-only |

### 4.5 Custom Field Types

| Tipe | Render |
|---|---|
| `TEXT` | Input teks satu baris |
| `TEXTAREA` | Area paragraf |
| `RADIO` | Pilihan tunggal (pill buttons) |
| `DROPDOWN` | Select dropdown |
| `CHECKBOX` | Pilihan banyak (multi-select pills) |

---

## 5. Flow Lengkap

### 5.1 Admin: Membuat Event

Form 5 section:
1. **INFO DASAR**: Nama, Kategori, Tipe Event (Non-Kelas/Sistem Kelas), Tanggal, Jam, Poster (upload), Deskripsi, Kuota, Batas Pendaftaran
2. **LOKASI**: Offline (nama lokasi + Google Maps URL) atau Online (Google Meet/Zoom + link meeting)
3. **PENGATURAN PESERTA**: Toggle jalur umum, Custom Field builder (tambah/hapus pertanyaan)
4. **PEMBAYARAN**: Toggle berbayar, Harga NIAM/Umum, Metode (Transfer Manual/Midtrans Snap), Rekening tujuan
5. **NARASUMBER**: Pilih dari pool narasumber, tambah narasumber baru

Tersimpan sebagai **DRAFT** → Admin approve → **APPROVED** → Event live.

**Sistem Kelas:** Jika tipe = "Sistem Kelas", admin tambahkan kelas (nama + kuota per kelas).

### 5.2 Lifecycle Event

```
DRAFT → [Approve] → APPROVED (bisa didaftar)
APPROVED → [Tutup Event] → FINISHED
  → Auto: notifikasi WA + sertifikat PDF ke semua peserta
```

### 5.3 Publik: Listing & Detail

**EventListing (`/events`):**
- Hero banner dengan jumlah event aktif
- Search bar (judul/lokasi)
- Filter kategori (pill bar, sticky)
- Grid card: poster, status badge, kategori, tanggal, lokasi, progress bar kuota, harga, CTA button

**EventDetail (`/events/:id`):**
- Sticky header (back + judul + status badge)
- Hero poster (aspect-video, gradient overlay)
- Info cepat: Tanggal, Waktu, Lokasi, Kuota (4 card)
- Deskripsi expandable
- Narasumber (foto + nama + jabatan)
- Preview custom fields
- Lokasi + link Google Maps
- Sidebar sticky: Harga NIAM & Umum, progress kuota bar, tombol [Daftar Sekarang] / "Kuota Penuh" / "Event Selesai"

### 5.4 Pendaftaran: Jalur NIAM

```
Step 1 PATH_SELECT → pilih [Jalur NIAM]
Step 2 NIAM_LOOKUP → input NIAM → lookup (800ms delay) → tampil profil card
Step 3 FILL_FORM (jika ada custom fields)
Step 4 PAYMENT (jika berbayar)
Step 5 SUCCESS
```

### 5.5 Pendaftaran: Jalur Umum

```
Step 1 PATH_SELECT → pilih [Jalur Umum]
Step 2 FILL_FORM:
  - Nama Lengkap (sesuai KTP) *
  - No. WhatsApp *
  - Asal Instansi *
  - Upload Foto KTP * (JPG/PNG drag area)
  - Custom fields event
Step 3 PAYMENT (selalu berbayar untuk Umum):
  - Invoice card (bank, rekening, total unik)
  - Warning transfer tepat nominal
  - Upload bukti transfer
Step 4 SUCCESS
```

### 5.6 Pembayaran — Transfer Manual

1. System generate kode unik 3 digit (100–999)
2. Total = harga + kode unik
3. Peserta transfer tepat nominal tersebut
4. Upload bukti transfer → status `PENDING_APPROVAL`
5. Admin verifikasi → `PAID` (QR aktif) atau `REJECTED` (dengan alasan)

### 5.7 Tiket Digital (`/ticket/:code`)

- Header gradient: nama event, tanggal, lokasi, ticket code
- Dashed divider (ticket style)
- Info peserta: nama, jenis (NIAM/Umum), NIAM, instansi
- Info pembayaran (jika berbayar)
- Status banner dengan icon & deskripsi
- QR Code (hanya PAID/ATTENDED) — ATTENDED diberi overlay stamp "✓ HADIR"
- Tombol: Screenshot/Simpan, Kembali ke Event

### 5.8 Check-in QR (`/event-scan`)

Dark mode, mobile-first. 3 tab:

**Scanner Tab:**
- Camera frame (visual placeholder, input manual aktif)
- Input kode tiket + tombol Scan
- Simulasi cepat (demo buttons)
- Hasil:
  - ✅ Berhasil: card peserta (nama, instansi, tipe, kode, waktu check-in) → `ATTENDED`
  - ⚠️ Sudah Scan: tampil waktu check-in sebelumnya
  - ❌ Tiket Tidak Valid: kode tidak ditemukan / status bukan PAID

**Riwayat Tab:** daftar scan sesi ini (max 20), warna per hasil

**Statistik Tab:** Tiket Valid, Sudah Hadir, Scan Berhasil sesi ini, Scan Gagal, breakdown per event

---

## 6. CMS Admin — Event Detail (9 Tab)

Akses via Admin Pusat → Manajemen Event → [Detail] pada event.

| Tab | Fitur |
|---|---|
| **Info & Acara** | Poster, waktu, lokasi, kapasitas, biaya, deskripsi |
| **SDM / Panitia** | List narasumber & panitia, [+ Tambah SDM] via input NIAM |
| **Peserta** | Tabel peserta, search/filter status, approve/reject pembayaran (thumbnail bukti hover-zoom) |
| **Keuangan** | Stats (selesai bayar, pending, total masuk), log pembayaran |
| **Absensi** | Tabel peserta ATTENDED |
| **Sertifikat** | Editor drag-and-drop posisi elemen (%), template preview A4, variabel: NAMA_PESERTA/INSTANSI/NO_SERTIFIKAT/FOTO |
| **Laporan** | Placeholder |
| **Dokumentasi** | Placeholder upload foto/video |
| **Pengaturan** | Ubah status event |

---

## 7. Master Peserta (`/cms/admin-pusat-event-peserta`)

Lintas semua event. Statistik clickable (filter langsung):

- **Total, NIAM, Umum, Hadir, Lunas, Pending**

Filter: Search | Filter Event | Filter Jalur | Filter Status

Kolom: Peserta | Event | Jalur | Pembayaran | Kehadiran | Nominal | Aksi (WA)

Ekspor Data (placeholder).

---

## 8. Manajemen Narasumber

Pool global narasumber yang dipilih saat membuat event.

**Data:** nama, bio, alamat, telepon, foto, kategori (Tech/Bisnis/Desain/Jurnalistik/Keagamaan/Lainnya), keahlian (tags), portfolio URL, `whatsapp_notif_sent`

**Fitur:** Search, filter kategori, card grid, form tambah (dialog)

---

## 9. Sertifikat Digital

- Format: PDF (TCPDF backend)
- Template: drag-and-drop (posisi x%, y%)
- Variabel: `[NAMA_PESERTA]`, `[INSTANSI]`, `[NO_SERTIFIKAT]`, `[FOTO]`
- Trigger: Otomatis saat status event → `FINISHED`
- Pengiriman: WhatsApp ke semua peserta PAID/ATTENDED

---

## 10. Notifikasi WhatsApp (Planned)

| Trigger | Penerima |
|---|---|
| Daftar berhasil (gratis) | Peserta — e-tiket + kode |
| Upload bukti transfer | Peserta — konfirmasi diterima |
| Pembayaran PAID | Peserta — QR tiket aktif |
| Pembayaran REJECTED | Peserta — alasan penolakan |
| Event FINISHED | Semua peserta — sertifikat PDF |
| SDM ditambahkan | Panitia — notifikasi tugas |

---

## 11. Aturan Bisnis

1. Kuota penuh → tombol daftar disabled
2. Event FINISHED → tidak bisa daftar, tampil trophy + stats
3. Event DRAFT/PENDING → tidak tampil di `/events`
4. QR hanya aktif untuk PAID atau ATTENDED
5. Scan duplikat → warning, tidak update ulang
6. Kode unik tidak bisa dikembalikan
7. Upload KTP wajib untuk jalur Umum
8. NIAM lookup case-insensitive
9. Perubahan status → `beforeunload` guard

---

## 12. Status Fitur

| Fitur | Status |
|---|---|
| Listing & detail event publik | ✅ Frontend done |
| Form pendaftaran multi-step | ✅ Frontend done |
| NIAM lookup & validasi | ✅ Mock done |
| Upload KTP & bukti transfer | ✅ UI done |
| E-tiket + QR Code | ✅ Frontend done |
| Scanner QR check-in | ✅ Manual input done |
| CMS: buat event (5 section) | ✅ Frontend done |
| CMS: approve/reject pembayaran | ✅ Frontend done |
| CMS: 9-tab event detail | ✅ Frontend done |
| CMS: master peserta lintas event | ✅ Frontend done |
| CMS: manajemen narasumber | ✅ Frontend done |
| Sertifikat drag-and-drop | ✅ UI only |
| Sistem kelas multi-kelas | ✅ UI done |
| Midtrans Snap payment gateway | 🔲 UI only, belum integrasi |
| Notifikasi WhatsApp otomatis | 🔲 Planned backend |
| Ekspor Excel/CSV | 🔲 Placeholder |
| Kamera scanner QR live | 🔲 Planned |
| Backend API integration | 🔲 Semua masih mock data |
