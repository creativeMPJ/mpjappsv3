# Project Summary: MPJ Event Management System

## Overview
This project is a comprehensive **Event Management System** designed for the MPJ platform. It includes features for event creation, registration, ticketing, scanning (QR), and multi-role administrative dashboards. The system is built with a modern tech stack ensuring scalability and a premium user experience.

## Tech Stack
### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Routing**: React Router DOM
- **State Management/Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Maps**: React Leaflet, React Simple Maps
- **Charts**: Recharts
- **PDF/Image Generation**: html2canvas

### Backend
- **Framework**: Fastify (Node.js)
- **Runtime**: tsx (for running TypeScript directly)
- **Database ORM**: Prisma
- **Authentication**: JWT (@fastify/jwt)
- **File Uploads**: @fastify/multipart
- **Utilities**: bcryptjs (hashing), date-fns

## Project Structure
```
mpj-app/
├── prisma/               # Database schema and migrations
├── server/               # Fastify backend source code
│   ├── routes/           # API endpoints
│   ├── scripts/          # Seeding and utility scripts
│   └── index.ts          # Backend entry point
├── src/                  # Frontend source code
│   ├── components/       # Reusable UI components
│   │   ├── admin-pusat/  # Components for Pusat Admin
│   │   └── ui/           # Shadcn UI components
│   ├── contexts/         # React Contexts (e.g., AuthContext)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components (Dashboards, Event views)
│   ├── lib/              # Utility libraries
│   ├── shared/           # Shared types and constants
│   ├── App.tsx           # Main App component with routing
│   └── main.tsx          # Frontend entry point
├── public/               # Static assets
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── tailwind.config.ts    # Tailwind CSS configuration
```

## Key Features
1.  **Multi-Role Dashboard**: Tailored interfaces for Super Admin, Admin Pusat, Admin Regional, Finance, Media, and Crew.
2.  **Event Management**: Full CRUD for events, including categories, schedules, and locations.
3.  **Registration & Ticketing**: Public event listing, registration forms, and QR-code based ticket generation.
4.  **Payment System**: Integration for payment processing and status tracking.
5.  **Attendance Scanning**: Mobile-friendly QR scanner for event crews to check in participants.
6.  **Permission System (Hak Akses)**: Granular control over menu items and actions based on user roles.
7.  **Data Export**: Capability to export participant data to Excel (XLSX).

## Available Scripts
- `npm run dev`: Start the Vite development server for the frontend.
- `npm run dev:api`: Start the Fastify backend server.
- `npm run build`: Build the frontend for production.
- `npm run db:migrate`: Run Prisma migrations.
- `npm run db:seed-all-roles`: Seed the database with initial role and permission data.

## Current Progress & Documentation
- **Hak Akses**: Detailed in `API_CONTRACT_HAK_AKSES.md`.
- **Recent Work**: Focused on integrating the "MASTER EVENT" hierarchical navigation and the 6-tab event management interface for Admin Pusat.
