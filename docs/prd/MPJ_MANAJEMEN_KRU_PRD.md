# PRD — Modul Manajemen Kru MPJ (Tim Media Pesantren)
**Versi:** 4.0 · **Tanggal:** 30 April 2026  
**Sumber:** `ManajemenKru.tsx`, `MediaDashboard.tsx`, infografis konsep "Manajemen Admin Media & Slot Kru"

---

## 1. Latar Belakang & Tujuan

Modul Manajemen Kru adalah fitur di **Media Dashboard** (dashboard koordinator pesantren) untuk mengelola anggota tim media. Modul ini mengatur:

1. **Crew Slot System** — Batas slot kru gratis dan mekanisme slot tambahan berbayar
2. **Fitur Boyong (Deaktivasi)** — Menonaktifkan kru tanpa menghapus data historis
3. **Easy Handover** — Transfer jabatan Ketua/PIC antar kru via OTP Token

Posisi modul: `/user/tim` di dalam **Media Dashboard** (koordinator pesantren)

---

## 2. Aktor & Akses

| Aktor | Akses |
|---|---|
| **Koordinator / Ketua** (PIC) | Tambah kru, boyong kru, inisiasi handover, beli slot |
| **Admin Pusat** | Konfigurasi slot gratis, harga add-on, lihat Talent Pool Alumni |
| **Kru biasa** | Tidak memiliki akses ke manajemen kru pesantren lain |

---

## 3. Crew Slot System

### 3.1 Aturan "The Golden 3"

Setiap pesantren mendapat **3 slot gratis** untuk anggota kru media.

- Slot **reusable**: Jika kru di-boyong (dinonaktifkan), slot tersebut **kembali kosong** dan bisa diisi kru baru
- Slot pertama otomatis = **PIC** (Person In Charge), yaitu orang yang mendaftarkan akun pesantren
- Konfigurasi jumlah slot gratis diatur oleh Admin Pusat (field: `freeSlotQuantity`)

### 3.2 Slot Indicator

```
Header: "Tim Media"
Sub: "Kelola anggota tim media pesantren (2/3 slot gratis)"

Slot Bar Visual:
[🟢 Terisi] [🟢 Terisi] [⬜ Kosong]  → 2 dari 3 slot terisi
```

### 3.3 Alert Slot Penuh

Saat `totalCrew >= freeSlotQuantity`:

```
⚠️ Banner Amber:
"Slot Gratis Penuh: Anda telah menggunakan 3 slot gratis."
[Beli Slot (Rp 10.000/slot)]  ← harga dari API slot-config
```

Klik "Beli Slot":
- Tampil dialog konfirmasi jumlah slot yang ingin dibeli
- Redirect ke proses pembayaran (integrasi Midtrans/manual)
- Setelah terbayar: `addon_slots` bertambah, kru bisa ditambahkan lagi

### 3.4 Konfigurasi Slot (Admin Pusat)

Admin Pusat dapat mengatur:

| Field | Default | Keterangan |
|---|---|---|
| `free_slot_quantity` | 3 | Slot gratis per pesantren |
| `addon_slot_price` | Rp 10.000 | Harga per slot tambahan |
| `max_addon_slots` | 10 | Batas slot add-on per pesantren |

API: `GET /api/media/slot-config` (diakses saat mount ManajemenKru)

---

## 4. Data Model

### 4.1 Crew

```typescript
interface Crew {
  id: string;
  profile_id: string;         // FK ke pesantren (profiles)
  nama: string;
  jabatan: string | null;     // 'Ketua' | 'Videografer' | dst
  jabatan_code_id: string | null;
  niam: string | null;        // NIAM — null jika belum diaktivasi
  xp_level: number;           // default 0
  is_pic: boolean;            // true = Ketua/PIC
  status: 'active' | 'alumni'; // 'alumni' setelah diboyong
  alumni_since: string | null;
  alumni_reason: string | null;
  created_at: string;
}
```

### 4.2 Slot Config (per pesantren)

```typescript
interface SlotConfig {
  profile_id: string;
  free_slot_quantity: number;   // dari sistem (Admin Pusat)
  addon_slots_purchased: number; // dibeli pesantren
  addon_slot_price: number;     // Rp per slot
}
```

### 4.3 Jabatan Options

| Kode | Label |
|---|---|
| `ketua` | Ketua |
| `videografer` | Videografer |
| `fotografer` | Fotografer |
| `desainer` | Desainer |
| `copywriter` | Copywriter |
| `admin` | Admin |

---

## 5. Tampilan Halaman Tim Media

**Route:** `/user/tim`  
**Komponen:** `ManajemenKru.tsx`

### 5.1 Layout Utama

```
Header: "Tim Media"
Sub: "Kelola anggota tim media pesantren (X/3 slot gratis)"
[Refresh] [Tambah Kru Baru]

[Alert Slot Penuh — amber, jika slot habis]

── Grid Kru (1-col mobile, 2-col desktop) ──────
[Card Kru 1 — PIC badge, border emerald]
[Card Kru 2]
[Card Kru 3]

── Form Tambah Kru (hanya tampil jika slot tersedia) ─
[Nama Kru] [Jabatan ▼] [Tambah Kru]

── Info Box: Aturan The Golden 3 ───────────────
```

### 5.2 Card Per Kru

```
[Avatar inisial berwarna]  Nama Kru          [🗑 Hapus*]
                           Jabatan
                           [NIAM badge — emerald, jika ada]
                           ⚡ 150 XP [jika > 0]
```

> `*` Tombol hapus **tidak tampil** untuk kru pertama (PIC/index 0)

### 5.3 Empty State

```
[Icon Users abu-abu]
"Belum ada kru"
"Tambahkan anggota tim media Anda"
```

---

## 6. Fitur Boyong (Deaktivasi Kru)

Konsep dari infografis: Admin dapat **menonaktifkan kru** tanpa menghapus data. Status berubah menjadi "Alumni Media" dan data tersimpan di **Talent Pool Alumni Pusat**.

### 6.1 Flow Boyong

```
Koordinator klik [Boyong Kru] di card kru (bukan PIC)
    ↓
Dialog konfirmasi:
  "Boyong [Nama Kru]?"
  "Kru akan menjadi Alumni Media. Data tidak hilang.
   Slot akan kembali tersedia untuk kru baru."
  [Alasan Boyong: dropdown/text]
  [Batalkan] [Ya, Boyong]
    ↓
PUT /api/media/crew/:id/boyong
  { reason: string }
    ↓
Backend: UPDATE crews SET status='alumni', alumni_since=NOW(), alumni_reason=reason
Backend: Slot otomatis kembali (decrement slot usage)
    ↓
Card kru hilang dari daftar aktif
Toast: "✅ [Nama Kru] telah diboyong. Slot tersedia kembali."
```

### 6.2 Perubahan UI setelah Boyong

- Kru tidak tampil di daftar aktif Tim Media pesantren
- Kru masih bisa login ke Crew Dashboard dengan status "Alumni Media"
- Di profil publik: label berubah dari jabatan ke "Alumni Media — [Nama Pesantren]"
- NIAM tetap valid dan aktif untuk keperluan historis

### 6.3 Talent Pool Alumni (Admin Pusat)

Admin Pusat dapat melihat semua kru alumni dari seluruh pesantren:

```
Tab "Alumni Kru" di Admin Pusat → Master Data:
  List: NIAM, Nama, Jabatan Terakhir, Pesantren, Tanggal Boyong, Alasan
  Filter: Regional / Pesantren / Periode
  Export Excel
```

### 6.4 Data Alumni

```typescript
// Dalam tabel crews:
status: 'alumni'
alumni_since: '2025-03-15T10:00:00Z'
alumni_reason: 'Lulus dari pesantren'

// View Alumni di Admin:
interface AlumniCrew {
  id: string;
  nama: string;
  niam: string | null;
  jabatan_terakhir: string | null;
  pesantren_name: string;
  region_name: string;
  alumni_since: string;
  alumni_reason: string | null;
}
```

---

## 7. Easy Handover (Transfer Ketua via OTP)

Konsep dari infografis: Pergantian Admin Utama (Ketua) cukup melalui **OTP Token antar-kru**, tanpa perlu birokrasi Admin Pusat.

### 7.1 Flow Handover

```
Ketua (PIC) klik [Transfer Jabatan Ketua] di pengaturan
    ↓
Step 1 — Pilih Penerima:
  Dropdown: Daftar kru aktif selain Ketua saat ini
  [Ahmad Fauzi — Videografer]
  [Siti Aisyah — Admin]
    ↓
Step 2 — Konfirmasi identitas Ketua:
  "Masukkan kode OTP yang dikirim ke WhatsApp Anda (+62812***)"
  [OTP Input 6 digit]
    ↓
Step 3 — Penerima konfirmasi:
  Notif WhatsApp ke kru penerima:
  "📲 [Nama Ketua] ingin mentransfer jabatan Ketua ke Anda.
   Masukkan kode: XXXX untuk konfirmasi."
  Penerima masukkan kode di Crew Dashboard
    ↓
Backend:
  UPDATE crews SET is_pic=false WHERE id=ketua_lama
  UPDATE crews SET is_pic=true, jabatan='Ketua' WHERE id=ketua_baru
  Log ke handover_logs
    ↓
Toast/Notif:
  Ketua lama: "✅ Jabatan Ketua berhasil ditransfer ke [Nama]"
  Ketua baru: "🎉 Anda kini menjadi Ketua Tim Media [Pesantren]!"
```

### 7.2 Aturan Handover

1. Hanya **PIC/Ketua** yang bisa memulai handover
2. Penerima harus kru aktif dari pesantren yang sama
3. OTP berlaku **10 menit**, satu kali pakai
4. Maksimal **3 percobaan** OTP (setelah itu harus generate ulang)
5. Jika dalam 24 jam tidak dikonfirmasi penerima, handover **otomatis dibatalkan**
6. Admin Pusat tetap bisa override jika terjadi sengketa

### 7.3 Data Model Handover

```typescript
interface HandoverLog {
  id: string;
  profile_id: string;        // pesantren
  from_crew_id: string;      // ketua lama
  to_crew_id: string;        // ketua baru
  otp_sent_at: string;
  confirmed_at: string | null;
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  initiated_by: string;      // user_id ketua lama
}
```

### 7.4 API Handover

```
POST /api/media/crew/handover/initiate    { to_crew_id }
POST /api/media/crew/handover/confirm-ketua  { otp }
POST /api/media/crew/handover/confirm-penerima { token }
POST /api/media/crew/handover/cancel
GET  /api/media/crew/handover/status
```

---

## 8. Form Tambah Kru

### 8.1 Input Fields

| Field | Tipe | Validasi |
|---|---|---|
| Nama Kru | Text input | Wajib, min 3 karakter |
| Jabatan | Dropdown (6 opsi) | Wajib dipilih |

### 8.2 Validasi

- Nama wajib diisi
- Jabatan wajib dipilih
- Jika slot penuh (`isFreeSlotFull`): tombol disabled + toast peringatan
- Duplikasi nama: warning (tidak blokir)

### 8.3 Setelah Tambah

- API `POST /api/media/crew` dipanggil
- Form di-reset (nama & jabatan kosong)
- `loadData()` dipanggil ulang (refresh list)
- Toast: "✅ Kru ditambahkan"
- Jika kru baru adalah pertama & jabatan = Ketua → otomatis jadi PIC

---

## 9. Hapus Kru

### 9.1 Perbedaan Hapus vs Boyong

| Aksi | Efek | Data | Slot |
|---|---|---|---|
| **Hapus** (Trash icon) | Permanen | Hilang | Kembali kosong |
| **Boyong** | Nonaktif | Tersimpan sebagai Alumni | Kembali kosong |

> Catatan: Saat ini UI menggunakan tombol Trash (hapus). Upgrade ke "Boyong" sesuai konsep infografis adalah fitur yang perlu diimplementasi.

### 9.2 Aturan Hapus

- Kru pertama (PIC/index 0) **tidak bisa dihapus** (tombol tidak tampil)
- Konfirmasi `window.confirm("Hapus kru ini?")`
- API: `DELETE /api/media/crew/:id`
- Toast: "✅ Kru dihapus"

---

## 10. API Endpoints

| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/media/crew` | GET | List semua kru aktif pesantren |
| `/api/media/crew` | POST | Tambah kru baru |
| `/api/media/crew/:id` | DELETE | Hapus kru permanen |
| `/api/media/crew/:id/boyong` | PUT | Deaktivasi kru → Alumni |
| `/api/media/slot-config` | GET | Konfigurasi slot gratis + harga add-on |
| `/api/media/slot-addon/purchase` | POST | Beli slot tambahan |
| `/api/media/crew/handover/initiate` | POST | Mulai proses handover ketua |
| `/api/media/crew/handover/confirm-ketua` | POST | OTP verifikasi ketua lama |
| `/api/media/crew/handover/confirm-penerima` | POST | Konfirmasi ketua baru |
| `/api/media/crew/handover/status` | GET | Status handover aktif |
| `/api/admin/crew/alumni` | GET | Talent Pool Alumni (Admin Pusat) |
| `/api/admin/slot-config` | PUT | Update konfigurasi slot global |

---

## 11. Aturan Bisnis

1. **3 slot gratis** per pesantren, reusable (boyong = slot kembali)
2. **PIC/Ketua** selalu index pertama, tidak bisa dihapus dari UI biasa
3. **Slot add-on** berbayar, dikonfigurasi Admin Pusat, dibeli via Administrasi
4. **Boyong** = nonaktif, data tersimpan, NIAM tetap valid
5. **Hapus** = permanen, data hilang (hanya untuk kru non-PIC)
6. **Handover** hanya via OTP dua arah (Ketua + Penerima), tidak butuh Admin Pusat
7. **NIAM** diterbitkan setelah pesantren membayar dan kru didaftarkan resmi
8. **Alumni** masih bisa akses Crew Dashboard tapi tidak bisa daftar event baru
9. Admin Pusat bisa override jabatan PIC jika terjadi sengketa
10. Kru dengan jabatan `ketua` otomatis ditandai sebagai koordinator di sidebar Media Dashboard

---

## 12. Integrasi dengan Modul Lain

| Modul | Hubungan |
|---|---|
| **E-ID Card** | PIC/Ketua ditampilkan sebagai koordinator di E-ID pesantren |
| **Master Data** | Kru sync ke tabel `crews` di Admin Pusat |
| **Administrasi** | Slot add-on pembelian melalui modul Administrasi (payment) |
| **Militansi** | `xp_level` kru tampil di card dan leaderboard |
| **Event** | Kru aktif bisa daftar event (bukan alumni) |
| **Publik Profil** | Kru aktif tampil di halaman publik pesantren |

---

## 13. Checklist Fitur (Status)

| Fitur | Status |
|---|---|
| List kru aktif per pesantren | ✅ Done |
| Card kru (nama, jabatan, NIAM, XP) | ✅ Done |
| PIC badge pada kru pertama | ✅ Done |
| Form tambah kru (nama + jabatan) | ✅ Done |
| Dropdown jabatan 6 opsi | ✅ Done |
| Hapus kru (non-PIC) | ✅ Done |
| Slot gratis counter (X/3) | ✅ Done |
| Alert slot penuh + tombol beli | ✅ Done (UI) |
| Load slot config dari API | ✅ Done |
| Loading state + refresh button | ✅ Done |
| Empty state (belum ada kru) | ✅ Done |
| Info box "Aturan The Golden 3" | ✅ Done |
| Fitur Boyong (Deaktivasi → Alumni) | 🔲 Diimplementasi |
| Talent Pool Alumni (Admin Pusat) | 🔲 Diimplementasi |
| Easy Handover via OTP Token | 🔲 Diimplementasi |
| Slot add-on payment flow | 🔲 Diimplementasi |
| Konfirmasi boyong dialog (+ alasan) | 🔲 Diimplementasi |
| Notifikasi WhatsApp handover | 🔲 Diimplementasi |
| Jabatan kustom (beyond 6 opsi) | 🔲 Planned |
| Upload foto per kru dari sini | 🔲 Via Profil Kru |
