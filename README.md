College Discovery
=================

Summary
-------
College Discovery is a monorepo with a Next.js frontend (using Supabase directly) and an Express + Prisma backend for browsing, filtering, viewing details, and comparing colleges.

Current Status (Updated April 29, 2026)
------
- **Frontend (apps/web)**: ✅ Fully implemented — listing, filtering (search, location, course, max fees), pagination, college detail page, compare UI. Now uses Supabase client directly for real-time data.
- **Backend API (apps/api)**: ✅ Implemented — routes for `/colleges`, `/colleges/:slug`, and `/compare`. API is optional; frontend now queries Supabase directly.
- **Database (Supabase/Postgres)**: ✅ Schema applied, 50 colleges seeded with courses and reviews. Direct Postgres connectivity confirmed working.
- **Data visibility**: ✅ Fixed — corrected Supabase URL format in `apps/web/.env.local` and updated field name queries to use snake_case.

What works now (out-of-the-box)
---------------------------------
- Frontend and backend compile and build successfully.
- 50+ college records in Supabase Postgres with full metadata (location, fees, ratings, courses, reviews).
- Filtering by search, location, course, and max fees.
- College detail pages with courses and reviews.
- College comparison (2–3 colleges side by side).
- All endpoints tested and confirmed working.

Quick start (development)
-------------------------
Prerequisites:
- Node.js 24.x (or compatible modern Node)
- Supabase project with Postgres credentials

1. Install dependencies (from repository root):

```bash
npm install
```

2. Set up environment variables:

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Backend** (`apps/api/.env`):
```env
DATABASE_URL="postgresql://user:password@host:6543/postgres?sslmode=require&uselibpqcompat=true&pgbouncer=true"
```

3. Run the frontend and backend in dev mode (two terminals):

Terminal 1 — frontend dev server:
```bash
npm run dev:web
```

Terminal 2 — API dev server:
```bash
npm --workspace apps/api run dev
```

Frontend automatically queries Supabase Postgres; API is optional for backend logic.

Architecture Notes
------------------
- **Frontend → Supabase Direct**: Pages use `@supabase/supabase-js` to query the "colleges" table directly. This is the primary data flow.
- **Backend (optional)**: Express API provides REST endpoints (`/colleges`, `/colleges/:slug`, `/compare`) using Prisma client. Can be used instead of direct Supabase queries if needed.
- **Shared types**: `packages/shared/src/index.ts` defines college data structures used by both frontend and API.

Database Schema (Supabase/Postgres)
-----------------------------------
- **colleges**: slug (unique), name, location, state, ownership, fees_annual, rating, placement_rate, median_package_lpa, highest_package_lpa, established_year, overview, exams (array), tags (array), recruiters (array), created_at, updated_at
- **courses**: college_id (FK), name, duration, annual_fees, created_at
- **reviews**: college_id (FK), author, role, rating, year, comment, created_at
- All tables have appropriate indexes on commonly queried columns (location, fees_annual, rating).

Seeding & Schema Application
-----------------------------
**Schema was applied via direct Postgres client** (not Prisma db push due to P1017 connection issues with Supabase pooler). To reproduce or reseed:

```bash
# Apply schema
npx tsx apps/api/scripts/pg-schema.ts

# Seed 50 colleges
npx tsx apps/api/scripts/pg-seed.ts
```

Scripts are in `apps/api/scripts/` and use the `pg` npm package.

Recommended next steps / improvements
------------------------------------
- Add API authentication and rate limiting for production.
- Add migrations workflow for schema versioning.
- Add API tests and E2E tests for frontend pages.
- Implement caching (Redis) for frequently queried colleges.
- Deploy frontend (Vercel) and backend (serverless function or container).

Where to look in the repo
-------------------------
- Frontend pages: [apps/web/src/app](apps/web/src/app)
- Supabase client: [apps/web/src/lib/supabase.ts](apps/web/src/lib/supabase.ts)
- Backend API: [apps/api/src/server.ts](apps/api/src/server.ts)
- Shared types: [packages/shared/src/index.ts](packages/shared/src/index.ts)
- Schema and seed scripts: [apps/api/scripts](apps/api/scripts)
- Seeded colleges data source: [packages/shared/src/index.ts](packages/shared/src/index.ts) (line ~60+)

Technical Highlights
--------------------
- **Frontend data flow**: Next.js Server Components → Supabase JS Client → Postgres (snake_case fields).
- **Field naming**: Postgres uses snake_case; frontend code handles both camelCase (types) and snake_case (Supabase queries).
- **Authentication**: Supabase anon key allows public read access; no additional auth required for the demo.
- **SSL**: Connection uses `sslmode=require` and `uselibpqcompat=true` for Supabase pooler compatibility.

Troubleshooting
---------------
- **Data not showing**: Verify `NEXT_PUBLIC_SUPABASE_URL` (no `/rest/v1/` suffix) and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `apps/web/.env.local`.
- **API not responding**: Ensure `DATABASE_URL` is set in `apps/api/.env` with correct password encoding (`%40` for `@`).
- **Supabase pooler timeout**: Use `pgbouncer=true` and `uselibpqcompat=true` in DATABASE_URL query string.

---
Last updated: 2026-04-29 | 50+ colleges seeded | All functionality working
