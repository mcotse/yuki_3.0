# Shape B Spike: Convex as Firebase Replacement

## Context

Shape B (selected) specifies Firebase (Firestore + Auth) as the backend on the free Spark plan. Before implementation begins, we want to evaluate whether **Convex** could replace Firebase — given its reputation for better DX with React/Next.js, built-in real-time, and TypeScript-native design.

The spike focuses on how Convex maps to Yuki 3.0's 10 must-have requirements, with particular attention to R5 (real-time sync) and R6 (offline-first).

## Goal

Understand how Convex's capabilities map to each Shape B mechanism, where it improves the architecture, and where it introduces gaps or risks. Produce a recommendation with enough detail to decide: Firebase, Convex, or hybrid.

## Questions

| # | Question | Answer |
|---|----------|--------|
| **S1-Q1** | How does Convex handle real-time subscriptions compared to Firestore's `onSnapshot`? | All queries are reactive by default via persistent WebSocket. No opt-in, no listener management, no unsubscribe cleanup. Server re-runs queries when dependencies change and pushes results. Dramatically simpler than wiring `onSnapshot` callbacks to Zustand stores. |
| **S1-Q2** | Does Convex support offline-first? Can the app work without connectivity and sync when reconnected? | **No production-ready offline support.** Optimistic updates work online only. Two alpha-stage efforts exist: Curvilinear (IndexedDB-based offline sync, explicitly "alpha", known PWA gaps) and an Automerge CRDT integration (proof-of-concept). Neither is production-ready. Firestore's offline persistence is mature and one-line to enable. |
| **S1-Q3** | How does Convex handle authentication and can it work with Firebase Auth? | Three options: (1) Convex Auth (beta) — built-in passwords, OAuth, magic links; (2) Clerk, Auth0, WorkOS integrations; (3) Firebase Auth via OIDC JWT verification. Keeping Firebase Auth while using Convex backend is viable. |
| **S1-Q4** | How does Convex handle role-based authorization (admin vs. caretaker)? | Server-side TypeScript functions — all DB access goes through mutations/queries where you write auth checks in code. `convex-helpers` provides RLS wrappers. No declarative rules DSL to wrestle with. More flexible and testable than Firestore Security Rules. |
| **S1-Q5** | Does Convex's free tier cover a small household medication tracker? | Starter (free): 1M function calls/mo, 0.5 GB storage, 1 GB bandwidth. Sufficient for 2-3 caretakers. Firebase Spark: 2M invocations, 1 GB storage. Both adequate. Convex allows pay-as-you-go overage; Firebase Spark is a hard ceiling. |
| **S1-Q6** | Are there PWA or service worker compatibility issues? | Convex uses WebSocket (not HTTP fetch), so service workers can't intercept the data channel. App shell caching works normally. The gap is offline data — not a compatibility issue, but an architectural one: no connectivity = no data. |
| **S1-Q7** | How does Convex model data compared to Firestore documents/collections? | Document-relational model with typed schemas (`convex/schema.ts`). Typed `v.id("tableName")` references, explicit indexes, auto-generated TypeScript types. Full compile-time type safety vs. Firestore's schemaless approach. |
| **S1-Q8** | How does Convex handle two caretakers confirming the same medication simultaneously? | ACID transactions with serializable isolation and Optimistic Concurrency Control. If two mutations conflict, the second is automatically rolled back and retried with fresh state. No manual retry logic, no merge conflicts. Superior to Firestore's snapshot-isolation transactions. |
| **S1-Q9** | What does the React/Next.js integration look like? | `useQuery(api.meds.list)` → reactive subscription. `useMutation(api.meds.confirm)` → async call. Auto-generated `api` object with full types. Optimistic updates via `.withOptimisticUpdate()`. No Zustand stores needed for server state — Convex hooks replace them. |
| **S1-Q10** | How locked in are we if we choose Convex? | Moderate. Backend is open source and self-hostable (Docker/binary). Data export via CLI, streaming API, or Fivetran. Business logic is TypeScript and portable. Rework needed: replace `useQuery`/`useMutation` with React Query + ORM, rewrite `ctx.db` calls. For this app's size, migration would be days, not months. |

## Impact on Shape B Parts

| Part | Firebase Plan | Convex Impact | Verdict |
|------|--------------|---------------|---------|
| B1: `@yuki/types` | Shared TypeScript types | Convex generates types from schema — `@yuki/types` becomes thinner or unnecessary | **Improves** |
| B2: `@yuki/firebase` | Firebase init, helpers, auth | Replaced by `convex/` directory (server functions). Auth via Convex Auth or keep Firebase Auth via OIDC | **Replaces** |
| B3: Zustand + `onSnapshot` | Zustand stores built on reactive listeners | `useQuery` hooks replace Zustand for all server state. Only local-only UI state needs Zustand (modals, form state) | **Simplifies** |
| B4: Offline-first architecture | IndexedDB queue + Firestore sync | **Not achievable with Convex today.** Alpha tooling only. Would require custom IndexedDB caching layer | **Degrades** |
| B5: Presence system | Heartbeat docs + `onSnapshot` | Reactive queries make this trivial — write heartbeat via mutation, read via `useQuery` on presence table | **Improves** |
| B6: "Right Now" hero | Dashboard UI | Server-side query computes hero item — no client-side derivation needed | **Improves** |
| B7: One-tap confirm | Optimistic update + Firestore write | `useMutation` with optimistic update. ACID transactions prevent double-dosing automatically | **Improves** |
| B8: Component library | React components | No change — UI layer is independent of backend | **Neutral** |
| B9: Firestore security rules | Rules alongside features | Replaced by TypeScript auth checks in server functions — easier to write, test, and maintain | **Improves** |
| B10: PWA + Serwist | Service worker, caching | App shell caching works. Offline data layer is the gap (see B4) | **Neutral** |
| B11: Observations in timeline | Ad-hoc capture | Server-side insertion + reactive query. No change in UX | **Neutral** |
| B12: History view | Filterable audit trail | Server-side filtering/pagination in query functions — cleaner than client-side Firestore queries | **Improves** |
| B13: Admin care plan | Medication CRUD | Mutation functions with role checks. Type-safe schema validates data shapes | **Improves** |

**Score: 7 improve, 3 neutral, 2 replace, 1 degrade.**

The single degradation — B4, offline-first — is on a must-have requirement (R6).

## Fit Check: Convex vs. Requirements

| Req | Requirement | Status | Firebase | Convex |
|-----|-------------|--------|----------|--------|
| R1 | Multiple caretakers need confidence medications were given — and by whom — without calling or texting each other | Must-have | pass | pass |
| R2 | A caretaker picking up their phone should know in under 3 seconds: what's done, what's not, and what's overdue | Must-have | pass | pass |
| R3 | The system must understand medication timing (morning/evening, minimum spacing between eye drops) and surface what matters right now | Must-have | pass | pass |
| R4 | Completion logging must be faster than sending a text message (single-tap target) | Must-have | pass | pass |
| R5 | Two caretakers active simultaneously must see each other's actions in real time; double-dosing is a safety concern | Must-have | pass | pass |
| R6 | The app must remain fully functional offline and reconcile state when connectivity returns | Must-have | pass | **fail** |
| R7 | Care plan configuration (admin) and daily task confirmation (caretaker) are separate authorities | Must-have | pass | pass |
| R8 | Reviewable record of what happened, when, and who did it — across days and weeks | Must-have | pass | pass |
| R9 | Caretakers can capture unstructured observations (symptoms, notes, unscheduled events) alongside the structured routine | Must-have | pass | pass |
| R10 | PWA that feels instant, is installable to home screen, and behaves like a native app | Must-have | pass | pass |

**Convex fails R6.** Firestore passes all 10.

## Options

### Option 1: Stay with Firebase (no change)

Keep Shape B as-is. Firebase's offline persistence is mature, `enablePersistence()` is one line, and the offline queue pattern (B4) is well-documented. Trade-off: more wiring for real-time (manually connecting `onSnapshot` to Zustand), Firestore Security Rules DSL instead of TypeScript auth, no compile-time type safety on data.

### Option 2: Convex with degraded R6

Use Convex and accept that offline means "graceful degradation" rather than "fully functional." The app shell loads offline (Serwist), but data operations require connectivity. A read-only cache of the current day's schedule could be stored in IndexedDB client-side for viewing, but confirms would queue locally and require custom sync code.

**Risk:** If a caretaker is in a dead zone and needs to confirm a medication, they can't. This is a safety-adjacent concern for this app.

### Option 3: Convex with custom offline layer

Use Convex as primary backend. Build a custom offline layer:
- Service worker caches the current day's instances on each successful fetch
- IndexedDB stores pending confirms when offline
- On reconnect, flush the queue by calling Convex mutations
- Conflict resolution: if the medication was already confirmed server-side (by the other caretaker while you were offline), skip the queued confirm

**Effort:** Moderate. You're building the same offline queue you'd build for Firebase (B4), but without Firestore's built-in persistence helping. Roughly equivalent engineering effort since the Firebase offline queue was already a custom build (the Yuki 2.0 stub was never completed).

### Option 4: Hybrid — Convex primary, Firestore for offline cache

Use Convex for all server logic, auth, and real-time. Use Firestore purely as a client-side offline cache via `enablePersistence()`. On reconnect, sync Firestore cache → Convex via mutations.

**Downside:** Two backends to maintain. Adds complexity for unclear gain over Option 3.

## Findings

**Convex is the better backend for 9 out of 10 requirements.** The DX improvements are substantial:
- No Zustand stores needed for server state (Convex hooks replace them)
- No `onSnapshot` wiring — all queries are reactive by default
- No Firestore Security Rules — auth in TypeScript server functions
- ACID transactions eliminate double-dosing at the database level
- Type-safe schema with generated types catches bugs at compile time
- Server-side query logic (hero item computation, filtering, joins) eliminates client-side data derivation

**The blocker is R6 (offline-first).** Convex has no production-ready offline support. However:
- The Firebase offline queue (B4) was also a **custom build** — Yuki 2.0's stub was never completed
- Option 3 (Convex + custom offline layer) is roughly equivalent effort to the Firebase plan
- The custom layer is simpler than it sounds: cache today's schedule in IndexedDB, queue confirms, flush on reconnect

## Acceptance

Spike is complete. All 10 questions answered with concrete mechanics. We can describe:
- How Convex maps to every Shape B mechanism
- Where it improves, where it degrades
- The exact nature of the R6 gap and three mitigation options
- The effort required for each option

**Decision needed:** Stay with Firebase (safe), or adopt Convex with a custom offline layer (better DX, equivalent offline effort)?
