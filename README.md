# MPJ Apps v3

Platform manajemen registrasi, verifikasi, pembayaran aktivasi, dan pengelolaan data pesantren/media MPJ.

## Stack

- Frontend: Vite + React + TypeScript + Tailwind + shadcn/ui
- Backend API: Fastify + TypeScript
- Database: PostgreSQL (local)
- ORM: Prisma
- Auth: JWT (Bearer Token)

## Role Utama

- `user`
- `admin_regional`
- `admin_pusat`
- `admin_finance`

## Alur Inti

1. User daftar/login.
2. User ajukan klaim/pendaftaran pesantren.
3. Admin Regional verifikasi (`approve/reject`).
4. Jika lolos regional, user masuk tahap pembayaran.
5. User upload bukti transfer.
6. Admin Pusat/Finance verifikasi pembayaran.
7. Jika valid, akun aktif dan NIP/NIAM diproses.

## Prasyarat

- Node.js 20+
- PostgreSQL lokal
- npm

## Konfigurasi Environment

Buat file `.env`:

```env
DATABASE_URL="postgresql://mpjappsv3_user:<password>@localhost:5432/mpjappsv3_local?schema=public"
JWT_SECRET="change-this-jwt-secret-please"
API_PORT="3001"
```

## Instalasi dan Menjalankan

```sh
npm i
npm run db:generate
npm run db:migrate
npm run db:seed-base
npm run db:seed-admin
```

Jalankan API:

```sh
npm run dev:api
```

Jalankan Frontend:

```sh
npm run dev
```

## Akun Admin Default

- Email: `admin@gmail.com`
- Password: `bismillah`

Jika perlu ubah default:
- `ADMIN_EMAIL` dan `ADMIN_PASSWORD` saat menjalankan `npm run db:seed-admin`.

## Script Penting

- `npm run dev` -> frontend
- `npm run dev:api` -> backend API
- `npm run build` -> build frontend
- `npm run db:generate` -> generate Prisma client
- `npm run db:migrate` -> apply migration
- `npm run db:seed-base` -> seed data referensi
- `npm run db:seed-admin` -> seed admin pusat

## Struktur Folder

- `src/` -> frontend
- `server/` -> API Fastify
- `prisma/` -> schema + migrations
- `uploads/` -> file upload bukti pembayaran (runtime)

## Endpoint Ringkas

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `GET /api/public/*`
- `GET/POST /api/claims/*`
- `GET/POST /api/institutions/*`
- `GET/POST /api/payments/*`
- `GET/POST /api/regional/*`
- `GET/POST /api/media/*`
- `GET/POST /api/admin/*`

## Release Checklist

### 1) Prepare

```sh
npm i
npm run db:generate
npm run build
```

### 2) Database

```sh
npm run db:migrate
npm run db:seed-base
npm run db:seed-admin
```

### 3) Validate Core Flow

- Login admin pusat.
- Uji registrasi/klaim user.
- Uji approve/reject regional.
- Uji submit bukti pembayaran.
- Uji approve/reject pembayaran.

### 4) Changelog & Release

- Update `CHANGELOG.md`.
- Commit dan push:

```sh
git add -A
git commit -m "release: vX.Y.Z"
git push origin main
```
