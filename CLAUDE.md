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

- **Public page** `src/app/[username]/page.tsx` → `getPublicProfileByUsername` (`lib/profile/getPublicProfile.ts`) → `components/PublicProfile/` (`ProfileCard` + tab `Backgrounds/{PersonalBackground (photo grid), VideoWall}`). Gated/suspended when billing is on and there's no active sub.
- **Owner preview** `src/app/preview/page.tsx` — session-only (no `/username`), renders the owner's `PublicProfile` (published or not); `noindex` + `frame-ancestors 'self'`. Embedded in the subscribe modal.
- **Dashboard** `src/app/dashboard/` — `page.tsx` (server: loads profile, gates) → `_components/DashboardEditor` → tabbed editor (`DashboardTabs`, `TabPanel`, `MediaManager`, `ProfileSection`, `AvatarSection`, `SubscribeGate`). Mutations via `dashboard/actions/*` server actions.
- **API** `src/app/api/`: `upload/{image,video,avatar}` (multipart → `media-ingest`/`avatar` → storage), `import/instagram/{connect,callback,poll}` (+ root) for IG import jobs, `agent` (LLM), `auth/[...all]` (better-auth; mounts the Polar webhook).
- **lib**: `auth.ts`/`auth-client.ts`, `polar/` (checkout + webhooks + `syncSubscriptionFromPolar`), `subscription.ts` (`billingEnabled`/`hasActiveSubscription`/`requirePublishAccess`), `ig/` (provider swappable: `apify` | `official`, see `index.ts`), `storage/` (`local` | `r2`), `media-ingest.ts` + `media/` (`decode` heic, `compressImage` client, `poster`, `video`, `codec`), `db/` (drizzle schema), `profile/`, `appearance.ts`, `networks.ts`, `media-quota.ts`.
- **types**: `dashboard.ts`, `profile.ts`, `link.ts`, `agent.ts`.

## Conventions

- **Providers are swappable behind an interface** (`lib/ig`, `lib/storage`) selected by env. Keep that pattern when adding providers.
- **Design tokens** from `globals.css @theme`: `bg-fg`/`text-app-bg`, `surface(-subtle/strong/stronger)`, `hover` (theme-aware hover overlay — use `hover:bg-hover`, don't hand-pick surfaces), `hairline*`, `accent`. `Text` variants (`display/title/heading/body/label/caption`) for copy; section labels = `Text variant="label"`.
- **Media**: optimize before persisting weight — never store the raw original. Images compress client-side to webp (`compressImage`) then server-normalize (`sharp`, 720px webp). The video pipeline is moving to a transcode service/worker + direct upload (see tasks backlog); accept ALL formats, never reject on type.
- **Billing**: gate server-side (`requirePublishAccess`); unlock reconciles from Polar on `/dashboard?checkout=success` (`syncSubscriptionFromPolar`), not only via the webhook.
- **Animations** with `motion/react` `itemVariants` (staggered fade+scale). Videos lazy until active; always pass a `poster` (`.webp`).
- `optimizePackageImports` on for `motion` + `lucide-react`. `axios` and `react-social-icons` are removed — don't reintroduce; add networks in `SocialIcon`/`networks.ts`.

## Heuristics

- No commits/PRs without confirmation. Commits in English, no `Co-Authored-By`.
- IG import (Apify) flows are flaky — check cache/job state before assuming a bug.
- The `personal-brain/` vault is the source of truth for context/plans/tasks.
