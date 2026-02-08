# V1 + V2: Foundation, Login & Dashboard Core — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stand up the full monorepo, auth, Convex backend, offline layer, and PWA shell (V1), then build the core medication dashboard with hero card, confirm, undo, and progress ring (V2).

**Architecture:** pnpm monorepo with `apps/web` (Next.js App Router) and `packages/types` (tsup). Convex for backend (real-time queries, ACID mutations). Clerk for auth (JWT → Convex). Custom IndexedDB offline layer for R6. Serwist for PWA shell caching.

**Tech Stack:** Next.js 15 (App Router), TypeScript (strict), Convex, Clerk, Tailwind CSS 4, Serwist, Vitest + convex-test, oxlint, pnpm workspaces, tsup

---

## V1: Foundation + Login

### Task 1: Monorepo scaffolding

**Files:**
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `.npmrc`
- Create: `.gitignore`

**Step 1: Initialize git repo**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git init
```

**Step 2: Create root package.json**

Create `package.json`:
```json
{
  "name": "yuki-3",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "format": "pnpm -r format"
  },
  "engines": {
    "node": ">=20"
  }
}
```

**Step 3: Create pnpm-workspace.yaml**

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Step 4: Create .npmrc**

Create `.npmrc`:
```
auto-install-peers=true
strict-peer-dependencies=false
```

**Step 5: Create .gitignore**

Create `.gitignore`:
```
node_modules/
.next/
dist/
.env
.env.local
.turbo/
*.tsbuildinfo
.DS_Store
```

**Step 6: Verify workspace resolves**

Run: `pnpm install`
Expected: Empty lockfile created, no errors

**Step 7: Commit**

```bash
git add package.json pnpm-workspace.yaml .npmrc .gitignore pnpm-lock.yaml
git commit -m "chore: scaffold pnpm monorepo"
```

---

### Task 2: Next.js app with Tailwind 4

**Files:**
- Create: `apps/web/` (entire Next.js scaffolding)
- Modify: `apps/web/package.json` (add scripts)
- Create: `apps/web/app/globals.css` (Tailwind 4 theme)

**Step 1: Create Next.js app**

```bash
cd /Users/mcotse/Developer/yuki_3.0
mkdir -p apps
cd apps
pnpm create next-app@latest web --ts --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-pnpm
```

Accept defaults. This scaffolds `apps/web/` with App Router + TypeScript + Tailwind.

**Step 2: Verify Tailwind 4 is installed**

Check `apps/web/package.json` — `tailwindcss` should be v4.x. If it's v3, upgrade:
```bash
cd /Users/mcotse/Developer/yuki_3.0/apps/web
pnpm remove tailwindcss postcss autoprefixer
pnpm add -D tailwindcss@latest @tailwindcss/postcss@latest
```

**Step 3: Configure Tailwind 4 CSS-first config**

Replace `apps/web/app/globals.css` with:
```css
@import "tailwindcss";

@theme {
  --color-primary: #6366f1;
  --color-primary-light: #818cf8;
  --color-primary-dark: #4f46e5;
  --color-surface: #ffffff;
  --color-surface-dim: #f8fafc;
  --color-surface-container: #f1f5f9;
  --color-on-surface: #0f172a;
  --color-on-surface-muted: #64748b;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

**Step 4: Update postcss.config.mjs for Tailwind 4**

Replace `apps/web/postcss.config.mjs`:
```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**Step 5: Remove tailwind.config.ts if it exists**

Tailwind 4 uses CSS-first config. Delete `apps/web/tailwind.config.ts` if created by scaffolding.

**Step 6: Verify dev server starts**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm dev`
Expected: Server starts at localhost:3000, no errors

**Step 7: Verify build succeeds**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm build`
Expected: Build completes with no errors

**Step 8: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/
git commit -m "feat: add Next.js app with Tailwind CSS 4"
```

---

### Task 3: @yuki/types package

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Create: `packages/types/tsup.config.ts`
- Create: `packages/types/src/index.ts`
- Test: `packages/types/src/__tests__/types.test.ts`

**Step 1: Create package structure**

Create `packages/types/package.json`:
```json
{
  "name": "@yuki/types",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "lint": "oxlint src/"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^3.0.0"
  }
}
```

**Step 2: Create tsup config**

Create `packages/types/tsup.config.ts`:
```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

**Step 3: Create tsconfig**

Create `packages/types/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Step 4: Write the failing test**

Create `packages/types/src/__tests__/types.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import type { MedicationType, InstanceStatus, UserRole } from "../index";

describe("@yuki/types", () => {
  it("MedicationType includes expected values", () => {
    const types: MedicationType[] = ["eye_drop", "oral", "supplement", "topical"];
    expect(types).toHaveLength(4);
  });

  it("InstanceStatus includes expected values", () => {
    const statuses: InstanceStatus[] = ["pending", "confirmed", "snoozed", "skipped"];
    expect(statuses).toHaveLength(4);
  });

  it("UserRole includes expected values", () => {
    const roles: UserRole[] = ["admin", "caretaker"];
    expect(roles).toHaveLength(2);
  });
});
```

**Step 5: Run test to verify it fails**

Run: `cd /Users/mcotse/Developer/yuki_3.0/packages/types && pnpm install && pnpm test`
Expected: FAIL — cannot resolve `../index`

**Step 6: Write the types**

Create `packages/types/src/index.ts`:
```typescript
// --- Enums as union types ---

export type MedicationType = "eye_drop" | "oral" | "supplement" | "topical";

export type InstanceStatus = "pending" | "confirmed" | "snoozed" | "skipped";

export type UserRole = "admin" | "caretaker";

export type ObservationCategory = "symptom" | "snack" | "behavior" | "note";

export type TimeOfDay = "morning" | "midday" | "evening" | "night";

// --- Shared display helpers ---

export const INSTANCE_STATUS_LABELS: Record<InstanceStatus, string> = {
  pending: "Due",
  confirmed: "Done",
  snoozed: "Snoozed",
  skipped: "Skipped",
};

export const MEDICATION_TYPE_LABELS: Record<MedicationType, string> = {
  eye_drop: "Eye Drop",
  oral: "Oral",
  supplement: "Supplement",
  topical: "Topical",
};
```

**Step 7: Run test to verify it passes**

Run: `cd /Users/mcotse/Developer/yuki_3.0/packages/types && pnpm test`
Expected: PASS

**Step 8: Build the package**

Run: `cd /Users/mcotse/Developer/yuki_3.0/packages/types && pnpm build`
Expected: `dist/` created with `.js`, `.mjs`, `.d.ts` files

**Step 9: Link to apps/web**

Add to `apps/web/package.json` dependencies:
```json
"@yuki/types": "workspace:*"
```

Run: `cd /Users/mcotse/Developer/yuki_3.0 && pnpm install`

**Step 10: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add packages/types/ apps/web/package.json pnpm-lock.yaml
git commit -m "feat: add @yuki/types package with shared type definitions"
```

---

### Task 4: Convex backend — schema + init

**Files:**
- Create: `apps/web/convex/schema.ts`
- Create: `apps/web/convex/users.ts`
- Test: `apps/web/convex/__tests__/users.test.ts`

**Step 1: Install Convex**

```bash
cd /Users/mcotse/Developer/yuki_3.0/apps/web
pnpm add convex
```

**Step 2: Initialize Convex project**

```bash
cd /Users/mcotse/Developer/yuki_3.0/apps/web
npx convex dev --once
```

This will prompt you to log in and create a project. It generates:
- `convex/_generated/` directory
- `.env.local` with `NEXT_PUBLIC_CONVEX_URL`

**Step 3: Write the Convex schema**

Create `apps/web/convex/schema.ts`:
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users — synced from Clerk on first login
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("caretaker")),
    avatarUrl: v.optional(v.string()),
    lastSeenAt: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),

  // Pets
  pets: defineTable({
    name: v.string(),
    species: v.string(),
    isActive: v.boolean(),
  }),

  // Medication items (the "what" — e.g., "Prednisolone eye drops")
  items: defineTable({
    petId: v.id("pets"),
    name: v.string(),
    dose: v.string(),
    type: v.union(
      v.literal("eye_drop"),
      v.literal("oral"),
      v.literal("supplement"),
      v.literal("topical")
    ),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    conflictGroup: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_pet", ["petId"])
    .index("by_pet_active", ["petId", "isActive"]),

  // Schedules (the "when" — e.g., "8:00 AM and 8:00 PM")
  itemSchedules: defineTable({
    itemId: v.id("items"),
    timeOfDay: v.union(
      v.literal("morning"),
      v.literal("midday"),
      v.literal("evening"),
      v.literal("night")
    ),
    scheduledHour: v.number(),
    scheduledMinute: v.number(),
    daysOfWeek: v.optional(v.array(v.number())),
  })
    .index("by_item", ["itemId"]),

  // Daily instances (the "did it happen" — one per item per schedule per day)
  dailyInstances: defineTable({
    itemId: v.id("items"),
    scheduleId: v.id("itemSchedules"),
    petId: v.id("pets"),
    date: v.string(),
    scheduledHour: v.number(),
    scheduledMinute: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("snoozed"),
      v.literal("skipped")
    ),
    confirmedBy: v.optional(v.id("users")),
    confirmedAt: v.optional(v.number()),
    snoozedUntil: v.optional(v.number()),
    isObservation: v.boolean(),
    observationCategory: v.optional(
      v.union(
        v.literal("symptom"),
        v.literal("snack"),
        v.literal("behavior"),
        v.literal("note")
      )
    ),
    observationText: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_date", ["date"])
    .index("by_pet_date", ["petId", "date"])
    .index("by_item_date", ["itemId", "date"])
    .index("by_status_date", ["status", "date"]),

  // Confirmation history (audit trail)
  confirmationHistory: defineTable({
    instanceId: v.id("dailyInstances"),
    action: v.union(
      v.literal("confirmed"),
      v.literal("unconfirmed"),
      v.literal("snoozed"),
      v.literal("skipped")
    ),
    performedBy: v.id("users"),
    performedAt: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_instance", ["instanceId"])
    .index("by_performed_at", ["performedAt"]),

  // Presence heartbeats
  presence: defineTable({
    userId: v.id("users"),
    lastHeartbeat: v.number(),
    isOnline: v.boolean(),
  })
    .index("by_user", ["userId"]),
});
```

**Step 4: Push schema to Convex**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && npx convex dev --once`
Expected: Schema pushed, `_generated/` types updated

**Step 5: Write the users query/mutation**

Create `apps/web/convex/users.ts`:
```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrCreate = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      // Update last seen
      await ctx.db.patch(existing._id, { lastSeenAt: Date.now() });
      return existing._id;
    }

    // Create new user — first user is admin, rest are caretakers
    const userCount = (await ctx.db.query("users").collect()).length;
    const role = userCount === 0 ? "admin" : "caretaker";

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name ?? "Unknown",
      email: identity.email ?? "",
      role: role as "admin" | "caretaker",
      avatarUrl: identity.pictureUrl,
      lastSeenAt: Date.now(),
    });
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
```

**Step 6: Install convex-test and write tests**

```bash
cd /Users/mcotse/Developer/yuki_3.0/apps/web
pnpm add -D vitest convex-test @vitejs/plugin-react vite-tsconfig-paths
```

Create `apps/web/convex/__tests__/users.test.ts`:
```typescript
import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";

describe("users", () => {
  describe("getOrCreate", () => {
    it("creates a new user when none exists", async () => {
      const t = convexTest(schema);

      const userId = await t.mutation(
        api.users.getOrCreate,
        {},
        {
          auth: {
            subject: "clerk_123",
            name: "Matthew",
            email: "matt@example.com",
          },
        }
      );

      expect(userId).toBeDefined();

      const user = await t.run(async (ctx) => {
        return await ctx.db.get(userId);
      });

      expect(user).toMatchObject({
        clerkId: "clerk_123",
        name: "Matthew",
        role: "admin", // first user is admin
      });
    });

    it("returns existing user on second call", async () => {
      const t = convexTest(schema);
      const auth = {
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      };

      const firstId = await t.mutation(api.users.getOrCreate, {}, { auth });
      const secondId = await t.mutation(api.users.getOrCreate, {}, { auth });

      expect(firstId).toEqual(secondId);
    });

    it("second user gets caretaker role", async () => {
      const t = convexTest(schema);

      await t.mutation(
        api.users.getOrCreate,
        {},
        {
          auth: {
            subject: "clerk_admin",
            name: "Admin",
            email: "admin@example.com",
          },
        }
      );

      const caretakerId = await t.mutation(
        api.users.getOrCreate,
        {},
        {
          auth: {
            subject: "clerk_caretaker",
            name: "Caretaker",
            email: "caretaker@example.com",
          },
        }
      );

      const caretaker = await t.run(async (ctx) => {
        return await ctx.db.get(caretakerId);
      });

      expect(caretaker?.role).toBe("caretaker");
    });

    it("throws when not authenticated", async () => {
      const t = convexTest(schema);

      await expect(
        t.mutation(api.users.getOrCreate, {})
      ).rejects.toThrow("Not authenticated");
    });
  });

  describe("current", () => {
    it("returns null when not authenticated", async () => {
      const t = convexTest(schema);
      const result = await t.query(api.users.current, {});
      expect(result).toBeNull();
    });

    it("returns user when authenticated", async () => {
      const t = convexTest(schema);
      const auth = {
        subject: "clerk_123",
        name: "Matthew",
        email: "matt@example.com",
      };

      await t.mutation(api.users.getOrCreate, {}, { auth });

      const user = await t.query(api.users.current, {}, { auth });
      expect(user).toMatchObject({
        clerkId: "clerk_123",
        name: "Matthew",
      });
    });
  });
});
```

**Step 7: Create vitest config for Convex tests**

Create `apps/web/vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environmentMatchGlobs: [
      ["convex/**/*.test.ts", "edge-runtime"],
      ["**/*.test.tsx", "jsdom"],
    ],
  },
});
```

Add to `apps/web/package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 8: Run tests to verify they pass**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test`
Expected: All 5 user tests PASS

**Step 9: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/convex/ apps/web/vitest.config.ts apps/web/package.json pnpm-lock.yaml .env.local
git commit -m "feat: add Convex backend with schema and user functions"
```

> **Note:** Do NOT commit `.env.local` to a public repo. For this private project it's fine, but add it to `.gitignore` if sharing.

---

### Task 5: Clerk auth + ConvexProviderWithClerk

**Files:**
- Create: `apps/web/convex/auth.config.ts`
- Create: `apps/web/app/providers.tsx`
- Modify: `apps/web/app/layout.tsx`
- Create: `apps/web/.env.local` (add Clerk keys)

**Step 1: Install Clerk**

```bash
cd /Users/mcotse/Developer/yuki_3.0/apps/web
pnpm add @clerk/nextjs
```

**Step 2: Get Clerk credentials**

1. Go to https://dashboard.clerk.com
2. Create application "Yuki 3.0"
3. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
4. Go to JWT Templates → Create "Convex" template
5. Copy the issuer domain

**Step 3: Add environment variables**

Add to `apps/web/.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=<your convex url>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your clerk key>
CLERK_SECRET_KEY=<your clerk secret>
```

**Step 4: Create Convex auth config**

Create `apps/web/convex/auth.config.ts`:
```typescript
const authConfig = {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
```

Push: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && npx convex dev --once`

**Step 5: Create client providers**

Create `apps/web/app/providers.tsx`:
```tsx
"use client";

import { ReactNode } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

**Step 6: Update root layout**

Replace `apps/web/app/layout.tsx`:
```tsx
import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yuki",
  description: "Pet medication tracker",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface text-on-surface font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Step 7: Verify dev server starts with auth**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm dev`
Expected: Server starts, no errors. Visit localhost:3000 — should see Next.js default page (no auth redirect yet).

**Step 8: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/convex/auth.config.ts apps/web/app/providers.tsx apps/web/app/layout.tsx apps/web/package.json pnpm-lock.yaml
git commit -m "feat: add Clerk auth with ConvexProviderWithClerk"
```

---

### Task 6: Login page + auth middleware

**Files:**
- Create: `apps/web/app/login/[[...login]]/page.tsx`
- Create: `apps/web/middleware.ts`
- Modify: `apps/web/app/page.tsx`
- Test: verify login flow manually

**Step 1: Create login page**

Create `apps/web/app/login/[[...login]]/page.tsx`:
```tsx
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-surface-dim">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-on-surface">Yuki</h1>
          <p className="mt-1 text-sm text-on-surface-muted">
            Pet medication tracker
          </p>
        </div>
        <SignIn
          routing="path"
          path="/login"
          afterSignInUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none w-full",
            },
          }}
        />
      </div>
    </div>
  );
}
```

**Step 2: Create Clerk middleware**

Create `apps/web/middleware.ts`:
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/login(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

**Step 3: Update root page to redirect**

Replace `apps/web/app/page.tsx`:
```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

**Step 4: Verify auth flow**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm dev`

Test:
1. Visit `localhost:3000` → should redirect to `/login`
2. Sign in with Clerk → should redirect to `/dashboard` (404 is fine — we haven't built it yet)
3. Visit `localhost:3000/login` while signed in → should show sign-in (Clerk handles this)

**Step 5: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/app/login/ apps/web/middleware.ts apps/web/app/page.tsx
git commit -m "feat: add login page with Clerk auth middleware"
```

---

### Task 7: App shell + bottom tab bar + route structure

**Files:**
- Create: `apps/web/app/dashboard/page.tsx`
- Create: `apps/web/app/dashboard/layout.tsx`
- Create: `apps/web/app/history/page.tsx`
- Create: `apps/web/app/settings/page.tsx`
- Create: `apps/web/components/bottom-tabs.tsx`
- Create: `apps/web/components/app-shell.tsx`
- Test: `apps/web/components/__tests__/bottom-tabs.test.tsx`

**Step 1: Install test dependencies**

```bash
cd /Users/mcotse/Developer/yuki_3.0/apps/web
pnpm add -D @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom @vitejs/plugin-react
```

**Step 2: Write the failing test for bottom tabs**

Create `apps/web/components/__tests__/bottom-tabs.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomTabs } from "../bottom-tabs";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("BottomTabs", () => {
  it("renders three tab links", () => {
    render(<BottomTabs />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /history/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /settings/i })).toBeDefined();
  });

  it("highlights the active tab", () => {
    render(<BottomTabs />);

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink.className).toContain("text-primary");
  });
});
```

**Step 3: Run test to verify it fails**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- components/`
Expected: FAIL — cannot find `../bottom-tabs`

**Step 4: Implement BottomTabs**

Create `apps/web/components/bottom-tabs.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: "●" },
  { href: "/history", label: "History", icon: "◷" },
  { href: "/settings", label: "Settings", icon: "⚙" },
] as const;

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-container bg-surface pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-14 max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors ${
                isActive
                  ? "text-primary font-medium"
                  : "text-on-surface-muted"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Step 5: Run test to verify it passes**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- components/`
Expected: PASS

**Step 6: Create app shell**

Create `apps/web/components/app-shell.tsx`:
```tsx
import { BottomTabs } from "./bottom-tabs";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-svh max-w-md bg-surface pb-20">
      <main className="px-4 pt-4">{children}</main>
      <BottomTabs />
    </div>
  );
}
```

**Step 7: Create route pages**

Create `apps/web/app/(app)/layout.tsx`:
```tsx
import { AppShell } from "@/components/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

Create `apps/web/app/(app)/dashboard/page.tsx`:
```tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-bold">Dashboard</h1>
      <p className="mt-2 text-on-surface-muted">
        Your medications will appear here.
      </p>
    </div>
  );
}
```

Create `apps/web/app/(app)/history/page.tsx`:
```tsx
export default function HistoryPage() {
  return (
    <div>
      <h1 className="text-xl font-bold">History</h1>
      <p className="mt-2 text-on-surface-muted">
        Medication history will appear here.
      </p>
    </div>
  );
}
```

Create `apps/web/app/(app)/settings/page.tsx`:
```tsx
export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold">Settings</h1>
      <p className="mt-2 text-on-surface-muted">
        Account settings will appear here.
      </p>
    </div>
  );
}
```

**Step 8: Update root page redirect**

Update `apps/web/app/page.tsx` (already done in Task 6 — redirects to `/dashboard`).

**Step 9: Verify app shell renders**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm dev`
Expected: Login → Dashboard with bottom tab bar, tab navigation works between Dashboard/History/Settings.

**Step 10: Verify build**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm build`
Expected: No errors

**Step 11: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/components/ apps/web/app/\(app\)/
git commit -m "feat: add app shell with bottom tab bar and route structure"
```

---

### Task 8: Serwist PWA setup

**Files:**
- Create: `apps/web/app/sw.ts`
- Create: `apps/web/app/manifest.ts`
- Modify: `apps/web/next.config.ts`
- Test: verify PWA manifest and service worker registration

**Step 1: Install Serwist**

```bash
cd /Users/mcotse/Developer/yuki_3.0/apps/web
pnpm add @serwist/next
pnpm add -D @serwist/precaching serwist
```

**Step 2: Create service worker**

Create `apps/web/app/sw.ts`:
```typescript
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "@serwist/precaching";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    concurrency: 10,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

**Step 3: Create web manifest**

Create `apps/web/app/manifest.ts`:
```typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yuki — Pet Medication Tracker",
    short_name: "Yuki",
    description: "Track and coordinate pet medications between caretakers",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
```

**Step 4: Update Next.js config for Serwist**

Replace `apps/web/next.config.ts`:
```typescript
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
};

export default withSerwist(nextConfig);
```

**Step 5: Create placeholder icons**

Create simple placeholder PNG files at `apps/web/public/icon-192.png` and `apps/web/public/icon-512.png`. (Use any solid-color square for now — real icons come in V9.)

```bash
cd /Users/mcotse/Developer/yuki_3.0/apps/web/public
# Create 1x1 PNG placeholders (will be replaced with real icons in V9)
printf '\x89PNG\r\n\x1a\n' > icon-192.png
printf '\x89PNG\r\n\x1a\n' > icon-512.png
```

**Step 6: Verify build with Serwist**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm build`
Expected: Build succeeds. Check that `public/sw.js` is generated.

**Step 7: Verify manifest**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm start`
Visit: `http://localhost:3000/manifest.webmanifest`
Expected: JSON manifest with app name, icons, display:standalone

**Step 8: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/app/sw.ts apps/web/app/manifest.ts apps/web/next.config.ts apps/web/public/
git commit -m "feat: add Serwist PWA with service worker and manifest"
```

---

### Task 9: Custom offline layer (IndexedDB)

**Files:**
- Create: `apps/web/lib/offline.ts`
- Test: `apps/web/lib/__tests__/offline.test.ts`

**Step 1: Install fake-indexeddb for testing**

```bash
cd /Users/mcotse/Developer/yuki_3.0/apps/web
pnpm add idb
pnpm add -D fake-indexeddb
```

**Step 2: Write the failing test**

Create `apps/web/lib/__tests__/offline.test.ts`:
```typescript
import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import {
  offlineStore,
  type CachedInstance,
  type PendingMutation,
} from "../offline";

beforeEach(async () => {
  await offlineStore.clear();
});

describe("offlineStore", () => {
  describe("cacheInstances", () => {
    it("stores and retrieves today's instances", async () => {
      const instances: CachedInstance[] = [
        {
          _id: "inst_1" as any,
          itemId: "item_1" as any,
          scheduleId: "sched_1" as any,
          petId: "pet_1" as any,
          date: "2026-02-07",
          scheduledHour: 8,
          scheduledMinute: 0,
          status: "pending",
          isObservation: false,
          itemName: "Prednisolone",
          itemDose: "1 drop",
          itemType: "eye_drop",
        },
      ];

      await offlineStore.cacheInstances("2026-02-07", instances);
      const cached = await offlineStore.getCachedInstances("2026-02-07");

      expect(cached).toHaveLength(1);
      expect(cached[0].itemName).toBe("Prednisolone");
    });
  });

  describe("mutation queue", () => {
    it("queues a pending mutation", async () => {
      const mutation: PendingMutation = {
        id: "mut_1",
        type: "confirm",
        instanceId: "inst_1" as any,
        timestamp: Date.now(),
        args: { notes: "" },
      };

      await offlineStore.queueMutation(mutation);
      const pending = await offlineStore.getPendingMutations();

      expect(pending).toHaveLength(1);
      expect(pending[0].type).toBe("confirm");
    });

    it("removes a mutation after flush", async () => {
      const mutation: PendingMutation = {
        id: "mut_1",
        type: "confirm",
        instanceId: "inst_1" as any,
        timestamp: Date.now(),
        args: {},
      };

      await offlineStore.queueMutation(mutation);
      await offlineStore.removeMutation("mut_1");
      const pending = await offlineStore.getPendingMutations();

      expect(pending).toHaveLength(0);
    });
  });

  describe("isOnline", () => {
    it("defaults to true", () => {
      expect(offlineStore.isOnline()).toBe(true);
    });
  });
});
```

**Step 3: Run test to verify it fails**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- lib/`
Expected: FAIL — cannot resolve `../offline`

**Step 4: Implement offline store**

Create `apps/web/lib/offline.ts`:
```typescript
import { openDB, type IDBPDatabase } from "idb";

export interface CachedInstance {
  _id: string;
  itemId: string;
  scheduleId: string;
  petId: string;
  date: string;
  scheduledHour: number;
  scheduledMinute: number;
  status: "pending" | "confirmed" | "snoozed" | "skipped";
  confirmedBy?: string;
  confirmedAt?: number;
  snoozedUntil?: number;
  isObservation: boolean;
  observationCategory?: string;
  observationText?: string;
  notes?: string;
  // Denormalized from items for offline display
  itemName: string;
  itemDose: string;
  itemType: string;
}

export interface PendingMutation {
  id: string;
  type: "confirm" | "undo" | "snooze";
  instanceId: string;
  timestamp: number;
  args: Record<string, unknown>;
}

interface YukiDB {
  instances: {
    key: string;
    value: { date: string; instances: CachedInstance[] };
  };
  mutations: {
    key: string;
    value: PendingMutation;
  };
}

const DB_NAME = "yuki-offline";
const DB_VERSION = 1;

function getDB(): Promise<IDBPDatabase<YukiDB>> {
  return openDB<YukiDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("instances")) {
        db.createObjectStore("instances", { keyPath: "date" });
      }
      if (!db.objectStoreNames.contains("mutations")) {
        db.createObjectStore("mutations", { keyPath: "id" });
      }
    },
  });
}

export const offlineStore = {
  async cacheInstances(date: string, instances: CachedInstance[]) {
    const db = await getDB();
    await db.put("instances", { date, instances });
  },

  async getCachedInstances(date: string): Promise<CachedInstance[]> {
    const db = await getDB();
    const record = await db.get("instances", date);
    return record?.instances ?? [];
  },

  async queueMutation(mutation: PendingMutation) {
    const db = await getDB();
    await db.put("mutations", mutation);
  },

  async getPendingMutations(): Promise<PendingMutation[]> {
    const db = await getDB();
    return await db.getAll("mutations");
  },

  async removeMutation(id: string) {
    const db = await getDB();
    await db.delete("mutations", id);
  },

  async clear() {
    const db = await getDB();
    await db.clear("instances");
    await db.clear("mutations");
  },

  isOnline(): boolean {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  },
};
```

**Step 5: Run test to verify it passes**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- lib/`
Expected: All 4 offline tests PASS

**Step 6: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/lib/offline.ts apps/web/lib/__tests__/offline.test.ts apps/web/package.json pnpm-lock.yaml
git commit -m "feat: add IndexedDB offline layer with instance cache and mutation queue"
```

---

### Task 10: oxlint config

**Files:**
- Create: `.oxlintrc.json` (root)
- Modify: `package.json` (root — add lint script)

**Step 1: Install oxlint**

```bash
cd /Users/mcotse/Developer/yuki_3.0
pnpm add -D oxlint -w
```

**Step 2: Create config**

Create `.oxlintrc.json`:
```json
{
  "rules": {
    "correctness": "warn",
    "suspicious": "warn",
    "pedantic": "off",
    "perf": "warn"
  },
  "env": {
    "browser": true,
    "node": true,
    "es2021": true
  }
}
```

**Step 3: Add root lint script**

Add to root `package.json` scripts:
```json
"lint": "oxlint apps/ packages/"
```

**Step 4: Verify lint runs**

Run: `cd /Users/mcotse/Developer/yuki_3.0 && pnpm lint`
Expected: Runs, reports any issues (fix if found)

**Step 5: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add .oxlintrc.json package.json pnpm-lock.yaml
git commit -m "chore: add oxlint configuration"
```

---

### Task 11: V1 verification — end-to-end smoke test

**Files:** None new — this is a manual verification task.

**Step 1: Run full test suite**

Run: `cd /Users/mcotse/Developer/yuki_3.0 && pnpm test`
Expected: All tests pass across both packages

**Step 2: Run full build**

Run: `cd /Users/mcotse/Developer/yuki_3.0 && pnpm build`
Expected: Both packages build without errors

**Step 3: Run lint**

Run: `cd /Users/mcotse/Developer/yuki_3.0 && pnpm lint`
Expected: No errors

**Step 4: Manual smoke test**

1. `cd apps/web && pnpm dev`
2. Visit `localhost:3000` → redirects to `/login`
3. Sign in via Clerk
4. Redirected to `/dashboard` — see "Dashboard" heading + bottom tabs
5. Tap History tab → see History page
6. Tap Settings tab → see Settings page
7. Tap Dashboard tab → back to Dashboard

**Step 5: Verify Convex is connected**

Open browser console on dashboard page. No Convex connection errors.

**Step 6: Tag V1 complete**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git tag v1-foundation-login
```

---

## V2: Dashboard Core

### Task 12: Seed data — pet + items + schedules

**Files:**
- Create: `apps/web/convex/seed.ts`
- Test: `apps/web/convex/__tests__/seed.test.ts`

**Step 1: Write the failing test**

Create `apps/web/convex/__tests__/seed.test.ts`:
```typescript
import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api, internal } from "../_generated/api";
import schema from "../schema";

describe("seed", () => {
  it("creates a pet, items, and schedules", async () => {
    const t = convexTest(schema);

    await t.mutation(internal.seed.seedDemoData, {});

    const pets = await t.run(async (ctx) => {
      return await ctx.db.query("pets").collect();
    });
    expect(pets).toHaveLength(1);
    expect(pets[0].name).toBe("Yuki");

    const items = await t.run(async (ctx) => {
      return await ctx.db.query("items").collect();
    });
    expect(items.length).toBeGreaterThanOrEqual(3);

    const schedules = await t.run(async (ctx) => {
      return await ctx.db.query("itemSchedules").collect();
    });
    expect(schedules.length).toBeGreaterThanOrEqual(3);
  });

  it("is idempotent — does not duplicate on second run", async () => {
    const t = convexTest(schema);

    await t.mutation(internal.seed.seedDemoData, {});
    await t.mutation(internal.seed.seedDemoData, {});

    const pets = await t.run(async (ctx) => {
      return await ctx.db.query("pets").collect();
    });
    expect(pets).toHaveLength(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- convex/__tests__/seed`
Expected: FAIL — `internal.seed.seedDemoData` does not exist

**Step 3: Implement seed function**

Create `apps/web/convex/seed.ts`:
```typescript
import { internalMutation } from "./_generated/server";

export const seedDemoData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Idempotency: skip if pet already exists
    const existingPet = await ctx.db.query("pets").first();
    if (existingPet) return;

    // Create pet
    const petId = await ctx.db.insert("pets", {
      name: "Yuki",
      species: "dog",
      isActive: true,
    });

    // Create medications
    const prednisolone = await ctx.db.insert("items", {
      petId,
      name: "Prednisolone",
      dose: "1 drop, left eye",
      type: "eye_drop",
      location: "Fridge",
      conflictGroup: "eye_drops",
      isActive: true,
    });

    const cyclosporine = await ctx.db.insert("items", {
      petId,
      name: "Cyclosporine",
      dose: "1 drop, both eyes",
      type: "eye_drop",
      location: "Cabinet",
      conflictGroup: "eye_drops",
      isActive: true,
      notes: "Must wait 5 min after Prednisolone",
    });

    const galliprant = await ctx.db.insert("items", {
      petId,
      name: "Galliprant",
      dose: "20mg tablet",
      type: "oral",
      location: "Cabinet",
      isActive: true,
      notes: "Give with food",
    });

    const fishoil = await ctx.db.insert("items", {
      petId,
      name: "Fish Oil",
      dose: "1 pump",
      type: "supplement",
      location: "Cabinet",
      isActive: true,
    });

    // Create schedules
    // Prednisolone: morning and evening
    await ctx.db.insert("itemSchedules", {
      itemId: prednisolone,
      timeOfDay: "morning",
      scheduledHour: 8,
      scheduledMinute: 0,
    });
    await ctx.db.insert("itemSchedules", {
      itemId: prednisolone,
      timeOfDay: "evening",
      scheduledHour: 20,
      scheduledMinute: 0,
    });

    // Cyclosporine: morning and evening (5 min after prednisolone)
    await ctx.db.insert("itemSchedules", {
      itemId: cyclosporine,
      timeOfDay: "morning",
      scheduledHour: 8,
      scheduledMinute: 5,
    });
    await ctx.db.insert("itemSchedules", {
      itemId: cyclosporine,
      timeOfDay: "evening",
      scheduledHour: 20,
      scheduledMinute: 5,
    });

    // Galliprant: morning only
    await ctx.db.insert("itemSchedules", {
      itemId: galliprant,
      timeOfDay: "morning",
      scheduledHour: 8,
      scheduledMinute: 0,
    });

    // Fish oil: morning only
    await ctx.db.insert("itemSchedules", {
      itemId: fishoil,
      timeOfDay: "morning",
      scheduledHour: 8,
      scheduledMinute: 0,
    });
  },
});
```

**Step 4: Push to Convex and regenerate types**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && npx convex dev --once`

**Step 5: Run test to verify it passes**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- convex/__tests__/seed`
Expected: Both tests PASS

**Step 6: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/convex/seed.ts apps/web/convex/__tests__/seed.test.ts
git commit -m "feat: add seed data with demo medications and schedules"
```

---

### Task 13: Instance generator

**Files:**
- Create: `apps/web/convex/instances.ts`
- Test: `apps/web/convex/__tests__/instances.test.ts`

**Step 1: Write the failing test**

Create `apps/web/convex/__tests__/instances.test.ts`:
```typescript
import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api, internal } from "../_generated/api";
import schema from "../schema";

// Helper to seed data and generate instances
async function setupWithInstances(t: ReturnType<typeof convexTest>, date: string) {
  await t.mutation(internal.seed.seedDemoData, {});
  await t.mutation(internal.instances.generateDailyInstances, { date });
}

describe("instances", () => {
  describe("generateDailyInstances", () => {
    it("creates instances for all active schedules on a given date", async () => {
      const t = convexTest(schema);
      await setupWithInstances(t, "2026-02-07");

      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });

      // 6 schedules → 6 instances
      expect(instances).toHaveLength(6);
      expect(instances.every((i) => i.status === "pending")).toBe(true);
    });

    it("is idempotent — does not duplicate instances", async () => {
      const t = convexTest(schema);
      await t.mutation(internal.seed.seedDemoData, {});
      await t.mutation(internal.instances.generateDailyInstances, { date: "2026-02-07" });
      await t.mutation(internal.instances.generateDailyInstances, { date: "2026-02-07" });

      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });

      expect(instances).toHaveLength(6);
    });
  });

  describe("getToday", () => {
    it("returns today's instances with item details", async () => {
      const t = convexTest(schema);
      await setupWithInstances(t, "2026-02-07");

      const result = await t.query(api.instances.getToday, { date: "2026-02-07" });

      expect(result.instances).toHaveLength(6);
      expect(result.instances[0]).toHaveProperty("itemName");
      expect(result.instances[0]).toHaveProperty("itemDose");
      expect(result.progress.total).toBe(6);
      expect(result.progress.done).toBe(0);
    });

    it("computes heroItem as the most urgent pending instance", async () => {
      const t = convexTest(schema);
      await setupWithInstances(t, "2026-02-07");

      const result = await t.query(api.instances.getToday, { date: "2026-02-07" });

      expect(result.heroItem).not.toBeNull();
      expect(result.heroItem?.status).toBe("pending");
      // Hero should be the earliest scheduled item
      expect(result.heroItem?.scheduledHour).toBe(8);
      expect(result.heroItem?.scheduledMinute).toBe(0);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- convex/__tests__/instances`
Expected: FAIL — `internal.instances.generateDailyInstances` does not exist

**Step 3: Implement instance generator and query**

Create `apps/web/convex/instances.ts`:
```typescript
import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const generateDailyInstances = internalMutation({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    // Check if instances already exist for this date
    const existing = await ctx.db
      .query("dailyInstances")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();

    if (existing) return;

    // Get all active items with their schedules
    const items = await ctx.db
      .query("items")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const item of items) {
      const schedules = await ctx.db
        .query("itemSchedules")
        .withIndex("by_item", (q) => q.eq("itemId", item._id))
        .collect();

      for (const schedule of schedules) {
        await ctx.db.insert("dailyInstances", {
          itemId: item._id,
          scheduleId: schedule._id,
          petId: item.petId,
          date,
          scheduledHour: schedule.scheduledHour,
          scheduledMinute: schedule.scheduledMinute,
          status: "pending",
          isObservation: false,
        });
      }
    }
  },
});

// Enriched instance type for the client
interface EnrichedInstance {
  _id: string;
  itemId: string;
  scheduleId: string;
  petId: string;
  date: string;
  scheduledHour: number;
  scheduledMinute: number;
  status: "pending" | "confirmed" | "snoozed" | "skipped";
  confirmedBy?: string;
  confirmedAt?: number;
  snoozedUntil?: number;
  isObservation: boolean;
  observationCategory?: string;
  observationText?: string;
  notes?: string;
  itemName: string;
  itemDose: string;
  itemType: string;
  itemLocation?: string;
  conflictGroup?: string;
}

export const getToday = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const rawInstances = await ctx.db
      .query("dailyInstances")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();

    // Enrich with item details
    const instances: EnrichedInstance[] = await Promise.all(
      rawInstances.map(async (inst) => {
        const item = await ctx.db.get(inst.itemId);
        return {
          _id: inst._id as unknown as string,
          itemId: inst.itemId as unknown as string,
          scheduleId: inst.scheduleId as unknown as string,
          petId: inst.petId as unknown as string,
          date: inst.date,
          scheduledHour: inst.scheduledHour,
          scheduledMinute: inst.scheduledMinute,
          status: inst.status,
          confirmedBy: inst.confirmedBy as unknown as string | undefined,
          confirmedAt: inst.confirmedAt,
          snoozedUntil: inst.snoozedUntil,
          isObservation: inst.isObservation,
          observationCategory: inst.observationCategory,
          observationText: inst.observationText,
          notes: inst.notes,
          itemName: item?.name ?? "Unknown",
          itemDose: item?.dose ?? "",
          itemType: item?.type ?? "oral",
          itemLocation: item?.location,
          conflictGroup: item?.conflictGroup,
        };
      })
    );

    // Sort by scheduled time
    instances.sort((a, b) => {
      const aMin = a.scheduledHour * 60 + a.scheduledMinute;
      const bMin = b.scheduledHour * 60 + b.scheduledMinute;
      return aMin - bMin;
    });

    // Compute progress
    const done = instances.filter((i) => i.status === "confirmed").length;
    const total = instances.filter((i) => !i.isObservation).length;

    // Compute hero item: first pending instance that is due or overdue
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const heroItem =
      instances.find(
        (i) =>
          i.status === "pending" &&
          !i.isObservation &&
          i.scheduledHour * 60 + i.scheduledMinute <= currentMinutes
      ) ??
      instances.find((i) => i.status === "pending" && !i.isObservation) ??
      null;

    return {
      instances,
      heroItem,
      progress: { done, total },
    };
  },
});
```

**Step 4: Push to Convex and regenerate types**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && npx convex dev --once`

**Step 5: Run test to verify it passes**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- convex/__tests__/instances`
Expected: All 4 tests PASS

**Step 6: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/convex/instances.ts apps/web/convex/__tests__/instances.test.ts
git commit -m "feat: add instance generator and getToday query with hero item computation"
```

---

### Task 14: Confirm + undo actions

**Files:**
- Create: `apps/web/convex/actions.ts`
- Test: `apps/web/convex/__tests__/actions.test.ts`

**Step 1: Write the failing test**

Create `apps/web/convex/__tests__/actions.test.ts`:
```typescript
import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api, internal } from "../_generated/api";
import schema from "../schema";

async function setupWithInstances(t: ReturnType<typeof convexTest>) {
  // Create a user
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      clerkId: "clerk_123",
      name: "Matthew",
      email: "matt@example.com",
      role: "admin",
      lastSeenAt: Date.now(),
    });
  });

  await t.mutation(internal.seed.seedDemoData, {});
  await t.mutation(internal.instances.generateDailyInstances, {
    date: "2026-02-07",
  });

  return userId;
}

describe("actions", () => {
  describe("confirm", () => {
    it("marks an instance as confirmed", async () => {
      const t = convexTest(schema);
      const userId = await setupWithInstances(t);

      // Get first pending instance
      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });
      const instanceId = instances[0]._id;

      await t.mutation(
        api.actions.confirm,
        { instanceId, notes: "" },
        {
          auth: { subject: "clerk_123", name: "Matthew", email: "matt@example.com" },
        }
      );

      const updated = await t.run(async (ctx) => {
        return await ctx.db.get(instanceId);
      });

      expect(updated?.status).toBe("confirmed");
      expect(updated?.confirmedBy).toEqual(userId);
      expect(updated?.confirmedAt).toBeDefined();
    });

    it("creates a confirmation history entry", async () => {
      const t = convexTest(schema);
      await setupWithInstances(t);

      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });
      const instanceId = instances[0]._id;

      await t.mutation(
        api.actions.confirm,
        { instanceId, notes: "Given with breakfast" },
        {
          auth: { subject: "clerk_123", name: "Matthew", email: "matt@example.com" },
        }
      );

      const history = await t.run(async (ctx) => {
        return await ctx.db
          .query("confirmationHistory")
          .withIndex("by_instance", (q) => q.eq("instanceId", instanceId))
          .collect();
      });

      expect(history).toHaveLength(1);
      expect(history[0].action).toBe("confirmed");
      expect(history[0].notes).toBe("Given with breakfast");
    });

    it("prevents double-confirm", async () => {
      const t = convexTest(schema);
      await setupWithInstances(t);

      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });
      const instanceId = instances[0]._id;

      const auth = { subject: "clerk_123", name: "Matthew", email: "matt@example.com" };

      await t.mutation(api.actions.confirm, { instanceId, notes: "" }, { auth });

      await expect(
        t.mutation(api.actions.confirm, { instanceId, notes: "" }, { auth })
      ).rejects.toThrow("already confirmed");
    });
  });

  describe("undo", () => {
    it("reverts a confirmed instance back to pending", async () => {
      const t = convexTest(schema);
      await setupWithInstances(t);

      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });
      const instanceId = instances[0]._id;

      const auth = { subject: "clerk_123", name: "Matthew", email: "matt@example.com" };

      await t.mutation(api.actions.confirm, { instanceId, notes: "" }, { auth });
      await t.mutation(api.actions.undo, { instanceId }, { auth });

      const updated = await t.run(async (ctx) => {
        return await ctx.db.get(instanceId);
      });

      expect(updated?.status).toBe("pending");
      expect(updated?.confirmedBy).toBeUndefined();
    });

    it("creates an unconfirmed history entry", async () => {
      const t = convexTest(schema);
      await setupWithInstances(t);

      const instances = await t.run(async (ctx) => {
        return await ctx.db
          .query("dailyInstances")
          .withIndex("by_date", (q) => q.eq("date", "2026-02-07"))
          .collect();
      });
      const instanceId = instances[0]._id;

      const auth = { subject: "clerk_123", name: "Matthew", email: "matt@example.com" };

      await t.mutation(api.actions.confirm, { instanceId, notes: "" }, { auth });
      await t.mutation(api.actions.undo, { instanceId }, { auth });

      const history = await t.run(async (ctx) => {
        return await ctx.db
          .query("confirmationHistory")
          .withIndex("by_instance", (q) => q.eq("instanceId", instanceId))
          .collect();
      });

      expect(history).toHaveLength(2);
      expect(history[1].action).toBe("unconfirmed");
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- convex/__tests__/actions`
Expected: FAIL — `api.actions.confirm` does not exist

**Step 3: Implement confirm and undo mutations**

Create `apps/web/convex/actions.ts`:
```typescript
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const confirm = mutation({
  args: {
    instanceId: v.id("dailyInstances"),
    notes: v.string(),
  },
  handler: async (ctx, { instanceId, notes }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const instance = await ctx.db.get(instanceId);
    if (!instance) throw new Error("Instance not found");
    if (instance.status === "confirmed") {
      throw new Error("Instance already confirmed");
    }

    const now = Date.now();

    await ctx.db.patch(instanceId, {
      status: "confirmed",
      confirmedBy: user._id,
      confirmedAt: now,
    });

    await ctx.db.insert("confirmationHistory", {
      instanceId,
      action: "confirmed",
      performedBy: user._id,
      performedAt: now,
      notes: notes || undefined,
    });
  },
});

export const undo = mutation({
  args: {
    instanceId: v.id("dailyInstances"),
  },
  handler: async (ctx, { instanceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const instance = await ctx.db.get(instanceId);
    if (!instance) throw new Error("Instance not found");

    await ctx.db.patch(instanceId, {
      status: "pending",
      confirmedBy: undefined,
      confirmedAt: undefined,
    });

    await ctx.db.insert("confirmationHistory", {
      instanceId,
      action: "unconfirmed",
      performedBy: user._id,
      performedAt: Date.now(),
    });
  },
});
```

**Step 4: Push to Convex and regenerate types**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && npx convex dev --once`

**Step 5: Run test to verify it passes**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- convex/__tests__/actions`
Expected: All 5 tests PASS

**Step 6: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/convex/actions.ts apps/web/convex/__tests__/actions.test.ts
git commit -m "feat: add confirm and undo mutations with audit trail and double-dose prevention"
```

---

### Task 15: Dashboard skeleton screen

**Files:**
- Create: `apps/web/components/skeleton.tsx`
- Create: `apps/web/components/dashboard-skeleton.tsx`
- Test: `apps/web/components/__tests__/dashboard-skeleton.test.tsx`

**Step 1: Write the failing test**

Create `apps/web/components/__tests__/dashboard-skeleton.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardSkeleton } from "../dashboard-skeleton";

describe("DashboardSkeleton", () => {
  it("renders skeleton elements", () => {
    render(<DashboardSkeleton />);
    const skeletons = screen.getAllByTestId("skeleton-block");
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- components/__tests__/dashboard-skeleton`
Expected: FAIL

**Step 3: Implement skeleton components**

Create `apps/web/components/skeleton.tsx`:
```tsx
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      data-testid="skeleton-block"
      className={`animate-pulse rounded-lg bg-surface-container ${className}`}
    />
  );
}
```

Create `apps/web/components/dashboard-skeleton.tsx`:
```tsx
import { Skeleton } from "./skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Hero card skeleton */}
      <Skeleton className="h-40 w-full" />
      {/* Progress ring skeleton */}
      <Skeleton className="mx-auto h-12 w-32" />
      {/* Timeline items skeleton */}
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- components/__tests__/dashboard-skeleton`
Expected: PASS

**Step 5: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/components/skeleton.tsx apps/web/components/dashboard-skeleton.tsx apps/web/components/__tests__/dashboard-skeleton.test.tsx
git commit -m "feat: add skeleton loading components for dashboard"
```

---

### Task 16: Progress ring component

**Files:**
- Create: `apps/web/components/progress-ring.tsx`
- Test: `apps/web/components/__tests__/progress-ring.test.tsx`

**Step 1: Write the failing test**

Create `apps/web/components/__tests__/progress-ring.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressRing } from "../progress-ring";

describe("ProgressRing", () => {
  it("displays done/total text", () => {
    render(<ProgressRing done={3} total={6} />);
    expect(screen.getByText("3 / 6")).toBeDefined();
  });

  it("shows 'All done!' when complete", () => {
    render(<ProgressRing done={6} total={6} />);
    expect(screen.getByText("All done!")).toBeDefined();
  });

  it("renders an SVG circle", () => {
    const { container } = render(<ProgressRing done={2} total={5} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- components/__tests__/progress-ring`
Expected: FAIL

**Step 3: Implement ProgressRing**

Create `apps/web/components/progress-ring.tsx`:
```tsx
interface ProgressRingProps {
  done: number;
  total: number;
}

export function ProgressRing({ done, total }: ProgressRingProps) {
  const percentage = total === 0 ? 0 : done / total;
  const isComplete = done === total && total > 0;

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage);

  return (
    <div className="flex items-center gap-3">
      <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
        {/* Background circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-surface-container"
        />
        {/* Progress circle */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={isComplete ? "text-success" : "text-primary"}
        />
      </svg>
      <span className="text-sm font-medium text-on-surface">
        {isComplete ? "All done!" : `${done} / ${total}`}
      </span>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- components/__tests__/progress-ring`
Expected: All 3 tests PASS

**Step 5: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/components/progress-ring.tsx apps/web/components/__tests__/progress-ring.test.tsx
git commit -m "feat: add ProgressRing component with SVG circle"
```

---

### Task 17: Hero card component

**Files:**
- Create: `apps/web/components/hero-card.tsx`
- Test: `apps/web/components/__tests__/hero-card.test.tsx`

**Step 1: Write the failing test**

Create `apps/web/components/__tests__/hero-card.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroCard } from "../hero-card";

describe("HeroCard", () => {
  const mockInstance = {
    _id: "inst_1",
    itemName: "Prednisolone",
    itemDose: "1 drop, left eye",
    itemType: "eye_drop" as const,
    scheduledHour: 8,
    scheduledMinute: 0,
    status: "pending" as const,
    itemLocation: "Fridge",
  };

  it("displays medication name and dose", () => {
    render(<HeroCard item={mockInstance} onConfirm={() => {}} />);
    expect(screen.getByText("Prednisolone")).toBeDefined();
    expect(screen.getByText("1 drop, left eye")).toBeDefined();
  });

  it("displays scheduled time", () => {
    render(<HeroCard item={mockInstance} onConfirm={() => {}} />);
    expect(screen.getByText("8:00 AM")).toBeDefined();
  });

  it("shows confirm button when pending", () => {
    render(<HeroCard item={mockInstance} onConfirm={() => {}} />);
    expect(screen.getByRole("button", { name: /confirm/i })).toBeDefined();
  });

  it("calls onConfirm when button is clicked", () => {
    const onConfirm = vi.fn();
    render(<HeroCard item={mockInstance} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledWith("inst_1");
  });

  it("shows all-clear state when item is null", () => {
    render(<HeroCard item={null} onConfirm={() => {}} />);
    expect(screen.getByText(/all clear/i)).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- components/__tests__/hero-card`
Expected: FAIL

**Step 3: Implement HeroCard**

Create `apps/web/components/hero-card.tsx`:
```tsx
"use client";

interface HeroItem {
  _id: string;
  itemName: string;
  itemDose: string;
  itemType: string;
  scheduledHour: number;
  scheduledMinute: number;
  status: string;
  itemLocation?: string;
}

interface HeroCardProps {
  item: HeroItem | null;
  onConfirm: (instanceId: string) => void;
}

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

export function HeroCard({ item, onConfirm }: HeroCardProps) {
  if (!item) {
    return (
      <div className="rounded-2xl bg-success/10 p-6 text-center">
        <p className="text-lg font-semibold text-success">All clear!</p>
        <p className="mt-1 text-sm text-on-surface-muted">
          Nothing due right now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-primary/5 p-6">
      <div className="mb-1 text-xs font-medium uppercase tracking-wider text-on-surface-muted">
        Right Now
      </div>
      <h2 className="text-xl font-bold text-on-surface">{item.itemName}</h2>
      <p className="mt-0.5 text-sm text-on-surface-muted">{item.itemDose}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-muted">
        <span>{formatTime(item.scheduledHour, item.scheduledMinute)}</span>
        {item.itemLocation && (
          <>
            <span aria-hidden="true">·</span>
            <span>{item.itemLocation}</span>
          </>
        )}
      </div>
      <button
        onClick={() => onConfirm(item._id)}
        className="mt-4 w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white active:scale-[0.98] transition-transform"
      >
        Confirm
      </button>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- components/__tests__/hero-card`
Expected: All 5 tests PASS

**Step 5: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/components/hero-card.tsx apps/web/components/__tests__/hero-card.test.tsx
git commit -m "feat: add HeroCard component with confirm action and all-clear state"
```

---

### Task 18: Undo toast component

**Files:**
- Create: `apps/web/components/undo-toast.tsx`
- Test: `apps/web/components/__tests__/undo-toast.test.tsx`

**Step 1: Write the failing test**

Create `apps/web/components/__tests__/undo-toast.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { UndoToast } from "../undo-toast";

describe("UndoToast", () => {
  it("displays the medication name", () => {
    render(
      <UndoToast
        itemName="Prednisolone"
        onUndo={() => {}}
        onDismiss={() => {}}
      />
    );
    expect(screen.getByText(/prednisolone confirmed/i)).toBeDefined();
  });

  it("calls onUndo when undo button is clicked", () => {
    const onUndo = vi.fn();
    render(
      <UndoToast itemName="Prednisolone" onUndo={onUndo} onDismiss={() => {}} />
    );

    fireEvent.click(screen.getByRole("button", { name: /undo/i }));
    expect(onUndo).toHaveBeenCalled();
  });

  it("calls onDismiss after 5 seconds", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    render(
      <UndoToast
        itemName="Prednisolone"
        onUndo={() => {}}
        onDismiss={onDismiss}
      />
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onDismiss).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- components/__tests__/undo-toast`
Expected: FAIL

**Step 3: Implement UndoToast**

Create `apps/web/components/undo-toast.tsx`:
```tsx
"use client";

import { useEffect } from "react";

interface UndoToastProps {
  itemName: string;
  onUndo: () => void;
  onDismiss: () => void;
}

const DISMISS_MS = 5000;

export function UndoToast({ itemName, onUndo, onDismiss }: UndoToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md">
      <div className="flex items-center justify-between rounded-xl bg-on-surface px-4 py-3 text-surface shadow-lg">
        <span className="text-sm">{itemName} confirmed</span>
        <button
          onClick={onUndo}
          className="ml-4 text-sm font-semibold text-primary-light"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm test -- components/__tests__/undo-toast`
Expected: All 3 tests PASS

**Step 5: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/components/undo-toast.tsx apps/web/components/__tests__/undo-toast.test.tsx
git commit -m "feat: add UndoToast component with 5-second auto-dismiss"
```

---

### Task 19: Wire up dashboard page

**Files:**
- Create: `apps/web/hooks/use-today.ts`
- Modify: `apps/web/app/(app)/dashboard/page.tsx`

**Step 1: Create the useToday hook**

Create `apps/web/hooks/use-today.ts`:
```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export function useToday() {
  const date = getTodayString();
  const data = useQuery(api.instances.getToday, { date });

  return {
    date,
    instances: data?.instances ?? [],
    heroItem: data?.heroItem ?? null,
    progress: data?.progress ?? { done: 0, total: 0 },
    isLoading: data === undefined,
  };
}
```

**Step 2: Build the dashboard page**

Replace `apps/web/app/(app)/dashboard/page.tsx`:
```tsx
"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToday } from "@/hooks/use-today";
import { HeroCard } from "@/components/hero-card";
import { ProgressRing } from "@/components/progress-ring";
import { UndoToast } from "@/components/undo-toast";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import type { Id } from "@/convex/_generated/dataModel";

export default function DashboardPage() {
  const { heroItem, progress, isLoading } = useToday();
  const confirmMutation = useMutation(api.actions.confirm);
  const undoMutation = useMutation(api.actions.undo);

  const [undoState, setUndoState] = useState<{
    instanceId: string;
    itemName: string;
  } | null>(null);

  const handleConfirm = useCallback(
    async (instanceId: string) => {
      const itemName = heroItem?.itemName ?? "Medication";
      await confirmMutation({
        instanceId: instanceId as Id<"dailyInstances">,
        notes: "",
      });
      setUndoState({ instanceId, itemName });
    },
    [confirmMutation, heroItem]
  );

  const handleUndo = useCallback(async () => {
    if (!undoState) return;
    await undoMutation({
      instanceId: undoState.instanceId as Id<"dailyInstances">,
    });
    setUndoState(null);
  }, [undoMutation, undoState]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <HeroCard item={heroItem} onConfirm={handleConfirm} />

      <ProgressRing done={progress.done} total={progress.total} />

      {undoState && (
        <UndoToast
          itemName={undoState.itemName}
          onUndo={handleUndo}
          onDismiss={() => setUndoState(null)}
        />
      )}
    </div>
  );
}
```

**Step 3: Verify dev server with dashboard**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm dev`

1. Log in via Clerk
2. See dashboard — should show skeleton briefly, then hero card (or "All clear" if no instances generated)
3. To see data, you need to run the seed + instance generator. Use the Convex dashboard or add a temporary trigger.

**Step 4: Verify build**

Run: `cd /Users/mcotse/Developer/yuki_3.0/apps/web && pnpm build`
Expected: No errors

**Step 5: Commit**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git add apps/web/hooks/use-today.ts apps/web/app/\(app\)/dashboard/page.tsx
git commit -m "feat: wire up dashboard page with hero card, progress ring, and undo toast"
```

---

### Task 20: V2 verification — end-to-end smoke test

**Files:** None new — manual verification.

**Step 1: Run full test suite**

Run: `cd /Users/mcotse/Developer/yuki_3.0 && pnpm test`
Expected: All tests pass (users: 5, seed: 2, instances: 4, actions: 5, components: ~12)

**Step 2: Run full build**

Run: `cd /Users/mcotse/Developer/yuki_3.0 && pnpm build`
Expected: No errors

**Step 3: Run lint**

Run: `cd /Users/mcotse/Developer/yuki_3.0 && pnpm lint`
Expected: No errors

**Step 4: Manual smoke test**

1. Seed data: run `npx convex run seed:seedDemoData` (or trigger via Convex dashboard)
2. Generate instances: run `npx convex run instances:generateDailyInstances '{"date":"2026-02-07"}'`
3. Visit dashboard — see hero card with "Prednisolone" (or first due med)
4. Tap Confirm — see hero advance to next med, undo toast appears
5. Tap Undo within 5s — med reverts to pending
6. Let undo toast expire — toast disappears
7. Confirm all meds — hero shows "All clear", progress ring shows "All done!"
8. Check Convex dashboard — confirmationHistory table has entries

**Step 5: Tag V2 complete**

```bash
cd /Users/mcotse/Developer/yuki_3.0
git tag v2-dashboard-core
```

---

## Test Summary

| Layer | Framework | What's Tested | Location |
|-------|-----------|---------------|----------|
| Convex mutations/queries | convex-test + Vitest | Users CRUD, seed idempotency, instance generation, confirm/undo/double-dose prevention, hero item computation, progress calculation | `apps/web/convex/__tests__/*.test.ts` |
| React components | React Testing Library + Vitest | BottomTabs rendering/active state, DashboardSkeleton structure, ProgressRing display/SVG, HeroCard display/confirm/all-clear, UndoToast display/callback/auto-dismiss | `apps/web/components/__tests__/*.test.tsx` |
| Shared types | Vitest | Type union correctness | `packages/types/src/__tests__/types.test.ts` |
| Offline layer | fake-indexeddb + Vitest | Instance caching, mutation queue CRUD, online status | `apps/web/lib/__tests__/offline.test.ts` |
| Integration | Manual | Auth flow, route navigation, PWA manifest, Convex connection, full confirm/undo cycle | Manual checklist in Tasks 11 & 20 |

**Total automated tests: ~28**
