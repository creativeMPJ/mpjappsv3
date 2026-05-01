# PRD Modul Manajemen Kru MPJ Apps V4

**Versi:** Final terbaru
**Status:** Selaras dengan implementasi FE terakhir
**Area:** Media Dashboard / Koordinator
**Route utama:** `/media/tim`

---

## 1. Tujuan

- Mengelola struktur tim media pesantren secara teratur.
- Mengontrol kapasitas tim melalui sistem slot.
- Mengelola lifecycle kru sebelum identitas resmi masuk ke Master Data.
- Menghubungkan aktivasi kru dengan proses Finance.
- Menjadi dasar akses ke Event, E-ID, dan Militansi.

---

## 2. Prinsip Utama

- Modul Manajemen Kru adalah management layer, bukan sumber identitas final.
- Master Data adalah source of truth untuk identitas resmi.
- Kru baru tidak langsung resmi saat ditambahkan.
- NIAM hanya muncul setelah payment verified.
- Slot adalah resource terbatas.
- Pending tetap makan slot.
- Active tetap makan slot.
- Alumni tidak makan slot.
- Kru active tidak boleh dihapus permanen dari alur utama; gunakan Boyong.
- FE tidak generate NIAM.
- FE hanya menampilkan state, guard, dan CTA yang sesuai status.

---

## 3. Aktor

### Koordinator / Admin Media
- Menambah kru.
- Melihat slot.
- Mengaktifkan kru.
- Membeli slot.
- Memboyong kru.
- Melakukan handover PIC.

### Admin Pusat
- Monitoring kru lintas wilayah.
- Mengatur konfigurasi slot.
- Monitoring alumni.
- Override bila diperlukan.

### Kru
- Tidak mengakses Manajemen Kru.
- Hanya menerima status setelah aktif.

---

## 4. Crew Lifecycle

### pending
- Baru ditambahkan.
- Belum punya NIAM.
- Belum resmi.
- Belum masuk Master Data.
- Tetap makan slot.

### active
- Payment aktivasi terverifikasi.
- Sudah punya NIAM.
- Resmi masuk Master Data.
- Bisa ikut Event.
- Bisa punya E-ID.
- Bisa mendapat XP.

### alumni
- Hasil Boyong.
- Tidak aktif dalam tim.
- Tetap menyimpan histori.
- NIAM tetap valid secara historis.
- Tidak makan slot.
- Tidak bisa daftar event baru.

### inactive
- Status nonaktif administratif jika diperlukan.
- Akses dibatasi.

---

## 5. Data Model

### Crew

- `id`
- `profile_id` / `institutionId`
- `mediaId`
- `name`
- `nickname`
- `email`
- `whatsapp`
- `roleCode` / `role_code`
- `jabatan`
- `position` / `jabatanMedia`
- `status`
  - `pending`
  - `active`
  - `inactive`
  - `alumni`
- `niam` nullable
- `isPic`
- `xpLevel`
- `activatedAt`
- `alumniSince`
- `alumniReason`
- `createdAt`

### Slot Config

- `profileId`
- `freeSlotQuantity`
- `addonSlotsPurchased`
- `addonSlotPrice`

### Payment

- `invoiceId`
- `invoiceType`
  - `crew_activation`
  - `slot_addon`
- `status`
  - `pending`
  - `verified`
  - `rejected`
- `quantity` opsional untuk `slot_addon`

### Master Data

- Hanya menerima crew status `active`.
- Tidak membuat crew baru.
- Menyimpan identitas resmi.

---

## 6. Slot System

Rumus:

- `totalSlot = freeSlotQuantity + addonSlotsPurchased`
- `slotUsed = jumlah crew dengan status pending + active`
- `slotAvailable = totalSlot - slotUsed`

Aturan:

- Pending makan slot.
- Active makan slot.
- Alumni tidak makan slot.
- Inactive tidak dihitung sebagai slot aktif.
- Slot hanya bertambah lewat payment `slot_addon`.
- FE tidak boleh menampilkan slot palsu atau fallback angka fiktif.

---

## 7. Alur Tambah Kru

1. Koordinator klik **Tambah Kru**.
2. Isi:
   - Nama Lengkap
   - Email
   - WhatsApp
   - Jabatan / Role Khodim
   - Posisi / Jabatan Media
   - Catatan opsional
3. Sistem cek `slotAvailable`.
4. Jika slot tersedia:
   - crew dibuat
   - status = `pending`
   - `niam = null`
5. Jika slot penuh:
   - tampilkan state **Slot penuh**
   - tampilkan CTA **Beli Slot**
6. Hasil:
   - kru tampil di daftar
   - badge **Belum Aktif**
   - belum masuk Master Data

---

## 8. Alur Aktivasi Kru / NIAM

1. Koordinator memulai aktivasi kru.
2. Sistem membuat invoice bertipe `crew_activation`.
3. Koordinator melakukan pembayaran.
4. Payment diverifikasi.
5. Backend memproses:
   - generate NIAM
   - update `crew.status = active`
   - set `activatedAt`
6. Crew masuk Master Data.
7. Hasil:
   - NIAM tampil
   - badge **Aktif**
   - akses Event / E-ID / Militansi terbuka sesuai rule.

Catatan:
- FE tidak generate NIAM.
- FE hanya menampilkan status dan CTA.
- Jika endpoint aktivasi belum tersedia, tombol tampil **Segera Hadir**.

---

## 9. Alur Tambah Slot

1. `slotAvailable = 0`.
2. Koordinator klik **Beli Slot**.
3. Sistem membuat invoice bertipe `slot_addon`.
4. Payment diverifikasi.
5. Backend menambah `addonSlotsPurchased`.
6. `slotAvailable` bertambah.

Catatan:
- FE tidak membuat slot palsu.
- Jika detail flow belum tersedia, CTA diarahkan ke `/payment`.

---

## 10. Alur Boyong

1. Koordinator memilih kru.
2. Klik **Boyong**.
3. Isi alasan.
4. Backend mengubah:
   - status = `alumni`
   - alumniSince = now
   - alumniReason = reason
5. Dampak:
   - kru keluar dari tim aktif
   - `slotAvailable` bertambah
   - NIAM tetap valid historis
   - XP tetap tersimpan
   - tidak bisa daftar event baru

Jika backend belum siap:
- tombol tampil disabled
- label **Segera Hadir**

---

## 11. Alur Handover PIC

1. PIC memilih penerima.
2. OTP dikirim ke PIC.
3. OTP dikirim ke penerima.
4. Setelah konfirmasi:
   - `isPic` PIC lama = false
   - `isPic` PIC baru = true
   - audit log tersimpan

Aturan:
- Hanya satu PIC aktif.
- Wajib ada audit log.
- Admin Pusat bisa override jika diperlukan.

---

## 12. UI / FE Rule

### Route dashboard Admin Media
- `/media/tim`

### State wajib
- loading
- error
- empty
- locked
- slot penuh
- payment belum aktif

### Copy standar
- Belum ada kru
- Tambahkan kru setelah akun aktif
- Belum Aktif
- Menunggu aktivasi
- Aktif
- Alumni
- Data slot belum tersedia
- Aktifkan akun terlebih dahulu
- Fitur akan segera tersedia
- Segera Hadir

### Form Tambah Kru
- Nama Lengkap
- Email
- WhatsApp
- Jabatan / Role Khodim
- Posisi / Jabatan Media
- Catatan Opsional

### Catatan FE
- Jika backend belum menerima `email`, `whatsapp`, atau `roleCode`, field boleh tampil sebagai readiness UI.
- Submit tetap mengikuti kontrak existing sampai backend siap.
- Jangan kirim field baru yang belum didukung API.
- Jangan tampilkan data dummy.
- Jangan generate NIAM di FE.

---

## 13. Integrasi Modul

### Master Data
- Hanya crew `active` yang masuk.
- `pending` dan `alumni` tidak masuk sebagai data aktif.

### Finance
- `crew_activation` untuk aktivasi NIAM.
- `slot_addon` untuk tambah slot.

### Event
- Hanya crew `active` dengan NIAM valid yang bisa daftar.
- Event menggunakan NIAM, bukan crew_id langsung.

### E-ID
- Hanya crew `active`.
- NIAM tersedia.
- Pesantren sudah aktif / profile level sesuai rule produk.

### Militansi
- XP hanya untuk crew `active`.
- Alumni menyimpan histori XP.

### Public Directory
- Hanya safe fields.
- Hanya crew active yang boleh tampil publik jika kebijakan mengizinkan.

---

## 14. Rule Kritis

- Crew baru tidak langsung aktif.
- Pending tetap makan slot.
- Alumni tidak makan slot.
- NIAM hanya dibuat setelah payment verified.
- FE tidak boleh generate NIAM.
- Master Data tidak membuat crew.
- Tidak boleh delete crew active.
- Event menggunakan NIAM.
- Slot hanya bertambah lewat payment.
- Role Khodim harus dari konfigurasi resmi.
- Data sensitif tidak boleh tampil publik.

---

## 15. Acceptance Criteria

Modul Manajemen Kru dianggap siap jika:

- `/media/tim` bisa dibuka tanpa NotFound.
- Role dev media tidak terbaca sebagai `admin_pusat`.
- Daftar kru punya loading / error / empty state.
- Slot config gagal tidak membuat halaman crash.
- Tombol **Tambah Kru** terkunci jika akun/payment belum aktif.
- Slot penuh menampilkan CTA **Beli Slot**.
- NIAM kosong tampil **Belum Aktif**.
- Alumni tidak dihitung sebagai slot aktif.
- Tidak ada dummy/mock data user-facing.
- Tidak ada copy generate NIAM di frontend.
- Action yang belum siap tampil **Segera Hadir**.

---

## 16. Kesimpulan

Manajemen Kru V4 adalah:

- Management Layer
- Slot Control
- Payment-Driven Activation
- Identity Pipeline ke Master Data

Flow utama:

**Tambah Kru -> Pending -> Aktivasi/Payment -> Active + NIAM -> Master Data -> Event / E-ID / Militansi**

Dokumen ini menjadi acuan untuk:

- tim frontend
- tim backend
- tim QA
- Codex prompt lanjutan
