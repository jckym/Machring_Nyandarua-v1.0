# Machinery Ring Nyandarua Dashboard

A role-based operations dashboard for Machinery Ring Nyandarua. The application helps administrators, managers, Local MR coordinators, and TOTs track farmers, product sales, commissions, machinery usage, field visits, trainings, notifications, reports, and audit activity from one Supabase-backed web app.

## Contents

- [Overview](#overview)
- [Features](#features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Modular Architecture](#modular-architecture)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Available Scripts](#available-scripts)
- [Supabase Backend](#supabase-backend)
- [Application Routes](#application-routes)
- [Reporting and Exports](#reporting-and-exports)
- [PWA Support](#pwa-support)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)

## Overview

Machinery Ring Nyandarua Dashboard is a React and Supabase application built for field operations and branch performance monitoring. It supports the day-to-day work of managing farmers, TOT activity, Local MR branches, agricultural products, sales records, commission tracking, machinery bookings, service history, trainings, visits, and operational reports.

The app is designed around authenticated users and role-aware navigation. Each user sees the dashboard and tools relevant to their responsibilities.

## Features

- Role-specific dashboards for Admin, Manager, Local MR Coordinator, and TOT users.
- Farmer registry with farmer profiles and private farmer data support.
- Sales tracking with product, quantity, revenue, and commission details.
- Commission summaries and payout-focused views.
- Machinery inventory, booking, service history, and maintenance tracking.
- Mechanisation performance overview.
- Field visit logging, visit details, follow-up tracking, and overdue follow-up alerts.
- Training management with attendee tracking for farmers and TOTs.
- TOT and Local MR performance monitoring.
- User management for administrators.
- Notifications and notification settings.
- Audit trail and system logs for administrative oversight.
- Reports exportable to PDF and Excel.
- PWA support for installable app behavior and cached assets.

## User Roles

The app uses Supabase authentication plus role records stored in the `user_roles` table.

| Role | Main Access |
| --- | --- |
| `admin` | Full access to dashboards, users, Local MRs, TOTs, products, machinery, farmers, sales, trainings, visits, reports, notifications, logs, audit trail, and settings. |
| `manager` | Organization-wide read access to Local MRs, TOTs, farmers, sales, machinery, visits, trainings, products, commissions, reports, and notifications. |
| `local_mr_coordinator` | Local MR scoped access to TOT overview, farmers, sales, machinery, visits, trainings, products, reports, and commissions. |
| `tot` | TOT-focused access to assigned farmers, sales, machinery, visits, trainings, products, and personal commission data. |

The frontend protects routes through `ProtectedRoute`, while Supabase database policies and edge functions should enforce backend access rules.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Supabase Auth, Database, Realtime, and Edge Functions
- Tailwind CSS
- shadcn/ui and Radix UI primitives
- Lucide React icons
- Recharts
- jsPDF, jsPDF AutoTable, ExcelJS, and XLSX for exports
- vite-plugin-pwa for PWA behavior

## Project Structure

```text
.
|-- backend/                    Future API/server-side service layer
|   |-- api/
|   |-- auth/
|   |-- config/
|   |-- modules/
|   |-- shared/
|   |-- jobs/
|   `-- tests/
|-- frontend/                   Active React/Vite dashboard application
|   |-- public/
|   |-- src/
|   |   |-- app/
|   |   |-- modules/
|   |   |-- components/
|   |   |-- contexts/
|   |   |-- hooks/
|   |   |-- integrations/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- styles/
|   |   |-- types/
|   |   `-- utils/
|   |-- tests/
|   |-- package.json
|   `-- vite.config.ts
|-- database/                   Database organization mirror
|   |-- migrations/
|   |-- seeders/
|   |-- schemas/
|   |-- functions/
|   |-- triggers/
|   |-- policies/
|   |-- backups/
|   `-- README.md
|-- shared/                     Cross-app shared contracts and utilities
|-- infrastructure/             Docker, nginx, monitoring, scripts, and CI/CD assets
|-- docs/                       API, architecture, deployment, and user guides
|-- .github/workflows/
|-- supabase/
|   |-- functions/              Supabase Edge Functions kept for Supabase CLI compatibility
|   `-- migrations/             Database schema migrations kept for Supabase CLI compatibility
|-- package.json
`-- README.md
```

## Modular Architecture

The app now uses a v2 monorepo-style structure. The active frontend application lives in `frontend/`, while backend, database, shared, infrastructure, and docs areas are separated for future growth.

Frontend module areas:

- `auth`
- `dashboard`
- `farmers`
- `machinery`
- `trainings`
- `reports`
- `notifications`
- `visits`
- `products`
- `sales`
- `tots`
- `users`

Recommended structure for each feature:

```text
frontend/src/modules/module-name/
|-- components/   Components used only by this feature
|-- hooks/        Feature-specific hooks
|-- pages/        Route screens owned by this feature
|-- services/     Supabase queries, mutations, and side effects
|-- types.ts      Feature-specific types
`-- index.ts      Public exports for other parts of the app
```

Architecture rules:

- Keep shared UI in `frontend/src/components/ui`.
- Keep layout components in `frontend/src/components/layout`.
- Keep global providers in `frontend/src/contexts`.
- Keep Supabase client setup in `frontend/src/integrations`.
- Keep cross-feature helpers in `frontend/src/lib`.
- Avoid importing another feature's internal files directly. Use that feature's `index.ts` when sharing is needed.

The app also uses route-level error boundaries through `frontend/src/components/errors/RouteErrorBoundary.tsx`. Each main route is wrapped independently, so if Farmers, Sales, Reports, or another section fails during rendering, the user sees a contained error message for that section while the rest of the dashboard remains available.

The original root-level `src/`, `public/`, and config files are temporarily retained as a compatibility copy. Root npm scripts now target `frontend/`, so the v2 structure is the active application path.

## Prerequisites

- Node.js 18 or newer
- npm
- A Supabase project with the included migrations applied
- Supabase project URL and publishable anon key

Optional tools:

- Supabase CLI, if you need to run or deploy migrations and edge functions from your machine.

## Environment Variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Do not commit real secrets. Frontend variables prefixed with `VITE_` are bundled into the client, so only use public or publishable keys there.

Supabase Edge Functions also rely on server-side Supabase environment variables such as:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Keep `SUPABASE_SERVICE_ROLE_KEY` only in Supabase function secrets or trusted server environments.

## Local Development

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

The Vite dev server is configured to run on:

```text
http://localhost:8080
```

If PowerShell blocks `npm run dev` with an execution policy error, run this once for your Windows user:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then reopen PowerShell and run `npm run dev` again.

## Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build. |
| `npm run build:dev` | Create a development-mode build. |
| `npm run lint` | Run ESLint across the codebase. |
| `npm run preview` | Preview the production build locally. |

## Supabase Backend

The application uses Supabase for authentication, database access, realtime updates, and edge functions.

Important database areas include:

- `profiles`
- `user_roles`
- `local_mrs`
- `tot_assignments`
- `farmers`
- `farmer_private_data`
- `products`
- `sales`
- `machinery`
- `machinery_bookings`
- `machinery_service_history`
- `mechanisation_jobs`
- `trainings`
- `training_attendees`
- `visits`
- `commission_payouts`
- `notifications`
- `notification_settings`
- `audit_logs`

Included edge functions:

- `bootstrap-admin`
- `create-user`
- `delete-user`
- `followup-reminders`
- `purge-farmer`
- `purge-user-by-email`
- `send-notification-email`

Apply migrations and deploy functions through your Supabase workflow before using the app in production.

## Application Routes

Public routes:

- `/auth`
- `/login`
- `/forgot-password`
- `/reset-password`
- `/install`

Protected shared routes:

- `/dashboard`
- `/farmers`
- `/farmers/:id`
- `/sales`
- `/machinery`
- `/products`
- `/visits`
- `/visits/:id`
- `/trainings`
- `/trainings/:id`
- `/settings`
- `/support`
- `/commission`
- `/notifications`

Role-restricted routes:

- `/dashboard/admin` - Admin
- `/dashboard/manager` - Manager and Admin
- `/dashboard/local-mr` - Local MR Coordinator and Admin
- `/dashboard/tot` - TOT, Local MR Coordinator, Manager, and Admin
- `/reports` - Admin, Manager, and Local MR Coordinator
- `/tots` - Local MR Coordinator, Manager, and Admin
- `/local-mrs` - Manager and Admin
- `/local-mrs/:id` - Manager and Admin
- `/users` - Admin
- `/audit` - Admin
- `/system-logs` - Admin

## Reporting and Exports

The Reports page can export operational data as PDF or Excel files. Supported report groups include:

- Sales
- Farmers
- Machinery
- Trainings
- Visits
- Commissions
- Performance
- Branch performance

Reports support date filtering where the underlying record includes a date field.

## PWA Support

The app is configured with `vite-plugin-pwa`.

PWA behavior includes:

- Installable app manifest.
- Auto-updating service worker.
- Static asset caching.
- Network-first runtime caching for Supabase API calls.

The PWA manifest names the app as `Machinery Ring Nyandarua - Operations Dashboard` with the short name `MR Nyandarua`.

## Deployment Notes

Before deploying:

1. Confirm `.env` values are configured in the hosting environment.
2. Run a production build with `npm run build`.
3. Apply Supabase migrations to the target Supabase project.
4. Deploy required Supabase Edge Functions.
5. Configure Supabase function secrets for service-role operations.
6. Confirm authentication redirect URLs include the deployed domain.

For Vercel or similar static hosting, serve the generated `dist` folder after `npm run build`.

## Troubleshooting

### PowerShell blocks `npm run dev`

Run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Close and reopen PowerShell, then run:

```powershell
npm run dev
```

### Supabase connection fails

Check that `.env` contains:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Restart the dev server after changing environment variables.

### Login succeeds but the app does not load user data

Confirm the user has:

- A matching row in `profiles`.
- A matching row in `user_roles`.
- An active status in `profiles.status`.
- A `tot_assignments` row if the user is a TOT or Local MR Coordinator.

### Admin user creation fails

Confirm the `create-user` edge function is deployed and has access to:

```env
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Also confirm the signed-in user has the `admin` role in `user_roles`.
