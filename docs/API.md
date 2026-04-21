# API

Most of the "API" is Supabase itself — PostgREST auto-generates REST + GraphQL from the schema. We document here only endpoints with custom behavior (Next.js route handlers, RPCs, ML service).

## Supabase (PostgREST)

Consumed directly from client code via `@supabase/supabase-js`. RLS enforces authorization.

| Resource             | Operations from PWA                                | Operations from admin                                   |
|----------------------|----------------------------------------------------|---------------------------------------------------------|
| `complaints`         | `select` own community, `insert` new               | `select`, `update status/assigned_to`, `delete` (admin) |
| `collection_points`  | `select` own community                             | full CRUD                                               |
| `waste_categories`   | `select` all                                       | full CRUD (admin)                                       |
| `cv_classifications` | `insert` with own `community_id`                   | `select` own community                                  |
| `profiles`           | `select`, `update self`                            | full CRUD (admin)                                       |

## RPCs (called via `supabase.rpc(...)`)

### `points_nearby`

```ts
const { data, error } = await supabase.rpc('points_nearby', {
  p_lat: 50.5942,
  p_lng: 32.3874,
  p_category: 'plastic',   // optional, null = any
  p_radius_m: 2000,         // default 2000
  p_limit: 20,              // default 20
});
```

Returns: `Array<{ id, name, address, accepts, schedule, lat, lng, distance_m }>`.

### `complaint_heatmap`

```ts
const { data, error } = await supabase.rpc('complaint_heatmap', {
  p_days_back: 30,
  p_hex_size_m: 250,
});
```

Returns hex polygons with complaint counts and most-recent timestamp. Rendered as a choropleth on the admin map.

## ML service (apps/ml)

Base URL: `ML_SERVICE_URL` env (Railway in prod, `http://localhost:8000` locally).
Auth: optional `X-API-Key` header when `ML_API_KEY` env is set on the server.

### `GET /healthz`

```json
{
  "status": "ok",
  "version": "0.0.0",
  "model_loaded": true,
  "model_version": "trash_yolov8s"
}
```

### `POST /classify`

Multipart upload. `file` field, image/jpeg | image/png | image/webp, max 10 MB.

```json
{
  "category": "plastic",
  "confidence": 0.87,
  "all_scores": {
    "plastic": 0.87,
    "paper": 0.05,
    "glass": 0.03,
    "metal": 0.03,
    "hazardous": 0.02
  },
  "model_version": "trash_yolov8s",
  "stub": false
}
```

When weights are missing and `ML_ALLOW_STUB=true` (default in dev), the service returns `stub: true` with a uniform-ish distribution so the PWA UI can still render.

## Next.js route handlers (minimal)

We prefer Server Actions over API routes. The only planned routes:

- `POST /api/classify` (apps/public) — proxies to the ML service, injects the server-side API key. Prevents exposing `ML_API_KEY` to the browser.
- `POST /api/webhooks/onesignal` (apps/admin, edge function) — triggered by database webhooks on `complaints.status` changes; sends push.

Both are added on Day 3/4 per plan, not in the skeleton.
