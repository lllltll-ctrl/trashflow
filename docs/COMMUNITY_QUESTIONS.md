# Questions for the Pryluky representative (Day 1 of hackathon)

Ask within the first 30 minutes of meeting. Goal: validate that our pre-built solution maps to their real pain, and find 2–3 nuances to polish during the hackathon — that's our "built at the event" contribution.

## Context + priorities (5)

1. Who will own the project on your side after the hackathon? Name, position, phone.
2. What is KP's current 2026 budget for waste management? How much of it is fuel?
3. How many complaints from residents do you get per week? Through which channels (phone / FB / e-mail / in person)?
4. Your three biggest daily pains — not "nice to have" but *actually hurts every day*?
5. Any prior digital attempts? What went wrong?

## Operations + data (5)

6. How many brigades? How many garbage trucks? What are the current routes?
7. Any GPS trackers on vehicles? If yes — which system holds the data?
8. How does sorting work today? Separate collection — real or only on paper?
9. How many collection points exist in the hromada? Is there a complete list anywhere (even an Excel)?
10. How often do illegal dumps appear? Seasonal patterns?

## Residents (4)

11. What % of residents use smartphones? Age distribution?
12. Official communication channels (FB / Telegram / city website)? Follower counts?
13. General trust in local government — will this be seen as "another state toy"?
14. Active eco / civic NGOs we could partner with?

## Implementation (3)

15. If you win: what has to be ready before the pilot can launch? Legal blockers?
16. Willing to provide a 10–20 person alpha test group?
17. Who funds production after the 10 000 EUR grant is spent?

## How to use the answers on-site

- Real budget numbers → sharper ROI calculator (land on `apps/admin/app/(dashboard)/analytics`).
- Real collection points → migration `004_seed_pryluky_real.sql` (replaces the stub 3 points from the seed).
- Dominant comms channel (e.g. if Telegram beats FB) → prioritize Telegram bot as roadmap slide.
- Owner's name → in pitch: "ми вже узгодили з {name}, {role}, що пілот стартує 1 серпня". Sounds different from abstract "ми готові розгорнути".
