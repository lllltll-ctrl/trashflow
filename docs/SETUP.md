# Setup checklist — your manual steps before Day 2

This is the chit-sheet for turning the scaffold into a live system. All three
platforms have free tiers that cover the pilot.

Do these in order; each block is 10–15 minutes.

---

## 1. Supabase cloud (required — unblocks everything else)

### 1.1 Create the project

1. Open https://supabase.com/dashboard/projects → **New project**.
2. Name: `trashflow-pryluky`. Region: `Central EU (Frankfurt)` (closest to Ukraine). Database password: generate a strong one and save in your password manager.
3. Wait ~2 min while the project provisions.

### 1.2 Link the local CLI

From the repo root:

```bash
pnpm exec supabase login                 # opens browser for auth
pnpm exec supabase link --project-ref <your-project-ref>
```

`<your-project-ref>` is the 20-char ID in the dashboard URL: `https://supabase.com/dashboard/project/<ref>`.

It will ask for the database password you saved above.

### 1.3 Apply migrations + seed

```bash
pnpm exec supabase db push               # applies all 3 migrations to cloud
pnpm exec supabase db seed buckets       # creates the complaint-photos bucket
```

Verify via https://supabase.com/dashboard/project/<ref>/editor — you should see 6 tables (`communities`, `profiles`, `waste_categories`, `collection_points`, `complaints`, `cv_classifications`).

Then run the seed data (5 categories + Pryluky row + 3 sample points):

```bash
psql "$(pnpm exec supabase status --output json | jq -r .DB_URL)" -f supabase/seed.sql
```

Or paste the contents of `supabase/seed.sql` into the SQL editor in the dashboard.

### 1.4 Regenerate TS types

```bash
pnpm db:types
git add packages/db/src/types.gen.ts
git commit -m "chore(db): regenerate types from linked Supabase project"
```

### 1.5 Grab API keys

From https://supabase.com/dashboard/project/<ref>/settings/api:

- `Project URL` → goes in `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to the browser)

Copy `.env.example` to `.env.local` in the repo root and fill those three values. Both apps read from there automatically thanks to the `dotenv` handling in Next.js.

### 1.6 Create an admin user for yourself (for testing apps/admin)

Via dashboard → Authentication → Users → **Add user**. Use your real email. Then in the SQL editor:

```sql
insert into public.profiles (id, community_id, role, full_name)
values (
    '<your-auth-user-id>',
    '00000000-0000-0000-0000-000000000001',  -- Pryluky
    'admin',
    'Maksym Lytvynenko'
);
```

(Your-auth-user-id appears after you create the user — copy it from the users table.)

---

## 2. Vercel (two projects, one repo)

### 2.1 Install the CLI (global)

```bash
npm install -g vercel           # already installed per earlier environment check
vercel login
```

### 2.2 Link apps/public

```bash
cd apps/public
vercel link                      # answer prompts: create new project "trashflow-public"
```

When asked for the root directory → accept the current (`apps/public`). Vercel detects Next.js automatically.

Then set env vars via CLI (or dashboard):

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_DEFAULT_COMMUNITY_SLUG production    # value: pryluky
vercel env add ML_SERVICE_URL production                         # Railway URL after step 3
vercel env add ML_SERVICE_API_KEY production
```

Repeat for `preview` and `development` environments (same values for pre-hackathon).

### 2.3 Link apps/admin

```bash
cd ../admin
vercel link                      # create new project "trashflow-admin"
```

Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_MAPTILER_KEY`.

### 2.4 Verify builds

```bash
vercel --prod                    # triggers a production deploy; watch the logs
```

If both builds go green, production URLs appear at the end. Bookmark them — they go on your pitch slides.

---

## 3. Railway (apps/ml)

### 3.1 Create the project

1. https://railway.com/new → **Deploy from GitHub repo** → select your fork.
2. When Railway asks for a root directory, set `apps/ml`.
3. Railway auto-detects the Dockerfile and starts a build.

### 3.2 Env vars

In Railway → your project → Variables:

- `ML_MODEL_PATH=/app/app/models/trash_yolov8s.pt`
- `ML_ALLOW_STUB=true`                            # until you upload the real weights
- `ML_API_KEY=<generate a 32-byte random hex>`
- `ML_SENTRY_DSN=<from Sentry dashboard, optional>`
- `ML_ENVIRONMENT=production`

### 3.3 Attach a Volume for the model weights

In Railway → project → your service → **Volumes** → **Add Volume**, mount at `/app/app/models`.

Initially empty — the stub response kicks in, which is fine for Day 1 smoke test.

### 3.4 Upload weights (after Day 2 Colab fine-tune)

Easiest: upload `trash_yolov8s.pt` to the Supabase Storage bucket `ml-artifacts` (public), then in Railway shell:

```bash
wget -O /app/app/models/trash_yolov8s.pt "https://<project>.supabase.co/storage/v1/object/public/ml-artifacts/trash_yolov8s.pt"
```

Set `ML_ALLOW_STUB=false` to enforce real weights. Restart the service.

---

## 4. Sentry (optional but recommended, 5 min)

1. https://sentry.io/auth/register/ → create org → create 2 projects: `trashflow-public` (Next.js platform), `trashflow-admin` (Next.js).
2. Copy the DSN values into the corresponding Vercel env vars (`NEXT_PUBLIC_SENTRY_DSN`).
3. For the ML service: create a third project (Python/FastAPI platform), set `ML_SENTRY_DSN` in Railway.

---

## 5. MapTiler (15 s)

1. https://www.maptiler.com/cloud/ → sign up.
2. Dashboard → API keys → copy the default key.
3. Set `NEXT_PUBLIC_MAPTILER_KEY` in both Vercel projects and your local `.env.local`.

---

## Final smoke test

```bash
pnpm dev                                 # all 3 apps in parallel via Turbo
```

- http://localhost:3000 — public PWA home should load, clickable cards.
- http://localhost:3001/login — admin login page.
- http://localhost:8000/healthz — ML service returns `{status: "ok", model_loaded: true, model_version: "stub"}`.

Open the Supabase SQL editor and run:

```sql
select count(*) from public.waste_categories;  -- expect 5
select count(*) from public.collection_points; -- expect 3
```

If all three apps load and the SQL returns the expected counts — setup is complete. Ping me in chat: «Supabase live, готово».
