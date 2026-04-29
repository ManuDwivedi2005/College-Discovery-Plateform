API backend for College Discovery

Setup

- Ensure `apps/api/.env` exists with `DATABASE_URL` pointing to your Supabase DB (use pooler URI from Supabase).
- Install dependencies from project root: `npm --workspace apps/api install` or from `apps/api` run `npm install`.

Run

- Apply schema: `npm --workspace apps/api run schema` or `cd apps/api && npm run schema`
- Seed data: `npm --workspace apps/api run seed` or `cd apps/api && npm run seed`
- Start dev server: `npm --workspace apps/api run dev` (runs on port 4000 by default)

Environment variables

- `DATABASE_URL` — full Postgres URI including SSL/pgbouncer params
