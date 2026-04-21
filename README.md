# TrashFlow

Civic-tech SaaS for Ukrainian hromadas to manage waste. Pilot: Pryluky (Chernihiv oblast). Built for Hackathon of Viability 3, 27–29 April 2026.

## Stack

- **apps/public** — Next.js 14 PWA for residents (photo → classify → report)
- **apps/admin** — Next.js 14 dispatcher dashboard (map + heatmap + complaints workflow)
- **apps/ml** — FastAPI service with fine-tuned YOLOv8 (5 waste classes)
- **packages/db** — Supabase migrations + generated TS types
- **packages/ui** — shared shadcn components
- **packages/config** — shared tsconfig, tailwind, eslint

Backend: Supabase (Postgres 15 + PostGIS, Auth, Storage, Realtime). Deploy: Vercel (web), Railway (ML), Supabase cloud.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # fill in Supabase keys
pnpm dev                     # all apps in parallel via Turbo
pnpm dev --filter public     # just the PWA
```

Supabase local dev (requires Docker):
```bash
pnpm exec supabase start
pnpm db:push
pnpm db:types
```

## Docs

- **[docs/SETUP.md](docs/SETUP.md) — first-time setup: Supabase + Vercel + Railway + env vars. Start here.**
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design
- [docs/DATABASE.md](docs/DATABASE.md) — schema + RLS policies
- [docs/API.md](docs/API.md) — endpoints
- [docs/ROADMAP.md](docs/ROADMAP.md) — MVP vs roadmap
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) — 5-minute pitch script
- [docs/COMMUNITY_QUESTIONS.md](docs/COMMUNITY_QUESTIONS.md) — questions for Pryluky hromada rep
- [docs/ML_TRAINING.md](docs/ML_TRAINING.md) — YOLOv8 fine-tune workflow (Colab notebook at [apps/ml/notebooks/finetune_yolov8.ipynb](apps/ml/notebooks/finetune_yolov8.ipynb))

## Quality bar

- TypeScript strict, no `any`
- Multi-tenant from day 1 — every query scoped by `community_id`
- RLS enabled on every user-data table
- All async actions show loading + error states
