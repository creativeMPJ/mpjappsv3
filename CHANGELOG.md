# Changelog

All notable changes to this project will be documented in this file.

## [2026-02-13] - Supabase to Local PostgreSQL + Prisma Migration

### Added
- Prisma data model and migrations in `prisma/`.
- Local API backend using Fastify in `server/`.
- Auth, claims, institution, payments, media, regional, admin, and public API routes.
- Seed scripts:
  - `server/scripts/seed-base-data.ts`
  - `server/scripts/seed-admin.ts`
- Frontend API helper `src/lib/api-client.ts`.

### Changed
- Frontend data access migrated from direct Supabase usage to local API endpoints.
- Dashboard and management flows updated for:
  - Admin Pusat
  - Admin Regional
  - Media/User
  - Public views
- Payment and activation flow integrated with new backend.
- Regional settings and assistant pages aligned with API-based flow.
- Project scripts updated in `package.json` for Prisma migration/generate/seed and API dev server.

### Removed
- Supabase client integration files:
  - `src/integrations/supabase/client.ts`
  - `src/integrations/supabase/types.ts`
- Legacy Supabase folder and assets under `supabase/`.
- Supabase environment usage from runtime code.

### Notes
- Local environment secrets (like `.env`) are intentionally excluded from Git commits.
- Migration commit reference: `69b52e0` on `main`.
