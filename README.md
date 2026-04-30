# College Discovery

College Discovery is a backend-first monorepo for browsing, filtering, comparing, and shortlisting colleges.

## Architecture

- **apps/web**: Next.js landing page with college search, listing, detail pages, and compare UI.
- **apps/api**: Express API that owns database access, filtering, pagination, and comparison logic.
- **packages/shared**: Shared college types, seeded data, and formatting helpers.
- **PostgreSQL**: Database storage for 50 unique colleges, courses, and reviews.

## What the app does

- **Home page**: Shows featured colleges, filters, and global search.
- **College listing**: Supports search, location/course/fees filters, and pagination.
- **College details**: Shows courses, placements, reviews, and official website links.
- **Compare page**: Compare up to 3 colleges side by side on fees, placement %, rating, and more.
- **Authentication**: Secure OTP-based registration flow with granular User Roles (Student, Alumni, College Management, etc.).
- **Discussion Q&A**: Active community forum where verified users can ask and answer queries.
- **Institution Onboarding**: College Management personnel have exclusive access to register new colleges.

## Local setup

### Prerequisites

- Node.js 24.x or compatible modern version
- PostgreSQL database (or Supabase Postgres)

### 1. Install dependencies

From the repository root:

```bash
npm install
```

### 2. Configure the database

Create `apps/api/.env` with your Postgres connection string:

```env
DATABASE_URL="postgresql://user:password@host:6543/postgres?sslmode=require&uselibpqcompat=true&pgbouncer=true"
```

For Supabase, use the **Connection Pooler** URI (pgbouncer mode) from your project settings.

### 3. Initialize the database

Apply the schema and seed 50 colleges:

```bash
npm --workspace apps/api run schema
npm --workspace apps/api run seed
```

### 4. Start the servers

In two separate terminals:

**Terminal 1 — API server** (port 4000):
```bash
npm --workspace apps/api run dev
```

**Terminal 2 — Frontend** (port 3000):
```bash
npm run dev:web
```

Then open [http://localhost:3000](http://localhost:3000).



## Useful commands

```bash
npm run lint:web                # Lint frontend
npm run build:web               # Build frontend
npm --workspace apps/api run build   # Build API
npm --workspace apps/api run start   # Start API (production)
npm --workspace apps/api run schema  # Apply database schema
npm --workspace apps/api run seed    # Seed colleges data
```

## Database schema

- **colleges**: slug, name, location, state, ownership, fees_annual, rating, placement_rate, median_package_lpa, highest_package_lpa, established_year, overview, exams, tags, recruiters
- **courses**: college_id (FK), name, duration, annual_fees
- **reviews**: college_id (FK), author, role, rating, year, comment

## Notes

- The frontend **does not** talk to Supabase directly; it calls the backend API.
- All database access is mediated through `apps/api`.
- The landing page search uses the college list returned by the backend.
- Parameterized SQL prevents injection attacks.
- Zod validates all server-side inputs.
