# Roadmap

## MVP (must ship before demo on 29 Apr 2026)

- [x] Monorepo scaffold (Turborepo + pnpm workspaces)
- [x] Database schema + RLS (`supabase/migrations/`)
- [x] FastAPI + YOLOv8 stub classifier
- [x] Next.js 14 skeletons for public + admin
- [ ] Fine-tuned YOLOv8s on TACO, mAP@50 ≥ 0.55 (Day 2)
- [ ] PWA: photo capture → classify → show category + nearest point (Day 3)
- [ ] PWA: complaint form with photo + auto-geolocation (Day 3)
- [ ] Admin: login + complaints table + status workflow (Day 4)
- [ ] Admin: heatmap + cluster map + realtime updates (Day 4)
- [ ] 30+ real Pryluky collection points seeded (Day 5)
- [ ] ROI calculator with real Pryluky budget data (Day 5)
- [ ] E2E Playwright tests for 3 golden paths (Day 6)
- [ ] Lighthouse PWA score ≥ 90 on mobile (Day 6)
- [ ] 90-second Loom backup video + pitch deck (Day 7)

## Nice-to-have (bonus if time remains)

- [ ] Pickup calendar with push reminders
- [ ] Offline-first writes (queue complaints while offline)
- [ ] Photo EXIF-stripping before upload (privacy)

## Post-hackathon (Q3 2026)

- [ ] Pryluky production pilot — real residents, real dispatchers
- [ ] Telegram bot as alternative to PWA (if day-1 interview confirms Telegram dominance)
- [ ] Gamification: badges + leaderboard by sorting accuracy
- [ ] ERP integration for route optimization

## Regional expansion (Q4 2026)

- [ ] 3 more hromadas in Sumy oblast
- [ ] Multi-tenant admin UI (hromada selector)
- [ ] Per-hromada branding / white-label

## B2B (Q1 2027)

- [ ] Paid tier for oblast-level regional operators
- [ ] Aggregate analytics across hromadas
- [ ] API access for academic / civic-tech researchers

## Explicitly out of scope

- Native iOS/Android apps — PWA is enough for residents.
- Drone-patrol / UAV integration — interesting for a future pitch slide, not a product line.
- Real-time GPS tracking of garbage trucks — belongs to ERP vendors, not to us.
