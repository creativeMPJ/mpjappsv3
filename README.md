# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/711e2be5-b7ef-4a32-94fa-faceb8d1ef14

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/711e2be5-b7ef-4a32-94fa-faceb8d1ef14) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/711e2be5-b7ef-4a32-94fa-faceb8d1ef14) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Local PostgreSQL + Prisma + API

This repository now includes a local backend API with Fastify and Prisma.

### Required environment variables

Add these values in `.env`:

```env
DATABASE_URL="postgresql://mpjappsv3_user:<password>@localhost:5432/mpjappsv3_local?schema=public"
JWT_SECRET="change-this-jwt-secret-please"
API_PORT="3001"
```

### Backend commands

```sh
# Generate Prisma client
npm run db:generate

# Run DB migrations
npm run db:migrate

# Seed admin pusat account (default: admin@gmail.com / bismillah)
npm run db:seed-admin

# Seed base reference data (region/city/settings)
npm run db:seed-base

# Start API server
npm run dev:api
```

### API endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token required)
- `POST /api/auth/change-password` (Bearer token required)
- `GET /api/public/cities`
- `GET /api/public/cities/:id/region`
- `GET /api/public/pesantren?search=...`
- `GET /api/claims/search?query=...`
- `POST /api/claims/send-otp`
- `POST /api/claims/verify-otp`
- `GET /api/institutions/ownership` (Bearer token required)
- `GET /api/institutions/pending-status` (Bearer token required)
- `POST /api/institutions/upload-registration-document` (Bearer token required)
- `POST /api/institutions/initial-data` (Bearer token required)
- `POST /api/institutions/location` (Bearer token required)
- `GET /api/payments/current` (Bearer token required)
- `POST /api/payments/submit-proof` (Bearer token required)
- `GET /api/admin/*` and `POST /api/admin/*` (admin pusat only)

## Release Checklist

Use this checklist before every release.

### 1) Prepare

```sh
npm i
npm run db:generate
npm run build
```

### 2) Database

```sh
# Run migrations on target environment
npm run db:migrate

# Optional (first setup only)
npm run db:seed-base
npm run db:seed-admin
```

### 3) Validate core flows

- Login as `admin_pusat`.
- Create/register user and verify claim flow.
- Regional approve/reject flow.
- Payment submit + admin approval/rejection flow.
- Public directory search and profile pages.

### 4) Changelog and versioning

- Move release notes from `Unreleased` to a new version in `CHANGELOG.md` (example: `0.2.1`).
- Add release date.
- Ensure notes include `Added/Changed/Fixed/Removed` as needed.

### 5) Git release

```sh
git add -A
git commit -m "release: vX.Y.Z"
git push origin main
```

Optional tag:

```sh
git tag vX.Y.Z
git push origin vX.Y.Z
```
