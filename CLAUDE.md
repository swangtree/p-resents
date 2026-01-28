# P-resents - Gift Exchange Matching Platform

## Project Overview
A gift exchange platform that uses algorithmic matching to pair givers with receivers based on preferences. Supports Secret Santa-style and White Elephant exchanges.

## Tech Stack

### Frontend (`apps/web`)
- **Framework**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Forms**: react-hook-form + Zod validation
- **Database/Auth**: Supabase (auth-helpers-nextjs, ssr, supabase-js)

### Backend (`apps/api`)
- **Framework**: FastAPI (Python 3.9+)
- **Algorithms**: scipy, numpy for optimization
- **Validation**: Pydantic v2

### Infrastructure
- **Package Manager**: pnpm (monorepo)
- **Database**: Supabase (PostgreSQL)
- **API Deployment**: Fly.io

## Commands
```bash
# Root
pnpm install          # Install all dependencies
pnpm dev              # Run web app (localhost:3000)
pnpm api:dev          # Run API with hot reload

# Testing
cd apps/api && pytest # Run API tests
```

## Project Tracking
- **TODO.md** - Task checklist with priorities (demo, bugs, polish, tests, features)
- Current priorities: loading states, email notifications, documentation, testing

## Architecture

### Directory Structure
```
apps/
├── web/src/
│   ├── app/           # Next.js pages (login, dashboard, results, demo, etc.)
│   ├── components/    # Sidebar, HanddrawnButton, RainbowText, etc.
│   ├── services/      # api.service.ts, supabase.service.ts
│   ├── types/         # api.types.ts, database.types.ts
│   └── lib/           # supabase.ts client, utilities
└── api/
    ├── main.py        # FastAPI app entry
    ├── routers/       # API routes
    ├── algorithms/    # Matching algorithms
    └── tests/         # pytest tests
```

### Database Tables (Supabase)
- **groups**: id, name, group_code (6-char unique), created_by
- **profile**: id, group_id (user-group membership)
- **preferences**: user_id, group_id, giving/receiving ratings (1-5), interests[], exclusions[]
- **match_results**: group_id, ruleset, pairings (JSONB), play_order, statistics

### API Endpoints
- `POST /recalculate` - Run all algorithms, return comparison statistics
- `POST /finalize_group` - Generate final pairings for chosen algorithm

### Matching Algorithms
1. **Random Matching** - Derangement with rejection sampling
2. **Max Utility** - Hungarian algorithm (maximize total satisfaction)
3. **Max Fairness** - Minimize variance in happiness
4. **White Elephant** - Monte Carlo simulation for play order

## Key Patterns

### Services Layer
- `api.service.ts` - Calls to FastAPI backend
- `supabase.service.ts` - Database CRUD operations

### Type Safety
- Frontend: TypeScript with strict mode, path alias `@/*` → `src/*`
- Backend: Pydantic models for request/response validation

### Authentication
- Supabase Auth with `@supabase/ssr` for server components
- Auth callback at `/auth/callback/route.ts`

## Environment Variables
```
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=https://p-resents-api.fly.dev  # or localhost:8000
```

## Development Notes
- Custom fonts: Mrs Pickles (handdrawn), Open Sans
- Color palette: Dark, Pink, Yellow, Orange, Green, Blue, Light (see tailwind.config.ts)
- RLS enabled on all Supabase tables for security
