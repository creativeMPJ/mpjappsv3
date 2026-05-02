# MPJ Apps V4 — Update Log

Versi: 4.0  
Tanggal awal: 30 April 2026
Update terakhir: 2 Mei 2026
Branch: rou-improvement  

---

## 🚀 Ringkasan

Update ini merupakan refinement besar pada layer frontend V4, meliputi:
- Standarisasi UI/UX dashboard
- Penyelarasan dengan PRD Master Data V4
- Implementasi relational navigation
- Penguatan validasi identitas (NIAM)
- Enforcement core rules sistem

Tambahan final:
- Manajemen Kru ditetapkan sebagai Management Layer
- Master Data tetap Source of Truth identitas final
- Tambah Kru menghasilkan status `pending` dengan `NIAM = null`
- Aktivasi Kru berjalan melalui invoice `crew_activation`
- NIAM hanya muncul setelah payment `verified`
- `slotUsed = pending + active`
- Alumni tidak makan slot
- `/media/tim` sudah disiapkan sebagai dashboard Admin Media untuk Kelola Crew
- FE tidak generate NIAM
- FE hanya menampilkan state, guard, dan CTA
- Form Tambah Kru disiapkan untuk:
  - Nama Lengkap
  - Email
  - WhatsApp
  - Jabatan / Role Khodim
  - Posisi / Jabatan Media
  - Catatan Opsional
- Action Aktivasi / Boyong / Handover yang belum backend-ready tetap `Segera Hadir`
- Role dev media sudah diperbaiki agar tidak terbaca `admin_pusat`

---

## 🎯 UI SYSTEM IMPROVEMENT

### DataTableShell
- Loading state: skeleton rows
- Empty state:
  - Belum ada data
  - Fitur belum tersedia
  - Gagal memuat data
- Error state + retry
- Search optional (controlled)
- Responsive horizontal scroll

### Action Standardization
- Semua action menggunakan button
- Label konsisten: "Segera Hadir"
- Tidak ada lagi text action / raw link

---

## 🧭 NAVIGATION SYSTEM (V4 SIDEBAR)

- Nested menu (hierarchical)
- Accordion behavior (single open)
- Active route detection (deep match)
- Parent auto-expand jika child aktif
- Mobile:
  - auto close saat klik
- Animasi:
  - smooth expand/collapse
  - chevron rotation
- Overlay:
  - blur + dark background

---

## ♻️ CODE REFACTOR & STANDARDIZATION

- Formatter dipusatkan:
  - formatText
  - formatDate
  - formatCurrency
  - FileLink
- Menghapus duplikasi antar halaman
- Konsolidasi utility V4

---

## 🔗 MASTER DATA RELATIONAL NAVIGATION

Relasi aktif:
Media → Koordinator → Kru

Perubahan:
- Nama kru & koordinator clickable
- Navigasi ke:
  /master-data/kru?crew={id}
- Highlight row otomatis
- Scroll ke posisi data

---

## 🆔 EVENT — NIAM VALIDATION SYSTEM

NIAM hanya valid jika:
- crew.status = active
- institution.status = active
- payment.status = verified

Fitur:
- Autofill identity
- Lock identity
- Badge:
  - NIAM Verified
  - Peserta Umum
- Duplicate NIAM prevention

---

## 🧱 CORE RULE ENFORCEMENT (V4)

- Alumni:
  - tidak bisa akses fitur terbatas
- Slot:
  - redirect ke /payment (no fake state)
- XP:
  - berbasis transaction (bukan static)
- Identity:
  - hanya dari Master Data valid

---

## 🏗 ARSITEKTUR (ALIGNMENT V4)

Finance → Activation → Master Data  
           ↓  
           NIP / NIAM  
           ↓  
Crew → Event → XP → Leaderboard  

---

## ⚠️ CATATAN

- Tidak ada perubahan backend
- Tidak ada perubahan API
- Semua perubahan pada frontend & logic enforcement

---

## 🧩 FINAL FE V4 CLEANUP — 2 MEI 2026

Cleanup ini merapikan route, menu, placeholder, dan readiness page V4 lintas role tanpa mengubah backend, Prisma, migration, endpoint, payment flow, atau contract API existing.

### Admin Pusat

Struktur Pengaturan Pusat final:
- Profil Pusat
- Tim Pusat
- Regional
- Kode Khodim
- Harga & SKU

Route resmi Pengaturan Pusat:
- `/pusat/pengaturan/profil`
- `/pusat/pengaturan/tim-pusat`
- `/pusat/pengaturan/regional`
- `/pusat/pengaturan/kode-khodim`
- `/pusat/pengaturan/harga-sku`

Legacy route yang tetap aman:
- `/pusat/pengaturan/admin-role` redirect ke `/pusat/pengaturan/tim-pusat`
- `/pusat/pengaturan/paket-slot` redirect ke `/pusat/pengaturan/harga-sku`
- `/pusat/pengaturan/leveling` redirect ke `/pusat/militansi/leveling`

Militansi final:
- `/pusat/militansi` menjadi monitoring/readiness untuk XP, leaderboard, aktivitas XP, dan level militansi.
- `/pusat/militansi/leveling` menjadi readiness Pengaturan Leveling dan XP Rules.
- Submenu Militansi final:
  - Overview
  - Leaderboard
  - Aktivitas XP
  - Pengaturan Leveling

MPJ Hub:
- `/pusat/mpj-hub` menjadi readiness resource dan dokumen resmi MPJ.
- Tidak menampilkan file, link, angka, atau data palsu.
- Action upload/download/manage tetap `Segera Hadir` sampai data/API real tersedia.

### Admin Media

Route ready:
- `/media/beranda`
- `/media/administrasi`
- `/media/identitas`
- `/media/tim`
- `/media/eid`
- `/media/event`

Route readiness:
- `/media/hub` menjadi readiness MPJ Hub untuk panduan, materi media, template konten, dan arsip event.
- `/media/pengaturan` masih placeholder aman.

### Crew

Route ready:
- `/crew/beranda`
- `/crew/profil`
- `/crew/eid`
- `/crew/event`

Route readiness:
- `/crew/hub` menjadi readiness MPJ Hub untuk panduan kru, materi skill, template konten, dan arsip event.
- `/crew/militansi` menjadi readiness XP personal, level, aktivitas terbaru, dan leaderboard tanpa angka XP palsu.
- `/crew/sertifikat` masih placeholder aman.

### Admin Regional

Route ready:
- `/regional/beranda`
- `/regional/administrasi/monitoring-pendaftaran`
- `/regional/sekretariat`
- `/regional/sekretariat/administrasi`
- `/regional/sekretariat/sertifikat`
- `/regional/master-data`
- `/regional/master-data/pesantren`
- `/regional/master-data/kru`
- `/regional/event/daftar`

Route yang masih readiness/placeholder aman:
- Monitoring Lembaga
- Leveling Wilayah
- Peserta
- Scan
- Monitoring Militansi
- MPJ Hub
- Profil Regional
- Tim Regional

### Finance

Route ready:
- `/finance/beranda`
- `/finance/verifikasi`

Route readiness:
- `/finance/laporan`

### Copy dan Konsep yang Dirapikan

- `Paket / Slot` diganti menjadi `Harga & SKU`.
- `Admin & Role` diganti menjadi `Tim Pusat`.
- Leveling dikeluarkan dari Pengaturan umum dan dipindahkan ke Militansi.
- Placeholder generic `Pengaturan ini akan segera tersedia` tidak lagi dipakai untuk overview Pengaturan Pusat.
- Page readiness tidak menampilkan data dummy, mock, harga palsu, XP palsu, leaderboard palsu, atau link kosong.
- Route parent yang punya child aman tidak otomatis dianggap error; diklasifikasikan sebagai overview, readiness, placeholder, atau legacy redirect safe.

### Status Validasi

- ESLint terbatas untuk file yang diubah sudah dijalankan pada batch cleanup terkait.
- `git diff --check` sudah dijalankan pada batch cleanup terkait; hanya warning CRLF yang muncul dari file existing.
- Manual route check sudah dilakukan untuk route utama V4 Admin Pusat, Admin Media, Crew, Regional, dan Finance.

### Prioritas Batch Berikutnya

- Rapikan readiness page Admin Regional yang masih generic.
- Rapikan `/media/pengaturan`.
- Rapikan copy kecil Crew seperti konsistensi `MPJ Hub`.
- Evaluasi `/finance/laporan` sebagai readiness laporan tanpa data palsu.

---

## 🔄 NEXT PHASE

Phase 2: Backend Crew Activation
- Backend `crew_activation`
- Backend `slot_addon`
- Sync active crew ke Master Data
- Boyong + alumni backend
- Handover PIC

