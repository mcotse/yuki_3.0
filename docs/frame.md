# Frame: Yuki 3.0 — Multi-Caretaker Pet Medication Tracker

## Source

> R1. Medication accountability across caretakers
> Multiple people share responsibility for a pet's daily care. Each person needs confidence that medications were given — and by whom — without having to call or text each other.
>
> R2. At-a-glance daily status
> A caretaker picking up their phone should know in under 3 seconds: what's done, what's not, and what's overdue. The cognitive load of parsing the day's state must be near zero.
>
> R3. Time-aware task sequencing
> Medications have specific timing requirements (morning vs. evening, minimum spacing between eye drops). The system must understand time — not just "done or not done" — and surface what matters right now.
>
> R4. Low-friction completion logging
> Every tap of friction between "I gave the medication" and "it's recorded" increases the chance someone skips logging. Completion must be faster than sending a text message.
>
> R5. Real-time multi-user coordination
> When two caretakers are both active (e.g., morning routine), they need to see each other's actions as they happen. Double-dosing a pet is a safety concern, not just an inconvenience.
>
> R6. Works without connectivity
> Caretakers may be in areas with poor signal (vet offices, certain rooms). The app must remain fully functional offline and reconcile state when connectivity returns.
>
> R7. Role-appropriate permissions
> The person who configures the care plan (choosing medications, setting schedules) has different needs and authority than the person who confirms daily tasks. These shouldn't be conflated.
>
> R8. Audit trail and history
> For medication compliance, vet visits, and peace of mind, there must be a reviewable record of what happened, when, and who did it — across days and weeks.
>
> R9. Ad-hoc observations
> Not everything fits a schedule. A caretaker notices a symptom, gives an unscheduled snack, or wants to leave a note for the other caretaker. There needs to be a way to capture unstructured context alongside the structured routine.
>
> R10. Phone-native feel on the web
> This is a "check it while standing in the kitchen" app. It must feel instant, be installable to the home screen, and behave like a native app — not a website you visit.

Additional context from user:
> - The pet is a dog named Yuki, but the app should be pet-agnostic (works for any pet type)
> - Notifications are a requirement, iOS-first. Must be free — use PWA installed to home screen + Cloudflare Worker for push notifications (no FCM/paid services)
> - MVP serves only a few people (2-3 caretakers)

---

## Problem

A dog named Yuki requires a complex daily medication regimen — multiple eye drops with timing constraints, oral medications, and supplements. Two caretakers (Matthew and a partner) split responsibility. Today, coordination happens via texts and memory. This creates:

- **Missed doses** — neither person is sure the other gave the medication
- **Double doses** — both people give the same med without knowing
- **Mental overhead** — parsing "what's left?" requires mental math every time
- **Lost history** — no reliable record for the vet

The existing Yuki 2.0 app (Vue 3 / Pinia / Firestore / PWA) solves many of these problems individually but has gaps in real-time coordination, offline resilience, and the "instant comprehension" UX.

## Constraints

- **Zero cost** — The entire stack must run on free tiers. No paid Firebase plan, no paid push notification service.
- **Pet-agnostic** — The data model and UI should work for any pet type (dog, cat, etc.), not be hardcoded to a specific animal.
- **iOS-first notifications** — Push notifications via Web Push API on iOS 16.4+ PWAs installed to home screen. Cloudflare Worker as the push server (free tier: 100k req/day).
- **MVP scale** — 2-3 caretakers, 1 pet. No multi-tenancy, no onboarding flows, no billing.

## Outcome

A phone-first PWA where either caretaker can:
1. Open the app and instantly know the day's medication status
2. Confirm a medication with a single tap
3. See the other caretaker's actions in real time
4. Trust the app works even with poor connectivity
5. Review a complete medication history for vet visits
6. Get push notifications on their phone (iOS home screen PWA) when medications are due or overdue

Success = the caretakers stop texting each other about medications entirely.
