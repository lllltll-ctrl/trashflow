# Wake-up punch list — Maksym, 2026-04-22 morning

Everything below is a manual dashboard/browser action. Total time ≈ 15 minutes.
Code-side work is done: 14 commits on `master`, both Next apps build clean,
Playwright + CI + docs up to date.

---

## 1. Apply 4 new migrations in Supabase SQL Editor (5 min)

Open the SQL Editor in your Supabase project and run these files in order.
Each should finish with `Success`.

1. [`supabase/migrations/20260421000004_public_read_points.sql`](../supabase/migrations/20260421000004_public_read_points.sql) — lets anonymous residents browse collection points and RPCs.
2. [`supabase/migrations/20260421000005_anon_complaints.sql`](../supabase/migrations/20260421000005_anon_complaints.sql) — lets anonymous residents file complaints (trade-off: skipping auth for the pilot).
3. [`supabase/migrations/20260421000006_seed_pryluky_osm.sql`](../supabase/migrations/20260421000006_seed_pryluky_osm.sql) — drops the 3-point stub, inserts 12 real/placeholder Pryluky points.
4. [`supabase/migrations/20260421000007_storage_buckets.sql`](../supabase/migrations/20260421000007_storage_buckets.sql) — creates `complaint-photos` and `ml-artifacts` buckets with the right policies. (Replaces the manual Storage dashboard step I asked for earlier — skip that.)

**Verify:** Table Editor → `collection_points` should show 12 rows. Storage → buckets list should include both names.

---

## 2. Create your dispatcher auth user (3 min)

1. Supabase Dashboard → **Authentication → Users → Add user**.
2. Email: your real address. Check **Auto Confirm User**.
3. Copy the generated UUID (`id` column) from the users table.
4. Run in SQL Editor (paste the UUID **without angle brackets** — the `< >` below are just placeholders, not part of the value):

```sql
insert into public.profiles (id, community_id, role, full_name)
values (
    'paste-the-uuid-here-no-angle-brackets',
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'Maksym Lytvynenko'
);
```

After this you can log in to `/admin` via magic link.

---

## 3. Local smoke test (3 min)

```bash
# Start both apps
pnpm dev
```

- **Public PWA** — http://localhost:3000
  - Home shows 3 action cards (already worked pre-sleep).
  - `/classify` → tap "Зробити фото" → upload any trash photo → stub result appears with category + confidence + "Знайти найближчу точку" CTA → click → lands on `/points?category=X` with 12 points visible on Leaflet + list.
  - `/report` → tap "Зробити фото" → pick category chip → tap "Надіслати скаргу" → browser asks for geolocation → success screen with complaint short-id.

- **Admin dashboard** — http://localhost:3001
  - Redirects to `/login`.
  - Enter your email → check inbox → click magic link → returns to `/` authenticated.
  - Overview shows KPI cards (0/0/0/— until the report test above lands a complaint).
  - `/complaints` — table, your test complaint visible, status change buttons work.
  - `/map` — marker/heatmap toggle, your complaint pinned.

- **ML service** (optional — classify works in stub mode without it)
  - `pip install -r apps/ml/requirements.txt` (5 min download, torch is ~800 MB)
  - `cd apps/ml && uvicorn app.main:app --port 8000`
  - Classify page calls `http://localhost:8000/classify` via the `/api/classify` proxy; fallback to stub if unreachable.

---

## 4. GitHub push (1 min)

```bash
git remote add origin https://github.com/lllltll-ctrl/trashflow.git   # or your repo URL
git push -u origin master
```

CI should kick off automatically — three jobs: JS build+typecheck, Python pytest, Playwright E2E. Expect all green. If E2E fails in CI (headless chromium quirks), we'll debug on the real env.

---

## 5. Deferred until you have time

- [ ] Colab ML fine-tune ([notebook](../apps/ml/notebooks/finetune_yolov8.ipynb), ~1 hr) — grab a Roboflow API key first.
- [ ] Vercel link × 2 + Railway link (see [SETUP.md §2-3](./SETUP.md))
- [ ] `supabase login` + `pnpm db:types` — replaces the hand-written `packages/db/src/types.gen.ts` with generated types
- [ ] Lighthouse audit on deployed URL
- [ ] Day 1 of hackathon: update migration 006 with verified points from КП

---

## Blockers I hit while you slept

None — every task I planned landed cleanly. The only limitations are:

- **I can't run Playwright** — no browser binaries in my env. Tests are written and typecheck clean; first real run happens when CI runs on your push.
- **I can't verify admin auth end-to-end** — needs a real user in your Supabase, which is step 2 above.
- **I can't run the ML fine-tune** — that's a Colab task on your side (or ~1 hour CPU training locally).

## Quick mental model

- Classify, Report, Points: **work now** with mocked/stub data as soon as migrations 004-007 land.
- Admin dashboard: **works** as soon as the profile row from step 2 exists.
- Real fine-tuned classifier: **Day 2** per the original plan.
- Real Pryluky data: **Day 1 of hackathon** (interview + migration update).
