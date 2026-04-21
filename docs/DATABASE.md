# Database

## Tables

| Table                | Purpose                                        | Tenant-scoped? |
|----------------------|------------------------------------------------|----------------|
| `communities`        | Hromadas (Pryluky + future pilots)             | n/a (root)     |
| `profiles`           | Extends `auth.users` with role + community     | yes            |
| `waste_categories`   | 5-class reference data                         | no (global)    |
| `collection_points`  | Recycle / hazardous drop-off locations         | yes            |
| `complaints`         | Resident-filed complaints                      | yes            |
| `cv_classifications` | ML inference log (with optional user correction) | yes          |

All tenant-scoped tables carry `community_id uuid not null`, have an index on that column, and have RLS enabled.

## RLS policies (summary)

- **Residents** can read rows in their own community and insert complaints with `reporter_id = auth.uid()`.
- **Dispatchers** can update complaints in their community and CRUD collection points.
- **Admins** can delete complaints and manage profiles in their community.
- Reference data (`waste_categories`) is world-readable; only admins can write.

Full policy text: [`supabase/migrations/20260421000002_rls.sql`](../supabase/migrations/20260421000002_rls.sql).

## Helper functions

- `public.current_community_id()` — returns the caller's `profiles.community_id`. Used in every RLS policy.
- `public.current_role()` — returns the caller's role (`resident | dispatcher | admin`).
- Both are `security definer` + explicit `search_path = public` — safe against search-path hijack.

## RPCs (callable from client)

- `points_nearby(p_lat, p_lng, p_category, p_radius_m, p_limit)` — nearest active collection points filtered by accepted waste category. Returns ordered by distance, with `distance_m`.
- `complaint_heatmap(p_days_back, p_hex_size_m)` — hex-grid aggregation of complaints for the admin heatmap. Uses `st_hexagongrid`.

Defined in [`supabase/migrations/20260421000003_rpc.sql`](../supabase/migrations/20260421000003_rpc.sql).

## Indexes worth knowing

- `complaints (community_id, status, created_at desc)` — feeds the admin "new complaints" view.
- `complaints using gist (location)` — geo filter for heatmap + bbox queries.
- `collection_points using gin (accepts)` — array-contains queries for "where can I drop plastic?"
- `collection_points using gist (location) where is_active` — partial index for distance search.

## Seed data

`supabase/seed.sql` inserts:
- Pryluky community row (fixed UUID for referential stability).
- 5 waste categories with UA names.
- 3 sample collection points near Pryluky center. Replaced with real scraped data on Day 5 (per ROADMAP).

## Regenerating types

After any migration:

```bash
pnpm exec supabase db push      # apply to linked project
pnpm db:types                    # regenerate packages/db/src/types.gen.ts
git add packages/db/src/types.gen.ts supabase/migrations
git commit
```

## Backup / rollback

- Supabase cloud takes daily backups on the Pro tier. We're on Free tier during pre-build — backups are manual (`pg_dump`).
- Migrations include a commented DOWN block. To roll back, paste it into the SQL editor. We do **not** run DOWN migrations through the CLI — too risky for teams this size.
