# Learning platform development
# DGG Learning Platform

This repository contains a Next.js app (App Router) for a learning platform used by instructors and students. It includes UI components, Supabase integration, server-side routes, and database setup scripts.

## Key points
- Framework: Next.js (App Router) — see the `app/` folder for pages and routes.
- Database: Supabase (client code under `lib/supabase`).
- SQL setup: see the `scripts/` folder for schema/migration SQL files.

## Quick start

Prerequisites:
- Node.js (v18+ recommended)
- pnpm or npm

Install dependencies:

```bash
pnpm install
# or
npm install
```

Run the dev server:

```bash
pnpm dev
# or
npm run dev
```

Build for production:

```bash
pnpm build
# or
npm run build
```

Start (production):

```bash
pnpm start
# or
npm start
```

## Environment
Create a `.env` file (or set environment variables) with at least the following for Supabase integration:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (only on server side / in Vercel secret)

Other secrets or config may be required depending on your deployment; check `lib/supabase` and `app/api` routes for specifics.

## Project layout (high-level)

- `app/` — Next.js App Router pages, nested layouts, and API routes.
	- `app/instructor/` and `app/student/` contain role-specific pages.
- `components/` — shared React components and UI primitives.
- `lib/` — utilities, Supabase helpers, and YouTube helpers.
- `scripts/` — SQL files to create tables and triggers.
- `public/` — static assets.

## Database / migrations
Run the SQL files in `scripts/` against your Supabase Postgres database to create tables and triggers. Files are named in execution order (001_.., 002_.., etc.).

## Deployment
This app is configured to deploy on Vercel. Ensure environment variables are set in your Vercel project dashboard. After pushing changes the app will be rebuilt and redeployed.

## Troubleshooting
- 404 for a route (e.g., `/instructor/assignments`): ensure a matching `page.tsx` exists in `app/instructor/assignments` (App Router requires `page.tsx` for index routes). If you expect an API route, ensure `route.ts` exports the HTTP methods.
- Build errors: check Vercel build logs for TypeScript/Next errors and missing env values.

## Useful scripts
- `pnpm dev` — runs the Next dev server
- `pnpm build` — builds the app
- `pnpm start` — starts the production server (uses `server.js`)

## Where to look next
- Instructor pages: `app/instructor/*`
- Student pages: `app/student/*`
- Supabase client: `lib/supabase/client.ts`
- Custom server entry: `server.js`


