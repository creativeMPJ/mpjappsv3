# Dokumentasi Proyek: MPJ Event App (Frontend)

**Tanggal Update Terakhir:** April 2026
**Tech Stack:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons

---

## 📌 Ringkasan Proyek
MPJ Event App adalah sistem manajemen acara (Event Management System) yang dikembangkan untuk mengelola seluruh siklus event, mulai dari pembuatan acara, pendaftaran peserta, manajemen panitia/narasumber, hingga laporan pasca-acara dan pembuatan sertifikat otomatis.

Repositori ini berfokus pada pengembangan antarmuka (Frontend) Administrator, khususnya modul **Admin Pusat**.

---

## 🚀 Fitur Utama (Master Event)

### 1. Daftar Event (AdminPusatEvent.tsx)
Pusat kendali untuk setiap event. Menggunakan sistem **8-Tab** untuk memisahkan setiap fungsionalitas manajemen:
- **Info & Acara:** Menampilkan detail jadwal, lokasi, poster, kuota, biaya, dan deskripsi acara.
- **SDM / Panitia:** Menampilkan daftar panitia dan narasumber yang terlibat (terhubung dengan data `MOCK_SPEAKERS`), lengkap dengan foto profil.
- **Peserta:** Daftar peserta spesifik untuk event yang dipilih beserta pencarian dan filter status.
- **Keuangan:** (Dalam Pengembangan) Ringkasan transaksi, pemasukan, dan ROI event.
- **Absensi:** Shortcut dan informasi mengenai kehadiran peserta.
- **Sertifikat:**
  - **Editor Template Sertifikat Interaktif:** Fitur *drag-and-drop* variabel dinamis (`[NAMA_PESERTA]`, `[INSTANSI]`, `[NO_SERTIFIKAT]`, `[FOTO_PESERTA]`) ke atas kanvas background (PDF/JPG) secara *real-time*.
  - Koordinat sumbu X dan Y otomatis tersimpan saat elemen digeser.
  - Simulasi *generate* sertifikat otomatis via TCPDF di backend (pengiriman notifikasi WhatsApp setelah event selesai).
- **Laporan:**
  - Statistik *real-time*: Efektivitas Kehadiran, ROI Pendaftaran, dan Jumlah Sertifikat Terkirim.
  - Area *drag-and-drop* untuk mengunggah **Berita Acara / LPJ** berformat PDF.
- **Dokumentasi (Baru):**
  - **Foto Kegiatan:** Area *upload* dengan batas maksimal **10 foto**, lengkap dengan *grid gallery preview* dan indikator kuota terunggah (misal: 10/10).
  - **Foto Bersama (Official):** Area *upload* terpisah khusus untuk foto beresolusi tinggi (maksimal 10 foto).
- **Pengaturan (Status Event):** Kontrol untuk mengubah status event (`DRAFT`, `PENDING`, `APPROVED`, `FINISHED`).

### 2. Master Peserta (EventMasterPeserta.tsx)
Dashboard analitik komprehensif untuk seluruh pendaftar dari semua event.
- **Global Statistik:** Total, Jalur NIAM, Umum, Hadir, Lunas, dan Pending.
- **Filter Multi-dimensi:** Pencarian teks, filter by Event, filter by Jalur, dan filter by Status Pembayaran.
- **Aksi Cepat:** Terdapat tombol *Direct WhatsApp* (berlogo telepon hijau) pada tiap baris peserta untuk langsung menghubungi peserta bersangkutan. Tersedia juga tombol **Ekspor Data** untuk CSV/Excel.

### 3. Master Narasumber (EventNarasumber.tsx)
Sistem pendataan *speaker* atau pembicara yang akan mengisi event.
- Tampilan berbasis kartu (*Grid Cards*) yang responsif.
- Kategori spesifik (Tech, Bisnis, Desain, Keagamaan, dll) beserta *tag* keahlian.
- **Form Tambah Narasumber:** Terintegrasi dengan fitur **Upload Foto Profil (1:1)** menggunakan UI klik/drop.

### 4. Scan Absensi (EventScanAbsensi.tsx)
Aplikasi mini untuk petugas di pintu masuk / loket (*On-site Registration*).
- **Mode Kamera:** Simulasi UI *scanner barcode* dengan animasi garis *scan* untuk perangkat mobile/tablet.
- **Mode Input Manual:** Kolom *input* yang mendukung **Barcode Scanner USB** (otomatis *auto-focus* saat halaman dibuka).
- **Riwayat Scan Real-time:** Memvalidasi kode tiket (misal: `TKT-EVT001`) terhadap database *mock*:
  - ✅ **Sukses**: Jika status *PAID*.
  - ❌ **Gagal**: Jika sudah *ATTENDED* (mencegah *double entry*).
  - ❌ **Ditolak**: Jika masih *PENDING* atau belum bayar.

---

## 📂 Struktur Folder (Frontend Terkait)

```text
src/
├── app/
│   └── router/
│       └── Router.tsx                 # Routing utama (menghubungkan halaman admin pusat)
├── components/
│   └── admin-pusat/                   # Komponen khusus untuk role Admin Pusat
│       ├── AdminPusatEvent.tsx        # Halaman Detail Event (8-Tab System)
│       ├── EventMasterPeserta.tsx     # Halaman Master Peserta Global
│       ├── EventNarasumber.tsx        # Halaman Manajemen Narasumber
│       └── EventScanAbsensi.tsx       # Halaman Scanner & Check-in
├── lib/
│   └── event-mock-data.ts             # Dummy Data (MOCK_EVENTS, MOCK_PARTICIPANTS, MOCK_SPEAKERS)
└── shared/
    └── components/
        └── layouts/
            └── CmsLayout.tsx          # Layout Sidebar Navigasi Admin
```

---

## ⚙️ Workflow & Integrasi Lanjutan (Rencana)

1. **Integrasi TCPDF (Backend):** 
   Koordinat *drag-and-drop* dari Editor Sertifikat (`AdminPusatEvent.tsx`) akan dikirim sebagai *payload* JSON ke backend Laravel/Node untuk di-*render* secara *pixel-perfect* di atas dokumen PDF asli.
2. **Integrasi API WhatsApp:**
   Trigger event `status === "FINISHED"` akan menjalankan *cron job* atau sistem *queue* di backend untuk mendistribusikan link sertifikat dan ucapan terima kasih ke nomor WhatsApp peserta masing-masing (dihapus dari UI narasumber).
3. **Integrasi Scanner Hardware:**
   Komponen `EventScanAbsensi.tsx` telah disiapkan agar langsung menangkap event `Enter` dari *Keyboard Emulator* milik mesin *Barcode Scanner USB*.
4. **Integrasi Endpoint Upload:**
   Simulasi *upload* pada Dokumentasi dan Berita Acara harus segera disambungkan dengan API multipart/form-data ke server.

---
*Dokumen ini dibuat untuk mempermudah transisi progres dari pembuatan UI Frontend menuju integrasi Backend API.*
