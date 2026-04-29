# Design Modul Sekretariat MPJ Apps v4

Dokumen ini adalah desain backend contract untuk modul Sekretariat. Belum ada implementasi backend, route Fastify, controller, service, migration, PDF stamping, QR generation, atau upload logic real.

## 1. Tujuan

Modul Sekretariat mencakup:

- Surat masuk
- Surat keluar
- Asset tanda tangan
- Pengaturan posisi template

Data dibatasi oleh `scope` dan `regionId`:

- Admin Pusat dapat mengelola data pusat dan melihat data regional.
- Admin Regional hanya dapat mengelola data regional miliknya sendiri.

Nomor surat final, file PDF final, dan QR validasi harus dianggap authoritative dari backend. Frontend hanya menampilkan data yang dikembalikan API.

## 2. Prisma Schema Design

### 2.1 Enum

```prisma
enum LetterDirection {
  incoming
  outgoing
}

enum LetterScope {
  pusat
  regional
}

enum LetterStatus {
  draft
  registered
  finalized
  archived
  rejected
}

enum LetterDocumentType {
  surat_keputusan
  surat_tugas
  surat_undangan
  surat_edaran
  surat_keterangan
  surat_rekomendasi
  berita_acara
  lainnya
}
```

Status usage:

- `draft`: draft surat keluar.
- `registered`: surat masuk sudah dicatat.
- `finalized`: surat keluar sudah punya nomor/file final dari backend.
- `archived`: surat sudah diarsipkan.
- `rejected`: reserved untuk workflow koreksi/penolakan.

### 2.2 Model `Letter`

Satu table untuk surat masuk dan surat keluar.

```prisma
model Letter {
  id              String             @id @default(uuid()) @db.VarChar(36)
  direction       LetterDirection
  scope           LetterScope
  regionId        String?            @map("region_id") @db.VarChar(36)
  letterNumber    String?            @map("letter_number")
  originNumber    String?            @map("origin_number")
  subject         String
  documentType    LetterDocumentType @map("document_type")
  senderName      String?            @map("sender_name")
  recipientName   String?            @map("recipient_name")
  signerName      String?            @map("signer_name")
  signerPosition  String?            @map("signer_position")
  letterDate      DateTime?          @map("letter_date") @db.DateTime(0)
  receivedAt      DateTime?          @map("received_at") @db.DateTime(0)
  status          LetterStatus       @default(draft)
  finalFileUrl    String?            @map("final_file_url")
  scanFileUrl     String?            @map("scan_file_url")
  validationQrUrl String?            @map("validation_qr_url")
  notes           String?            @db.Text
  createdById     String             @map("created_by_id") @db.VarChar(36)
  updatedById     String?            @map("updated_by_id") @db.VarChar(36)
  archivedAt      DateTime?          @map("archived_at") @db.DateTime(0)
  createdAt       DateTime           @default(now()) @map("created_at") @db.DateTime(0)
  updatedAt       DateTime           @updatedAt @map("updated_at") @db.DateTime(0)

  region          Region?            @relation(fields: [regionId], references: [id])
  createdBy       User               @relation("letters_created_by", fields: [createdById], references: [id])
  updatedBy       User?              @relation("letters_updated_by", fields: [updatedById], references: [id])

  @@index([direction])
  @@index([scope])
  @@index([regionId])
  @@index([status])
  @@index([letterDate])
  @@index([createdAt])
  @@index([scope, regionId, direction, status])
  @@map("letters")
}
```

Field usage:

- Surat masuk memakai `direction = incoming`.
- Surat keluar memakai `direction = outgoing`.
- `letterNumber` dipakai surat keluar.
- `originNumber` dipakai surat masuk.
- `finalFileUrl` dipakai surat keluar.
- `scanFileUrl` dipakai surat masuk.
- `validationQrUrl` disiapkan untuk hasil QR backend, bukan frontend.

### 2.3 Model `Signature`

Asset tanda tangan pimpinan.

```prisma
model Signature {
  id           String      @id @default(uuid()) @db.VarChar(36)
  scope        LetterScope
  regionId     String?     @map("region_id") @db.VarChar(36)
  leaderName   String      @map("leader_name")
  positionName String      @map("position_name")
  imageUrl     String      @map("image_url")
  isActive     Boolean     @default(true) @map("is_active")
  createdById  String      @map("created_by_id") @db.VarChar(36)
  updatedById  String?     @map("updated_by_id") @db.VarChar(36)
  createdAt    DateTime    @default(now()) @map("created_at") @db.DateTime(0)
  updatedAt    DateTime    @updatedAt @map("updated_at") @db.DateTime(0)

  region       Region?     @relation(fields: [regionId], references: [id])
  createdBy    User        @relation("signatures_created_by", fields: [createdById], references: [id])
  updatedBy    User?       @relation("signatures_updated_by", fields: [updatedById], references: [id])

  @@index([scope])
  @@index([regionId])
  @@index([isActive])
  @@index([scope, regionId, positionName])
  @@map("signatures")
}
```

Rule:

- `scope = pusat` berarti `regionId = null`.
- `scope = regional` berarti `regionId` wajib ada.
- Hanya satu signature aktif per `scope + regionId + positionName`.
- Karena MySQL nullable unique dapat tricky, enforcement signature aktif dilakukan di service layer.

### 2.4 Model `TemplatePosition`

Konfigurasi koordinat nomor surat, TTD, dan QR.

```prisma
model TemplatePosition {
  id           String             @id @default(uuid()) @db.VarChar(36)
  scope        LetterScope
  regionId     String?            @map("region_id") @db.VarChar(36)
  documentType LetterDocumentType @map("document_type")
  numberX      Decimal            @map("number_x") @db.Decimal(10, 2)
  numberY      Decimal            @map("number_y") @db.Decimal(10, 2)
  signatureX   Decimal            @map("signature_x") @db.Decimal(10, 2)
  signatureY   Decimal            @map("signature_y") @db.Decimal(10, 2)
  qrX          Decimal            @map("qr_x") @db.Decimal(10, 2)
  qrY          Decimal            @map("qr_y") @db.Decimal(10, 2)
  fontSize     Int                @map("font_size")
  targetPage   Int                @default(1) @map("target_page")
  isActive     Boolean            @default(true) @map("is_active")
  createdById  String             @map("created_by_id") @db.VarChar(36)
  updatedById  String?            @map("updated_by_id") @db.VarChar(36)
  createdAt    DateTime           @default(now()) @map("created_at") @db.DateTime(0)
  updatedAt    DateTime           @updatedAt @map("updated_at") @db.DateTime(0)

  region       Region?            @relation(fields: [regionId], references: [id])
  createdBy    User               @relation("template_positions_created_by", fields: [createdById], references: [id])
  updatedBy    User?              @relation("template_positions_updated_by", fields: [updatedById], references: [id])

  @@index([scope])
  @@index([regionId])
  @@index([documentType])
  @@index([isActive])
  @@index([scope, regionId, documentType])
  @@map("template_positions")
}
```

Rule:

- Satu template aktif per `scope + regionId + documentType`.
- Koordinat memakai PDF coordinate system backend.
- Table ini tidak menyimpan file PDF final.

## 3. Relationship Antar Table

Relasi utama:

```text
Region 1..n Letter
Region 1..n Signature
Region 1..n TemplatePosition

User 1..n Letter.createdBy
User 1..n Letter.updatedBy

User 1..n Signature.createdBy
User 1..n Signature.updatedBy

User 1..n TemplatePosition.createdBy
User 1..n TemplatePosition.updatedBy
```

Rule relasi scope:

- `scope = pusat`: `regionId = null`
- `scope = regional`: `regionId` wajib ada
- `direction = incoming`: gunakan `originNumber`, `senderName`, `receivedAt`, `scanFileUrl`
- `direction = outgoing`: gunakan `letterNumber`, `recipientName`, `signerName`, `finalFileUrl`, `validationQrUrl`

## 4. API Endpoint Design

Base prefix:

```text
/api/sekretariat
```

Error response mengikuti pola existing:

```json
{
  "message": "Pesan error"
}
```

Mutation success response mengikuti pola existing:

```json
{
  "success": true
}
```

### 4.1 Surat Keluar

List:

```http
GET /api/sekretariat/surat-keluar?scope=pusat|regional&regionId=&status=&page=1&limit=20&q=
```

Detail:

```http
GET /api/sekretariat/surat-keluar/:id
```

Create draft:

```http
POST /api/sekretariat/surat-keluar
```

Request:

```json
{
  "scope": "pusat",
  "regionId": null,
  "subject": "Permohonan Narasumber",
  "documentType": "surat_tugas",
  "recipientName": "Nama penerima",
  "signerName": "Nama pimpinan",
  "signerPosition": "Ketua",
  "letterDate": "2026-04-29",
  "notes": "Catatan internal"
}
```

Update draft:

```http
PATCH /api/sekretariat/surat-keluar/:id
```

Finalize:

```http
POST /api/sekretariat/surat-keluar/:id/finalize
```

Backend responsibility on finalize:

- Generate nomor surat final.
- Select active template.
- Select active signature.
- Generate PDF final.
- Generate QR validation.
- Update `letterNumber`, `finalFileUrl`, `validationQrUrl`, `status = finalized`.

Archive:

```http
POST /api/sekretariat/surat-keluar/:id/archive
```

### 4.2 Surat Masuk

List:

```http
GET /api/sekretariat/surat-masuk?scope=pusat|regional&regionId=&status=&page=1&limit=20&q=
```

Detail:

```http
GET /api/sekretariat/surat-masuk/:id
```

Create:

```http
POST /api/sekretariat/surat-masuk
```

Request:

```json
{
  "scope": "regional",
  "regionId": "region-id",
  "originNumber": "001/EXT/IV/2026",
  "senderName": "Nama pengirim",
  "subject": "Undangan kegiatan",
  "documentType": "surat_undangan",
  "letterDate": "2026-04-20",
  "receivedAt": "2026-04-29",
  "notes": "Catatan arsip"
}
```

Update:

```http
PATCH /api/sekretariat/surat-masuk/:id
```

Archive:

```http
POST /api/sekretariat/surat-masuk/:id/archive
```

Reserved upload endpoint:

```http
POST /api/sekretariat/surat-masuk/:id/scan
```

### 4.3 Signature

List:

```http
GET /api/sekretariat/signatures?scope=pusat|regional&regionId=&activeOnly=false
```

Create metadata:

```http
POST /api/sekretariat/signatures
```

Request:

```json
{
  "scope": "pusat",
  "regionId": null,
  "leaderName": "Nama pimpinan",
  "positionName": "Ketua Umum",
  "imageUrl": "/uploads/signatures/file.png",
  "isActive": true
}
```

Update:

```http
PATCH /api/sekretariat/signatures/:id
```

Set active:

```http
POST /api/sekretariat/signatures/:id/activate
```

Reserved upload endpoint:

```http
POST /api/sekretariat/signatures/:id/image
```

### 4.4 Template

List:

```http
GET /api/sekretariat/templates?scope=pusat|regional&regionId=&documentType=&activeOnly=false
```

Create:

```http
POST /api/sekretariat/templates
```

Request:

```json
{
  "scope": "pusat",
  "regionId": null,
  "documentType": "surat_tugas",
  "numberX": 120,
  "numberY": 80,
  "signatureX": 360,
  "signatureY": 640,
  "qrX": 70,
  "qrY": 650,
  "fontSize": 11,
  "targetPage": 1,
  "isActive": true
}
```

Update:

```http
PATCH /api/sekretariat/templates/:id
```

Set active:

```http
POST /api/sekretariat/templates/:id/activate
```

## 5. Data Flow

### 5.1 Surat Masuk Flow

1. Admin membuka halaman Surat Masuk.
2. API list mengambil data sesuai permission.
3. Admin membuat record surat masuk dengan metadata surat asal.
4. Backend menyimpan `direction = incoming` dan `status = registered`.
5. Jika upload scan sudah tersedia nanti, backend menyimpan file dan update `scanFileUrl`.
6. Admin dapat mengarsipkan surat, lalu status menjadi `archived`.
7. Audit minimal memakai `createdById`, `updatedById`, `createdAt`, dan `updatedAt`.

### 5.2 Surat Keluar Flow

1. Admin membuka halaman Surat Keluar.
2. API list mengambil data sesuai permission.
3. Admin membuat draft surat keluar.
4. Backend menyimpan `direction = outgoing`, `status = draft`, dan `letterNumber = null`.
5. Admin melengkapi metadata surat.
6. Saat finalize, backend memilih template aktif dan signature aktif.
7. Backend membuat nomor surat final, file final, dan QR validasi.
8. Backend update `letterNumber`, `finalFileUrl`, `validationQrUrl`, dan `status = finalized`.
9. Frontend hanya menampilkan hasil final dari backend.

## 6. Permission

### 6.1 Admin Pusat

Boleh:

- Melihat semua surat pusat dan regional.
- Membuat surat dengan `scope = pusat`.
- Mengelola signature `scope = pusat`.
- Mengelola template `scope = pusat`.
- Melihat data regional untuk monitoring.

Default rule:

- Admin Pusat tidak mengedit surat regional kecuali endpoint/kebijakan khusus disiapkan.
- Jika `scope = pusat`, `regionId` harus null.
- Jika `scope = regional`, `regionId` digunakan sebagai filter monitoring.

### 6.2 Admin Regional

Boleh:

- Melihat data `scope = regional` miliknya sendiri.
- Membuat surat masuk/keluar regional.
- Mengelola signature regional miliknya.
- Mengelola template regional miliknya.

Tidak boleh:

- Melihat data regional lain.
- Membuat atau mengubah data `scope = pusat`.
- Mengirim `regionId` berbeda dari `profile.regionId`.
- Finalisasi surat pusat.

Backend wajib derive `regionId` dari authenticated profile untuk Admin Regional, bukan percaya penuh dari request body.

## 7. Response Format API

### 7.1 List Letters

```json
{
  "success": true,
  "letters": [
    {
      "id": "uuid",
      "direction": "outgoing",
      "scope": "pusat",
      "regionId": null,
      "region": null,
      "letterNumber": "001/MPJ/IV/2026",
      "originNumber": null,
      "subject": "Surat Tugas",
      "documentType": "surat_tugas",
      "senderName": null,
      "recipientName": "Nama penerima",
      "signerName": "Nama pimpinan",
      "signerPosition": "Ketua",
      "letterDate": "2026-04-29T00:00:00.000Z",
      "receivedAt": null,
      "status": "finalized",
      "finalFileUrl": "/uploads/letters/final.pdf",
      "scanFileUrl": null,
      "validationQrUrl": "/uploads/qr/letter-id.png",
      "createdAt": "2026-04-29T10:00:00.000Z",
      "updatedAt": "2026-04-29T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### 7.2 Detail Letter

```json
{
  "success": true,
  "letter": {
    "id": "uuid",
    "direction": "incoming",
    "scope": "regional",
    "regionId": "region-id",
    "region": {
      "id": "region-id",
      "name": "Jawa Timur",
      "code": "35"
    },
    "originNumber": "001/EXT/IV/2026",
    "subject": "Undangan kegiatan",
    "documentType": "surat_undangan",
    "senderName": "Nama pengirim",
    "letterDate": "2026-04-20T00:00:00.000Z",
    "receivedAt": "2026-04-29T00:00:00.000Z",
    "status": "registered",
    "scanFileUrl": "/uploads/letters/scan.pdf",
    "notes": "Catatan arsip",
    "createdBy": {
      "id": "user-id",
      "email": "admin@example.com"
    },
    "createdAt": "2026-04-29T10:00:00.000Z",
    "updatedAt": "2026-04-29T10:00:00.000Z"
  }
}
```

### 7.3 Signature List

```json
{
  "success": true,
  "signatures": [
    {
      "id": "uuid",
      "scope": "pusat",
      "regionId": null,
      "leaderName": "Nama pimpinan",
      "positionName": "Ketua Umum",
      "imageUrl": "/uploads/signatures/file.png",
      "isActive": true,
      "createdAt": "2026-04-29T10:00:00.000Z",
      "updatedAt": "2026-04-29T10:00:00.000Z"
    }
  ]
}
```

### 7.4 Template List

```json
{
  "success": true,
  "templates": [
    {
      "id": "uuid",
      "scope": "pusat",
      "regionId": null,
      "documentType": "surat_tugas",
      "numberX": 120,
      "numberY": 80,
      "signatureX": 360,
      "signatureY": 640,
      "qrX": 70,
      "qrY": 650,
      "fontSize": 11,
      "targetPage": 1,
      "isActive": true,
      "createdAt": "2026-04-29T10:00:00.000Z",
      "updatedAt": "2026-04-29T10:00:00.000Z"
    }
  ]
}
```

## 8. Acceptance Criteria Untuk Implementasi Nanti

- Schema migration hanya menambah table/enum yang diperlukan.
- API menggunakan auth token existing dan `authenticate` guard existing.
- Response error tetap `{ "message": "..." }`.
- Response success mutation tetap `{ "success": true }`.
- Admin Regional tidak pernah bisa membaca/mengubah data regional lain.
- Finalisasi surat keluar dilakukan backend, bukan frontend.
- Frontend tetap aman menampilkan empty state ketika data kosong.
