# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run build        # production build (runs lint + typecheck first)
npm audit --audit-level=moderate
```

There is no test framework in this project.

After adding a new dependency, clear the `.next/types` cache before typechecking (`Remove-Item .next/types -Recurse -Force`) to avoid stale generated type errors.

## Architecture Overview

**Next.js 16 App Router** with two distinct zones:

- **Public zone** — `app/page.tsx` (landing + auth), `app/ethics/`, `app/terms/`, `app/privacy/`, `app/pricing/`
- **Authenticated zone** — `app/dashboard/**`, protected by a client-side redirect in `app/dashboard/layout.tsx`

> **Important:** Dashboard protection is intentionally client-side only. A `middleware.ts` using `@supabase/ssr` was removed because the Supabase client stores sessions in `localStorage`, not cookies, so server-side cookie checks would always fail. Do not re-add a server middleware that calls `supabase.auth.getUser()` unless the client is also migrated to cookie-based session storage.

---

## Key Lib Files

| File | Purpose |
|---|---|
| `lib/supabase.ts` | Client-side Supabase singleton (anon key, localStorage sessions) |
| `lib/supabase-admin.ts` | Server-side clients: `createSupabaseRouteClient(token)` for user auth, `createSupabaseAdminClient()` for service-role DB access in API routes |
| `lib/types.ts` | All shared TypeScript types (`Profile`, `CVItem`, `Application`, `AccessibilitySettings`, etc.) |
| `lib/validations.ts` | Zod schemas for every form and API request/response. Import types from here (`AuthFormData`, `AICVGenerateRequest`, etc.) |
| `lib/matching.ts` | Rule-based internship matching — **must stay rule-based** (explainability principle). Uses case-insensitive substring matching. `computeMatch()` and `scoreAllInternships()` are the main exports |
| `lib/profiles.ts` | `fetchProfile(userId)` — queries by both `user_id` and `id` columns due to the dual-key schema |
| `lib/analytics.ts` | Client-side `logEvent()` + server-side `fetchAggregateAnalytics()`. Only logs event types defined in the `usage_metrics` CHECK constraint |
| `lib/ai-rate-limit.ts` | `checkAiRateLimit()` and `logAiUsage()` — tier-aware daily limits using `usage_metrics` table. Used inside API routes before calling OpenAI |
| `lib/explainability.ts` | Builds `ExplainabilityData` objects for `AIExplainabilityPanel`. Three exports: `buildCVExplainability`, `buildMatchingExplainability`, `buildInterviewExplainability` |

---

## Providers

**`providers/AuthProvider.tsx`** — wraps the entire app. Exposes `user`, `session`, `loading`, `signIn`, `signUp`, `signOut` via `useAuth()`. Session stored in localStorage by Supabase JS client.

**`providers/AccessibilityProvider.tsx`** — wraps the entire app. Persists settings to `localStorage` keyed as `accessibility:<userId>` and also saves to `profiles`. Exposes three derived boolean flags consumed by layout components:
- `isLowCognitiveLoad` — hides secondary nav, constrains layout width
- `isStepByStep` — shows focus banner in dashboard layout, enables checklist behaviour
- `isMinimalText` — shortens nav labels, hides long display names

---

## API Routes

All AI routes require a valid Supabase bearer token (`Authorization: Bearer <session.access_token>`). Pattern:

1. Extract token → `createSupabaseRouteClient(token).auth.getUser(token)` to verify identity
2. `createSupabaseAdminClient()` for rate limit check and usage logging (bypasses RLS)
3. Call OpenAI
4. `logAiUsage()` after success (wrapped in try/catch — never blocks response)

**Rate limits** (enforced in `lib/ai-rate-limit.ts`, backed by `usage_metrics`):

| Event | Free | Pro | Enterprise |
|---|---|---|---|
| `cv_generation` | 2/day | 10/day | 100/day |
| `interview_feedback` | 5/day | 20/day | 200/day |

When the limit is hit for a free user, the 429 response includes `upgradeUrl: '/pricing'`.

**Stripe routes** (`app/api/stripe/`):
- `checkout` — creates Stripe Checkout session, saves `stripe_customer_id` to `profiles`
- `portal` — opens Stripe Customer Portal
- `webhooks` — handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Reads raw body before parsing (App Router requires `await request.text()`). Updates `profiles.plan` and `profiles.subscription_status`.

---

## Database

Supabase PostgreSQL. Migrations live in `supabase/migrations/` and must be applied manually via the Supabase dashboard SQL editor or `supabase db push`.

**Critical schema quirks:**

- `profiles` has both `id` (primary key, references `auth.users`) and `user_id` (unique, also references `auth.users`). Always write **both** on upsert: `{ id: user.id, user_id: user.id, ... }`. Querying by either column alone can miss rows — use `lib/profiles.ts#fetchProfile()` which tries both.

- `usage_metrics.event_type` has a CHECK constraint. Valid values: `cv_generation`, `cv_item_created`, `internship_saved`, `application_created`, `interview_session_started`, `interview_session_completed`, `interview_feedback`, `profile_completed`, `page_view`. Inserting any other value will fail at the DB level.

- `profiles.plan` CHECK: `('free', 'pro', 'enterprise')`. `profiles.subscription_status` CHECK: `('active', 'trialing', 'past_due', 'canceled', 'inactive')`.

**Tables:** `profiles`, `cv_items`, `generated_cvs`, `wishlist`, `applications`, `interview_sessions`, `interview_qa_pairs`, `research_consent`, `usage_metrics`.

---

## Internship Data

Internships come from the **static file** `data/internships.json` — not from the database. To add or edit internships, edit that file. The matching system reads from it at request time.

---

## Theming & Styling

All colours are CSS custom properties defined in `app/globals.css`. Tailwind uses HSL variable references (e.g. `hsl(var(--primary))`). Two colour palettes exist — `warm` (amber/oak, default) and `cool` (cyan/navy) — switched at runtime by `AccessibilityProvider` by toggling a `data-palette` attribute on `<html>`. High-contrast mode is a separate `data-theme` attribute.

Sidebar-specific colours use the `sidebar-bg`, `sidebar-fg` CSS variables, which are also palette-aware.

---

## Deployment

Netlify. Config in `netlify.toml` with `@netlify/plugin-nextjs`. Build command: `npx next build`. No `vercel.json`.

**Required environment variables** (see `.env.example`):
```
OPENAI_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY       # server-only, never expose to client
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
```
