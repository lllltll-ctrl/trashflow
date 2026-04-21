# Architecture

## Summary

Three-tier system:

1. **Clients** — two Next.js 14 apps on Vercel:
   - `apps/public` — resident PWA (mobile-first, offline-capable).
   - `apps/admin` — dispatcher dashboard (desktop-first).
2. **Backend** — Supabase cloud (Postgres 15 + PostGIS, Auth, Storage, Realtime, Edge Functions).
3. **ML** — standalone FastAPI service on Railway (YOLOv8s fine-tuned on TACO, 5 waste classes).

Third parties: MapTiler (tiles), OneSignal (push), Sentry (errors), PostHog (product analytics).

```
┌────────────────────┐     ┌────────────────────┐
│  apps/public (PWA) │     │  apps/admin (SSR)  │
│  Vercel            │     │  Vercel            │
└──────┬─────────────┘     └──────────┬─────────┘
       │                              │
       │  HTTPS + Supabase JS SDK     │
       ▼                              ▼
┌────────────────────────────────────────────────┐
│  Supabase cloud                                │
│  - Postgres 15 + PostGIS (RLS on all tables)   │
│  - Auth (email + magic link)                   │
│  - Storage (complaint-photos bucket)           │
│  - Realtime (postgres_changes)                 │
│  - Edge Functions (webhook → OneSignal)        │
└────────────────────────────────────────────────┘
                   ▲
                   │ httpx (server-side only)
                   │
┌────────────────────────────────┐
│  apps/ml (FastAPI)             │
│  Railway, CPU, 512 MB RAM      │
│  POST /classify → 5-class JSON │
└────────────────────────────────┘
```

## Why this stack

- **Supabase** bundles Postgres + Auth + Storage + Realtime. Saves ~2 days of CRUD boilerplate. PostGIS is built-in, critical for geo queries.
- **FastAPI separate**: Supabase Edge Functions run on Deno — unsuitable for heavy ML models. ~200 MB RAM YOLOv8 instance on Railway for $5/mo.
- **Next.js 14 App Router**: RSC + Server Actions for admin, `@ducanh2912/next-pwa` for public. Two Vercel projects sharing one repo.
- **MapTiler over Mapbox**: cheaper free tier, better Ukrainian-localized tiles.

## Multi-tenant model

Every user-data table has `community_id uuid not null references public.communities(id)`. RLS policies scope every row to the caller's `profiles.community_id`. One hromada per Supabase user; adding a new hromada is an INSERT into `communities` + invite flow.

**Why it matters for the pitch**: 10,000 EUR → 12 hromadas in 6 months, not one. Schema is already ready.

## Request flow: new complaint

1. Resident PWA: form submit → compress photo → `supabase.storage.from('complaint-photos').upload(...)`.
2. Insert into `complaints` with `reporter_id = auth.uid()`, `community_id = profile.community_id`, and storage URL(s).
3. Database trigger → Supabase Edge Function → OneSignal push to dispatchers of that community.
4. Admin dashboard: Realtime channel delivers the new row → KPI card increments → row appears at top of the table (within ~3 seconds).

## Request flow: photo classification

1. PWA captures image → compress to max 1280px.
2. `POST /classify` to ML service (via Next.js API route that injects `X-API-Key`).
3. ML service: PIL resize to 640×640 → YOLOv8 inference → JSON `{category, confidence, all_scores, model_version}`.
4. PWA shows top-1 category and calls Supabase RPC `points_nearby` with user location + category filter.
5. ML outcome logged to `cv_classifications` for future training — optionally with user correction.

## Environments

| Env    | Public PWA                     | Admin                          | ML                           | DB                                  |
|--------|--------------------------------|--------------------------------|------------------------------|-------------------------------------|
| Local  | `pnpm dev --filter public`     | `pnpm dev --filter admin`      | `poetry run uvicorn ...`     | `supabase start` (requires Docker) |
| Preview| Vercel preview per PR          | Vercel preview per PR          | Railway staging              | Supabase branching                  |
| Prod   | Vercel prod (custom domain)    | Vercel prod (admin subdomain)  | Railway prod                 | Supabase prod project               |

Docker is not required for pre-build: we run all DB operations against Supabase cloud. Local containers are a Day-5 nice-to-have.
