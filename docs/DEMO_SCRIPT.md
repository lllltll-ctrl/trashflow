# Demo script — 5 minutes

Timing: 60 s story → 90 s live demo → 60 s numbers/ROI → 60 s architecture/roadmap → 30 s close.

## 0:00–1:00 — Olena's story

> «Olena — диспетчер КП "Прилуки-Чисто". Вранці її телефон уже не замовкає: п'ятий дзвінок про звалище біля школи. Вона записує адресу в зошит — третій за тиждень. Через два дні бригада приїде. Ще через три приїде знову — бо ніхто не сказав мешканцям, де офіційний контейнер.
>
> Так працює сьогодні. Ось як це працюватиме завтра.»

*Pause. Switch to live demo.*

## 1:00–2:30 — Live demo

**1:00** — «Я — мешканець Прилук, у мене стара батарейка». Phone in hand, open PWA → "Класифікувати". Take photo → 1 s → "Небезпечні відходи" → map shows nearest drop-off with walking route.

**1:30** — «Тепер я бачу нелегальне звалище». Tap "Повідомити про звалище" → photo → geolocation auto → submit. Done.

*Second laptop on projector*: dispatcher dashboard shows the new complaint within 3 seconds.

**2:00** — «Olena бачить тепломапу за тиждень. Найбільше скарг — мікрорайон "Дружби". Вона натискає "призначити бригаду № 2".» Mesnant gets push "вашу скаргу прийнято".

## 2:30–3:30 — Numbers

Slide with three figures:
- **420 тис грн/рік** — projected savings for Pryluky from route optimization (based on public KP budget).
- **~3 000** — active residents complaining in the local Facebook group today. That's our day-1 audience.
- **12** — hromadas in the Hackathon of Viability series. Architecturally multi-tenant; scaling to one new community takes a week.

> «10 000 EUR from IOM isn't one pilot in Pryluky. It's 12 pilots in 6 months and a precedent for the whole region.»

## 3:30–4:30 — Architecture + roadmap

One slide with the three-tier diagram + three roadmap bullets:
- Q3 2026: Pryluky production pilot, integration with real KP.
- Q4 2026: 3 more Sumy oblast communities.
- Q1 2027: B2B module for oblast-level regional operators (paid tier).

## 4:30–5:00 — Close

> «Ми тут не за грантом. Ми за партнером — Прилуцькою громадою — щоб разом увести систему в експлуатацію до 1 серпня. Дякуємо.»

*Don't say "Questions?" — that's the moderator's job. End with a smile and walk off.*

## Safety rules

- **90-second Loom backup** saved locally, not on YouTube. If anything fails on stage, pivot to video within 5 seconds — don't explain.
- **Mobile hotspot** for both devices. Never trust venue WiFi.
- **Known-good photos** for classification — use fixtures from `apps/ml/tests/fixtures/` pre-tested against the live model.
- **Physical rehearsal** of the two-device flow (phone in hand, laptop on projector) at least 3 times.
- **Never improvise** the script on stage. Small variations are fine; don't invent new features live.
