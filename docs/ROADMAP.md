# Roadmap

Last updated: 2026-04-22 (post-Day-0 build).

## Shipped (working in repo right now)

### Database & infrastructure
- [x] Multi-tenant schema with `community_id` on every user-data table
- [x] RLS policies on `communities`, `profiles`, `collection_points`, `complaints`, `cv_classifications`, `pickup_schedules`, `crews`, `audit_log`
- [x] PostGIS RPCs: `points_nearby`, `complaint_heatmap`, `create_collection_point`, `update_collection_point`
- [x] Anonymous complaint insert policy (zero-friction reporting for residents)
- [x] Append-only `audit_log` table + triggers on `complaints` / `crews` / `collection_points` / `pickup_schedules` (IOM compliance signal)
- [x] 8 SQL migrations validated in CI against PostgreSQL 15 + PostGIS
- [x] Real Pryluky seed data: 13 collection points (6 OSM + 7 placeholders), 9 pickup schedule rows, 3 crews, 20 demo complaints across 3 hot-spot districts

### Public PWA (`apps/public`)
- [x] Photo capture → ML classify → category card with confidence (`/classify`)
- [x] Geotagged complaint form with photo upload (`/report`)
- [x] Interactive Leaflet map of nearby collection points with category filter (`/points`)
- [x] **Sorting rules page** — 5 categories with examples + prep + what-not-to-do (`/rules`)
- [x] **Pickup schedule browser** — district selector + "Сьогодні" badge (`/schedule`)
- [x] PWA manifest + Workbox service worker + `/offline` fallback page
- [x] Image compression on upload (`browser-image-compression`)
- [x] Slug-based community resolver (multi-hromada portable via env)
- [x] PostHog analytics integration

### Admin dashboard (`apps/admin`)
- [x] Magic-link auth (PKCE) with role-gated middleware
- [x] Real-time complaints feed via Supabase `postgres_changes`
- [x] KPI cards (new / in-progress / resolved-7d / avg resolution hours)
- [x] Server-paginated complaints table with status + category filters and photo lightbox
- [x] **Crew assignment workflow** — dropdown per complaint, auto-promotes status `new → assigned`
- [x] Interactive Leaflet map with marker clustering + heat-map toggle
- [x] Full CRUD for collection points (via RPC, no client-side WKT)
- [x] Pickup schedule manager with district grouping
- [x] ROI calculator (interactive sliders, lazy-loaded)
- [x] Lazy-loaded heavy components (map, ROI) for fast first paint

### ML service (`apps/ml`)
- [x] FastAPI `/classify` + `/healthz` with magic-byte validation
- [x] YOLOv8 wrapper with stub fallback when weights are missing
- [x] Auto-fetch weights from Supabase Storage on startup (`ML_WEIGHTS_URL`)
- [x] CORS allowlist via `ML_ALLOWED_ORIGINS` env
- [x] Optional shared-secret API key (`ML_SERVICE_API_KEY`)

### Quality / DX
- [x] TypeScript strict + `noUncheckedIndexedAccess` across all packages
- [x] **Vitest unit tests:** 16 in public (image-magic, filename sanitization), 12 in admin (status mapping, coord extraction)
- [x] **Pytest:** 4 endpoint tests + 9 unit tests for magic-byte sniffer
- [x] Playwright E2E for 4 public golden paths
- [x] CI with 7 jobs: lint · typecheck · build · vitest · pytest · Playwright · SQL migrations + RLS smoke
- [x] RLS smoke test in CI: `anon` must see 0 rows in `complaints` and `profiles`, ≥1 in public-read tables
- [x] [docs/SECURITY.md](SECURITY.md) — full threat model
- [x] Documentation: ARCHITECTURE, DATABASE, API, SETUP, ML_TRAINING, COMMUNITY_QUESTIONS, DEMO_SCRIPT, WAKE_UP

## Pending for demo (29 Apr 2026)

- [ ] Fine-tuned YOLOv8s on TACO with mAP@50 ≥ 0.55 — Colab session pending, deploy to Supabase Storage
- [ ] ROI calculator calibrated with real Pryluky budget data (needs Day-1 interview with КП «Прилуки-Чисто»)
- [ ] Lighthouse PWA score ≥ 90 on mobile — manual run after deploy
- [ ] 90-second Loom backup video + pitch deck slides
- [ ] Production deploy: Vercel (PWA + admin) + Railway (ML) + Supabase cloud link
- [ ] `pnpm exec supabase gen types typescript --linked` to drop the last 3 `as any` casts

## Post-hackathon (Q3 2026)

- [ ] Pryluky production pilot — onboard real dispatcher, real residents
- [ ] Telegram bot as alternative entry point (if Day-1 interview confirms Telegram dominance)
- [ ] Push-notification reminders the day before pickup
- [ ] Offline-first writes (queue complaints while offline via Workbox `BackgroundSyncPlugin`)
- [ ] Photo EXIF-stripping before upload (privacy)
- [ ] Rate limiting on `/api/complaints` via Upstash + Vercel KV
- [ ] Image CDN (Supabase Image Transform — PRO)
- [ ] Audit log viewer in admin (currently only the table + RLS exist)
- [ ] Gamification: badges + leaderboard by sorting accuracy

## Regional expansion (Q4 2026)

- [ ] 3 more hromadas in Sumy / Chernihiv oblasts
- [ ] Per-hromada subdomain routing (the slug resolver is already there — just needs the middleware)
- [ ] Per-hromada branding / white-label
- [ ] Aggregated cross-hromada analytics (read-only, opt-in)

## B2B (Q1 2027)

- [ ] Paid tier for oblast-level regional operators
- [ ] API access for academic / civic-tech researchers
- [ ] ERP integration for route optimization

## Explicitly out of scope

- Native iOS/Android apps — PWA covers ≥ 95% of resident devices.
- Drone-patrol / UAV integration — interesting future pitch slide, not a product line.
- Real-time GPS tracking of garbage trucks — belongs to ERP vendors, not to us.
- Closed-source forks for individual hromadas — the licence keeps it open.
