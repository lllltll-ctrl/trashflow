# Security model

How TrashFlow defends user data, the dispatcher dashboard, and the ML service. Audited end-to-end before the Day-1 demo.

## Trust boundaries

```
[ resident PWA ]  ──anon key──▶  [ Supabase REST/Storage ]  ◀──RLS── [ Postgres ]
       │                                                                  ▲
       └──multipart──▶  [ Next.js /api/classify ]  ──HTTPS──▶  [ FastAPI ML ]
                                                                          │
[ admin dashboard ]  ──cookie session──▶  [ Supabase ]  ◀──RLS+role──┘
```

Every boundary above does its own validation. Nothing trusts the previous layer.

## Database layer (Supabase + RLS)

- **RLS on every user-data table.** `communities`, `profiles`, `collection_points`, `complaints`, `cv_classifications`, `pickup_schedules`, `crews`. Audited in CI: see the `lint-sql` job which asserts that an `anon` role sees zero rows in `complaints` and `profiles` after seeding.
- **Multi-tenant scope** via two security-definer helpers: `current_community_id()` and `current_role()`. Every policy that needs tenant isolation goes through them — no inline `auth.uid()` joins that drift over time.
- **Anonymous complaint insert** is intentional (zero-friction reporting). The policy clamps `community_id` to a valid community and bounds `description` length + photo array size.
- **PostGIS RPCs** (`points_nearby`, `complaint_heatmap`, `create_collection_point`) run with `security invoker` so RLS still applies to the underlying tables. `create_collection_point` adds its own range checks (`-90 ≤ lat ≤ 90`, `-180 ≤ lng ≤ 180`) and role gate (`dispatcher`/`admin`) as defense-in-depth.

## Public PWA

- **Magic-byte sniffing** at `/api/classify` ([apps/public/lib/image-magic.ts](../apps/public/lib/image-magic.ts)) — file content is checked against JPEG / PNG / WEBP signatures *before* it reaches the ML service. The client-supplied `Content-Type` is never trusted. 8 unit tests cover positive matches and the common spoof patterns (PE binary, RIFF-without-WEBP, truncated signatures).
- **Filename sanitization** ([safePhotoExtension](../apps/public/lib/complaints-client.ts)) — strips everything but `[a-z0-9]`, lowercases, falls back to `jpg`. `exploit.php.jpg` becomes `jpg`. 8 unit tests cover the double-extension trick, path-traversal noise, and missing extensions.
- **SSRF guard on ML proxy** ([ml-proxy.ts](../apps/public/lib/ml-proxy.ts)) — `ML_SERVICE_URL` is parsed once at boot and rejected unless it uses `http(s):`. A misconfigured `file://` or `http://169.254.169.254` env can no longer reach internal metadata endpoints.
- **PWA service worker** has an `/offline` fallback so a connectivity blip never reveals a stack trace.

## Admin dashboard

- **Magic-link auth (PKCE)** via Supabase. Session is stored in HTTP-only cookies set by `@supabase/ssr`.
- **Role-gated middleware** ([apps/admin/middleware.ts](../apps/admin/middleware.ts)) — every request that isn't `/login` or `/auth/*` queries `profiles.role` and bounces anyone whose role isn't `dispatcher` or `admin`. A resident with a Supabase session cannot reach the dispatcher UI.
- **Open-redirect safe `next` param** ([safeNextPath](../apps/admin/app/auth/callback/route.ts)) — accepts only `/non-slash...` paths, rejecting `//evil.com`, `/\\evil.com`, and absolute URLs.
- **PostGIS create RPC** drops the previous client-side WKT-string concatenation — coordinates are now numeric parameters, not assembled into `SRID=4326;POINT(${lng} ${lat})`.

## ML service (FastAPI)

- **CORS whitelist** driven by `ML_ALLOWED_ORIGINS` env (CSV), defaulting to localhost. No more wildcard `*`.
- **Magic-byte sniff** in `/classify` — same logic as the proxy, in case the proxy is bypassed.
- **Optional `ML_SERVICE_API_KEY`** shared secret enforced via `verify_api_key` dependency.
- **Stub fallback** is explicit: when weights are missing the response carries `stub: true` so the UI can warn the user (and we never silently fake confidence).

## Secrets

- `.env.local` is `.gitignore`d at the repo root; only `.env.example` lives in version control.
- `SUPABASE_SERVICE_ROLE_KEY` is **never** imported in client components — verified by review and by the fact that no `apps/*/components/**` file references it.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is publishable by design.
- `ML_SERVICE_API_KEY` is server-only.

## CI gates

The `.github/workflows/ci.yml` pipeline blocks merges on:

1. ESLint (`pnpm lint`) — no `as any` slips past the rule.
2. TypeScript strict (`tsc --noEmit`) on every package.
3. Vitest unit tests (16 cases — magic bytes, filename sanitization, status mapping, coord extraction).
4. Pytest (4 endpoint tests + 9 unit tests for the magic-byte sniffer).
5. Playwright E2E for the four golden public flows.
6. SQL migration replay against PostgreSQL 15 + PostGIS — every migration must apply cleanly in order.
7. **RLS smoke test** — after seeding, asserts that the `anon` role sees zero rows in `complaints` and `profiles`, and ≥ 1 row in `pickup_schedules` and `collection_points` (positive controls).

## Known gaps (post-MVP)

- **No rate limiting** on `/api/complaints` insert. Plan: Upstash + Vercel KV middleware (5/15min per IP). Deferred — requires paid infrastructure.
- **No image CDN/transform**. Raw photos are served from Supabase Storage. Plan: Supabase Image Transform (PRO feature) once budget is approved.
- **3 `as any` casts** in admin client mutations — vestigial of hand-written `types.gen.ts`. Cleared by `pnpm exec supabase gen types typescript --linked` once the project is linked.
- **No audit log of dispatcher actions** yet. Plan: append-only `audit_log` table with a trigger on `complaints` status/assignment changes (Q3 — IOM compliance signal).

## Reporting

Found something? Email `maksym.lytvynenko2008@gmail.com` directly. Don't open a public issue.
