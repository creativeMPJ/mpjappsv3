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

Phase 2: Payment Core  
- Payment → generate NIP  
- Payment → generate NIAM  
- Activation lifecycle  

