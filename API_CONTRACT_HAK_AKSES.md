# API Contract - Hak Akses (Roles Management)

Base URL: `https://api.mpjapps.com/api/v1`

Authentication: Bearer Token (JWT)

---

## 1. Get All Roles

**Endpoint**: `GET /roles`

**Description**: Mengambil daftar semua role dan hak akses

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|-----------|-------------|
| page | number | No | Nomor halaman (default: 1) |
| limit | number | No | Jumlah data per halaman (default: 10) |
| search | string | No | Cari berdasarkan nama role |
| sort_by | string | No | Urutkan berdasarkan: `nama` atau `created_at` |
| sort_order | string | No | Urutan: `asc` atau `desc` (default: `desc`) |

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "75d055eb-f4a4-4f47-acbd-d202b19a71fc",
      "nama": "Admin Pusat",
      "is_super_admin": false,
      "akses": {
        "user-identitas": { "view": true, "create": false, "update": false, "delete": false },
        "user-administrasi": { "view": true, "create": true, "update": true, "delete": false },
        "admin-pusat-administrasi": { "view": true, "create": true, "update": true, "delete": false },
        "user-tim": { "view": true, "create": true, "update": true, "delete": false },
        "user-eid": { "view": true, "create": false, "update": false, "delete": false },
        "user-event": { "view": true, "create": false, "update": false, "delete": false },
        "admin-pusat-manajemen-event": { "view": true, "create": true, "update": false, "delete": false },
        "admin-regional-validasi-pendaftar": { "view": true, "create": false, "update": true, "delete": false },
        "admin-finance-verifikasi": { "view": true, "create": false, "update": true, "delete": false },
        "admin-regional-laporan-dokumentasi": { "view": true, "create": false, "update": false, "delete": false },
        "admin-regional-late-payment": { "view": true, "create": false, "update": false, "delete": false },
        "admin-regional-download-center": { "view": true, "create": false, "update": false, "delete": false },
        "admin-finance-laporan": { "view": true, "create": false, "update": false, "delete": false },
        "admin-pusat-master-data": { "view": true, "create": false, "update": false, "delete": false },
        "admin-pusat-master-regional": { "view": true, "create": false, "update": false, "delete": false },
        "admin-regional-data-master": { "view": true, "create": false, "update": false, "delete": false },
        "admin-finance-harga": { "view": true, "create": true, "update": true, "delete": false },
        "admin-finance-clearing": { "view": true, "create": false, "update": false, "delete": false },
        "admin-finance-regional-monitoring": { "view": true, "create": false, "update": false, "delete": false },
        "user-hub": { "view": true, "create": false, "update": false, "delete": false },
        "admin-pusat-mpj-hub": { "view": true, "create": false, "update": false, "delete": false },
        "admin-pusat-manajemen-militansi": { "view": true, "create": false, "update": false, "delete": false },
        "super-admin-user-management": { "view": false, "create": false, "update": false, "delete": false },
        "super-admin-hierarchy": { "view": false, "create": false, "update": false, "delete": false },
        "super-admin-hak-akses": { "view": false, "create": false, "update": false, "delete": false },
        "user-pengaturan": { "view": true, "create": false, "update": false, "delete": false },
        "admin-pusat-pengaturan": { "view": true, "create": false, "update": false, "delete": false },
        "admin-regional-pengaturan": { "view": true, "create": false, "update": false, "delete": false },
        "admin-finance-pengaturan": { "view": true, "create": false, "update": false, "delete": false },
        "super-admin-settings": { "view": false, "create": false, "update": false, "delete": false }
      },
      "created_at": "2026-03-15T10:30:00.000Z",
      "updated_at": "2026-03-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "total_pages": 1
  }
}
```

---

## 2. Get Role by ID

**Endpoint**: `GET /roles/{id}`

**Description**: Mengambil detail role berdasarkan ID

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|-----------|-------------|
| id | string (UUID) | Yes | ID role |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "75d055eb-f4a4-4f47-acbd-d202b19a71fc",
    "nama": "Admin Pusat",
    "is_super_admin": false,
    "akses": { ... },
    "created_at": "2026-03-15T10:30:00.000Z",
    "updated_at": "2026-03-15T10:30:00.000Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Role tidak ditemukan"
}
```

---

## 3. Create Role

**Endpoint**: `POST /roles`

**Description**: Membuat role baru

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "nama": "Staff",
  "is_super_admin": false,
  "akses": {
    "user": { "view": true, "create": true, "update": false, "delete": false },
    "roles": { "view": true, "create": false, "update": false, "delete": false },
    "item": { "view": false, "create": false, "update": false, "delete": false },
    "satuan": { "view": false, "create": false, "update": false, "delete": false },
    "supplier": { "view": false, "create": false, "update": false, "delete": false },
    "kasir": { "view": false, "create": false },
    "kasir-baru": { "view": false, "create": false },
    "penerimaan": { "view": false, "create": false, "update": false, "delete": false },
    "pengeluaran": { "view": false, "create": false, "update": false, "delete": false },
    "pencatatan-kas": { "view": false, "create": false, "update": false, "delete": false },
    "laporan": { "penjualan": false, "arus-kas": false, "kartu-stok": false }
  }
}
```

**Request Body Schema**:
| Field | Type | Required | Description |
|-------|-------|-----------|-------------|
| nama | string | Yes | Nama role |
| is_super_admin | boolean | Yes | Status super admin |
| akses | object | Yes | Object permission per menu |

**akses Object Schema**:
Setiap key dalam `akses` memiliki struktur:
```typescript
{
  "menu-id": {
    "view": boolean,      // true/false
    "create": boolean,   // true/false
    "update": boolean,   // true/false
    "delete": boolean    // true/false
  }
}
```

**Daftar Menu IDs yang Tersedia**:

| Group | Menu ID | Label |
|-------|----------|-------|
| Identitas & Administrasi | `user-identitas` | IDENTITAS PESANTREN |
| | `user-administrasi` | ADMINISTRASI (User) |
| | `admin-pusat-administrasi` | ADMINISTRASI (Admin Pusat) |
| Manajemen Kru | `user-tim` | MANAJEMEN KRU |
| | `user-eid` | EID ASET |
| Event | `user-event` | EVENT |
| | `admin-pusat-manajemen-event` | MANAJEMEN EVENT (Admin Pusat) |
| | `admin-regional-manajemen-event` | MANAJEMEN EVENT (Admin Regional) |
| Verifikasi | `admin-regional-validasi-pendaftar` | VALIDASI PENDAFTAR |
| | `admin-finance-verifikasi` | VERIFIKASI |
| Laporan & Dokumen | `admin-regional-laporan-dokumentasi` | LAPORAN & DOKUMENTASI |
| | `admin-regional-late-payment` | LATE PAYMENT |
| | `admin-regional-download-center` | DOWNLOAD CENTER |
| | `admin-finance-laporan` | LAPORAN |
| Master Data | `admin-pusat-master-data` | MASTER DATA |
| | `admin-pusat-master-regional` | MASTER REGIONAL |
| | `admin-regional-data-master` | DATA MASTER |
| Keuangan | `admin-finance-harga` | HARGA |
| | `admin-finance-clearing` | CLEARING |
| | `admin-finance-regional-monitoring` | REGIONAL MONITORING |
| Hub & Militansi | `user-hub` | MPJ HUB (User) |
| | `admin-pusat-mpj-hub` | MPJ HUB (Admin Pusat) |
| | `admin-pusat-manajemen-militansi` | MANAJEMEN MILITANSI |
| User & Akses | `super-admin-user-management` | USER MANAGEMENT |
| | `super-admin-hierarchy` | HIERARKI DATA |
| | `super-admin-hak-akses` | HAK AKSES |
| Pengaturan | `user-pengaturan` | PENGATURAN (User) |
| | `admin-pusat-pengaturan` | PENGATURAN (Admin Pusat) |
| | `admin-regional-pengaturan` | PENGATURAN (Admin Regional) |
| | `admin-finance-pengaturan` | PENGATURAN (Admin Finance) |
| | `super-admin-settings` | SETTINGS (Super Admin) |

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Hak akses berhasil dibuat",
  "data": {
    "id": "75d055eb-f4a4-4f47-acbd-d202b19a71fc",
    "nama": "Staff",
    "is_super_admin": false,
    "akses": { ... },
    "created_at": "2026-03-15T10:30:00.000Z",
    "updated_at": "2026-03-15T10:30:00.000Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "message": "Nama role wajib diisi"
}
```

---

## 4. Update Role

**Endpoint**: `PUT /roles/{id}`

**Description**: Mengupdate role yang sudah ada

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|-----------|-------------|
| id | string (UUID) | Yes | ID role |

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "id": "75d055eb-f4a4-4f47-acbd-d202b19a71fc",
  "nama": "Staff",
  "is_super_admin": false,
  "akses": {
    "user": { "view": true, "create": true, "update": false, "delete": false },
    "roles": { "view": true, "create": false, "update": false, "delete": false }
  }
}
```

**Request Body Schema**:
| Field | Type | Required | Description |
|-------|-------|-----------|-------------|
| id | string (UUID) | Yes | ID role |
| nama | string | Yes | Nama role |
| is_super_admin | boolean | Yes | Status super admin |
| akses | object | Yes | Object permission per menu |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Hak akses berhasil diperbarui",
  "data": {
    "id": "75d055eb-f4a4-4f47-acbd-d202b19a71fc",
    "nama": "Staff",
    "is_super_admin": false,
    "akses": { ... },
    "created_at": "2026-03-15T10:30:00.000Z",
    "updated_at": "2026-03-15T14:30:00.000Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Role tidak ditemukan"
}
```

---

## 5. Delete Role

**Endpoint**: `DELETE /roles/{id}`

**Description**: Menghapus role

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|-------|-----------|-------------|
| id | string (UUID) | Yes | ID role |

**Request Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Hak akses berhasil dihapus"
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "message": "Role tidak ditemukan"
}
```

---

## Common Error Responses

| Status Code | Description | Response |
|-------------|-------------|-----------|
| 401 Unauthorized | Token tidak valid atau expired | `{ "success": false, "message": "Unauthorized" }` |
| 403 Forbidden | Tidak memiliki akses | `{ "success": false, "message": "Forbidden" }` |
| 500 Internal Server Error | Error server | `{ "success": false, "message": "Internal server error" }` |

---

## Notes

1. **Authentication**: Semua endpoint memerlukan Bearer token di header `Authorization`
2. **Permission**: Hanya Super Admin yang bisa mengakses endpoint ini
3. **Validation**:
   - `nama` tidak boleh kosong
   - Minimal satu permission harus dipilih (view/create/update/delete salah satu true)
4. **ID Format**: Semua ID menggunakan format UUID v4
5. **Timestamp**: Format ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)

---

## Example Usage

### cURL Example - Create Role
```bash
curl 'https://api.mpjapps.com/api/v1/roles' \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --data-raw '{
    "nama": "Staff",
    "is_super_admin": false,
    "akses": {
      "user": { "view": true, "create": true, "update": false, "delete": false },
      "roles": { "view": true, "create": false, "update": false, "delete": false }
    }
  }'
```

### cURL Example - Update Role
```bash
curl 'https://api.mpjapps.com/api/v1/roles/75d055eb-f4a4-4f47-acbd-d202b19a71fc' \
  -X PUT \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --data-raw '{
    "id": "75d055eb-f4a4-4f47-acbd-d202b19a71fc",
    "nama": "Staff",
    "is_super_admin": false,
    "akses": {
      "user": { "view": true, "create": true, "update": true, "delete": false },
      "roles": { "view": true, "create": true, "update": false, "delete": false }
    }
  }'
```

### JavaScript/Fetch Example
```javascript
const response = await fetch('https://api.mpjapps.com/api/v1/roles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    nama: 'Staff',
    is_super_admin: false,
    akses: {
      'user-identitas': { view: true, create: true, update: false, delete: false },
      'user-administrasi': { view: true, create: false, update: false, delete: false }
    }
  })
});

const result = await response.json();
console.log(result);
```

---

**Document Version**: 1.0
**Last Updated**: 2026-03-15
**Created by**: Frontend Team - MPJ Apps v3
