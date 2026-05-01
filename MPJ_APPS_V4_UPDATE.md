# MPJ Apps V4 — Update Log

Versi: 4.0  
Tanggal: 30 April 2026  
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

## 🔄 NEXT PHASE

Phase 2: Backend Crew Activation
- Backend `crew_activation`
- Backend `slot_addon`
- Sync active crew ke Master Data
- Boyong + alumni backend
- Handover PIC

