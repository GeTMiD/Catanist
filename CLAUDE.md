# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Next.js, localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

No test runner is configured.

## Environment

Create a `.env.local` file at the project root:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Architecture

Next.js 15 App Router SPA. All imports use the `@/` alias pointing to `src/`.

**Routing** — file-based under `app/`:
- `app/page.tsx` — landing page
- `app/puzzles/page.tsx` — browse + filter puzzles
- `app/create/page.tsx` — create a puzzle with board builder
- `app/progress/page.tsx` — user stats dashboard
- `app/solve/[id]/page.tsx` — solve a specific puzzle
- `app/not-found.tsx` — 404

Pages with React state use `"use client"`. Pages with no interactivity are Server Components (no directive needed).

**Supabase clients** — two separate files, never mix them up:
- `src/integrations/supabase/client.ts` — `createBrowserClient`, for `"use client"` components
- `src/integrations/supabase/server.ts` — `createSupabaseServerClient()`, for Server Components and Route Handlers

`src/integrations/supabase/types.ts` is auto-generated — regenerate via Supabase CLI when the schema changes, never edit manually.

**Data model:**
- `profiles` — linked to `auth.users` (uuid PK). Handles user identity, `is_premium`, `score`.
- `puzzles` — puzzle library. `board_layout` (jsonb) stores hex grid state in axial (q, r) coordinates. `creator_user` is a uuid FK to `profiles`.
- `user_progress` — one row per (user, puzzle). Tracks `completed`, `attempts`, `solved_at`.
- `daily_challenge` — maps `challenge_date` (unique date) to a `puzzle_id`.

**Board layout JSONB schema** (used by honeycomb-grid on the frontend):
```ts
{
  tiles: [{ q: number, r: number, terrain: string, number: number }],
  settlements: [{ q: number, r: number, vertex: number, player: string, type: "settlement"|"city" }],
  roads: [{ q: number, r: number, edge: number, player: string }],
  robber: { q: number, r: number },
  ports: [{ q: number, r: number, type: string, edge: number }]
}
```

**Design system**: CSS variables in `app/globals.css`. Catan-themed palette (terracotta primary, forest green secondary, wheat accent). Use Shadcn components from `src/components/ui/` for all UI.

## Development Guidelines

- All schema changes go through `supabase/migrations/` — never modify the DB directly.
- RLS must be strictly enforced on every table.
- Use **axial coordinates** for all hex math — consistent with honeycomb-grid defaults.
- Use the **server client** (`server.ts`) whenever a route doesn't need browser APIs. This keeps the anon key off the client for sensitive reads.
- `is_premium` is set manually in Supabase dashboard for now. Stripe webhook integration is planned but not yet built.
