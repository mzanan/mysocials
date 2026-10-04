# CLAUDE.md — mySocials

Multi-user **link-in-bio SaaS**. Each user signs up, builds a profile (avatar, bio, accent, theme) with **tabs** (photo grids / video walls) and links in a dashboard, then **pays (Polar) to publish** it at a public `/[username]` page. NOT the old single-user Linktree — that model is gone. Full context + backlog in `~/Documents/projects/personal/personal-brain/01-Projects/07-mysocials/`.

Follow the backend/data standards (rules 7–14) in `personal-brain/02-Areas/Engineering-standards.md` — they were written from this project's audit. UI rules 1–6 apply as everywhere.

## Stack

Next 16 (App Router) · React 19 · TypeScript · Tailwind v4 (`@theme` tokens) · `motion/react` (NOT framer-motion) · shadcn-style primitives over Radix (`components/ui`, add via shadcn CLI) · **better-auth** (email + Google) · **Drizzle + libSQL/Turso** · **Polar** (subscriptions) · **Cloudflare R2** (media, driver swappable with a local disk driver) · `sharp` + `heic-convert` (image ingest) · LLM agent (Groq planner).

## Commands

```bash
npm run dev      # next dev --turbopack (port 3030)
npm run build
npm run lint
npm run format
```

## Architecture

- **Public page** `src/app/[username]/page.tsx` → `getPublicProfileByUsername` (`lib/profile/getPublicProfile.ts`) → `components/PublicProfile/` (`ProfileCard` + tab `Backgrounds/{PersonalBackground (photo grid), VideoWall}`). Gated/suspended when billing is on and there's no active sub. Emits per-profile JSON-LD (`lib/seo.ts`); `robots: noindex, follow` when the owner turns on `profiles.hide_from_search`.
- **SEO/AEO**: `sitemap.ts` lists published, subscribed, not-hidden profiles (`lib/profile/listIndexableProfiles.ts`); `robots.ts` allows AI crawlers; static `public/llms.txt`.
- **Owner preview** `src/app/preview/page.tsx`: session-only (no `/username`), renders the owner's `PublicProfile` (published or not); `noindex` + `frame-ancestors 'self'`. Embedded as the dashboard live preview and in the subscribe modal.
- **Dashboard** `src/app/dashboard/`: `page.tsx` (server: loads profile, gates) → `_components/DashboardEditor`, two columns: editor left, sticky `LivePreview` right (iframe of `/preview`, reloads via `useLivePreview` when data or store change; hidden below `lg`). Editor = `PageHero` (`/username`, Live/Draft, Publish, hide-from-search `SettingRow`) + tabbed editor (`DashboardTabs`, `TabPanel`, `MediaManager`, `ProfileSection` as Identity + Style cards, `AvatarSection`, `SubscribeGate`). Mutations via `dashboard/actions/*` server actions. Layouts use `overflow-clip`, never `overflow-hidden` (it breaks `position: sticky`).
- **Secondary routes**: 404/error render `components/ui/StatusPage`; privacy/terms/data-deletion render `components/legal/LegalPage` (one-line `DisplayTitle`, content in a `Card`); forgot/reset use `DisplayTitle` inside the `AuthCard` hero.
- **Analytics**: PostHog EU via the `/relay` proxy, production only (`lib/analytics.ts`). Cookie consent banner (`components/consent`, `lib/consent.ts`): `cookieless_mode: "on_reject"`, identify only after consent. `?notrack=1` opts a browser out (localStorage), `?notrack=0` opts it back in.
- **API** `src/app/api/`: `upload/{image,avatar}` (multipart → `media-ingest`/`avatar` → storage), `upload/video/{presign,confirm}` (presigned direct-to-R2 PUT; `upload/video` multipart kept as local-dev fallback), `import/instagram/{connect,callback,poll}` (+ root) for IG import jobs, `agent` (LLM), `auth/[...all]` (better-auth; mounts the Polar webhook).
- **lib**: `auth.ts`/`auth-client.ts`, `analytics.ts`, `consent.ts`/`consentCookie.ts`, `seo.ts`, `site.ts` (`SITE_URL`), `polar/` (checkout + webhooks + `syncSubscriptionFromPolar`), `subscription.ts` (`billingEnabled`/`hasActiveSubscription`/`requirePublishAccess`), `ig/` (provider swappable: `apify` | `official`, see `index.ts`), `storage/` (`local` | `r2`), `media-ingest.ts` + `media/` (`decode` heic, `compressImage` client, `poster`, `video`, `codec`), `db/` (drizzle schema), `profile/`, `appearance.ts`, `networks.ts`, `media-quota.ts`.
- **types**: `dashboard.ts`, `profile.ts`, `link.ts`, `agent.ts`.

## Conventions

- **Providers are swappable behind an interface** (`lib/ig`, `lib/storage`) selected by env. Keep that pattern when adding providers.
- **The landing is the visual reference** for every route: display headlines (`DisplayTitle`, accent second line except on legal pages), ambient glow (`HeroAmbient` vivid, `AmbientBackground` soft), glass `Card`s. Settings toggles use `Switch` inside `SettingRow` (control next to its label, whole row clickable).
- **Design tokens** from `globals.css @theme`: `bg-fg`/`text-app-bg`, `surface(-subtle/strong/stronger)`, `hover` (theme-aware hover overlay — use `hover:bg-hover`, don't hand-pick surfaces), `hairline*`, `accent`. `Text` variants (`display/title/heading/body/label/caption`) for copy; section labels = `Text variant="label"`.
- **Media**: optimize before persisting weight — never store the raw original. Images compress client-side to webp (`compressImage`) then server-normalize (`sharp`, 720px webp). Videos transcode client-side with `mediabunny`/WebCodecs (`lib/media/compressVideo.ts`, H.264 MP4 ≤1080p) then upload direct to R2 via presigned PUT (bypasses Vercel's 4.5MB body cap); accept ALL formats, never reject on type.
- **Billing**: gate server-side (`requirePublishAccess`); unlock reconciles from Polar on `/dashboard?checkout=success` (`syncSubscriptionFromPolar`), not only via the webhook.
- **Animations** with `motion/react` `itemVariants` (staggered fade+scale). Videos lazy until active; always pass a `poster` (`.webp`).
- `optimizePackageImports` on for `motion` + `lucide-react`. `axios` and `react-social-icons` are removed — don't reintroduce; add networks in `SocialIcon`/`networks.ts`.

## Heuristics

- No commits/PRs without confirmation. Commits in English, no `Co-Authored-By`.
- IG import (Apify) flows are flaky: check cache/job state before assuming a bug. One import per user every 7 days.
- **Prod schema changes are hand-written `ALTER`s**: the prod `__drizzle_migrations` ledger predates `0000_baseline`, so the drizzle migrator would re-run the baseline there. Additive columns go to prod BEFORE the deploy that reads them. Same for an existing `local.db`.
- `next dev` writes the `nextjs-agent-rules` block below into this file; keep it committed.
- The `personal-brain/` vault is the source of truth for context/plans/tasks.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
