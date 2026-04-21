# TrashFlow — Community Waste Management Platform

## What this is
SaaS-MVP for Ukrainian territorial communities to manage waste.
Target pilot: Pryluky hromada (Chernihiv oblast).
Built for Hackathon of Viability 3, 27–29 April 2026.

## Architecture (one-liner)
Next.js PWA + Next.js admin + FastAPI/YOLOv8 + Supabase (Postgres+PostGIS)

## Monorepo
- apps/public — resident PWA
- apps/admin — dispatcher dashboard
- apps/ml — Python CV service
- packages/db — migrations + generated types
- packages/ui — shared shadcn components

## Key docs (read when relevant)
- docs/ARCHITECTURE.md — full system design
- docs/DATABASE.md — schema + RLS policies
- docs/API.md — endpoints
- docs/ROADMAP.md — what's in MVP vs roadmap

## Quality bar (non-negotiable)
- TypeScript strict, no `any`
- All async actions show loading + error states
- Multi-tenant from day 1 (every query scoped by community_id)
- RLS enabled on every user-data table

## Commands
- `pnpm dev` — all apps
- `pnpm dev --filter public` — only public PWA
- `pnpm build` — production build
- `pnpm test` — all tests
- `supabase db reset` — apply migrations fresh

## Working style
I'm Maksym, acting as architect + QA, not hands-on coder.
When you disagree with my direction, say so — don't silently comply.