# mySocials

Multi-user link-in-bio SaaS. Users sign up, build a profile (avatar, bio, accent, theme) with tabs of photo grids or video walls plus links, then subscribe to publish it at `/<username>`.

Live: [links.itsmatias.com](https://links.itsmatias.com)

## Features

- Email-first auth (email + password, optional Google) with better-auth.
- Dashboard editor for profile, tabs, media and links; tabs, media and links reorder by drag and drop.
- Links: 16 preset networks from an `@handle`, or custom title/URL/icon.
- Media: images compressed client-side and normalized with `sharp`; videos transcoded in the browser (WebCodecs) and uploaded straight to R2.
- Instagram import (Apify scraper).
- Public page with animated photo grid or video wall background, light/dark theme per profile.
- Paid publishing via Polar ($3/mo); viewing is never gated.
- Optional LLM dashboard agent (Groq).

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, motion, better-auth, Drizzle + libSQL/Turso, Polar, Cloudflare R2, dnd-kit.

## Setup

Requires Node.js 20+.

```bash
npm install
npm run db:migrate
npm run dev
```

Opens on [http://localhost:3030](http://localhost:3030) (the port must match `NEXT_PUBLIC_BETTER_AUTH_URL`).

### Environment

Secrets live in Infisical (`.infisical.json`). Minimum for local dev:

| Variable | Purpose |
|---|---|
| `TURSO_DATABASE_URL` | `file:local.db` in dev, Turso URL in prod |
| `TURSO_AUTH_TOKEN` | Turso only |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL` | auth |
| `NEXT_PUBLIC_SITE_URL` | canonical site URL |
| `STORAGE_DRIVER` | `local` (dev) or `r2` (prod) |

Optional features activate only when their variables are set:

- Google login: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- R2 storage: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`
- Billing: `POLAR_ACCESS_TOKEN`, `POLAR_PRODUCT_ID`, `POLAR_SERVER`, `POLAR_WEBHOOK_SECRET`
- Instagram import: `IG_PROVIDER`, `APIFY_TOKEN`, `APIFY_ACTOR` (or `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` for the official provider)
- Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`
- AI agent: `GROQ_API_KEY` or `AGENT_API_KEY`, `AGENT_BASE_URL`, `AGENT_MODEL`

## Scripts

```bash
npm run dev          # dev server on port 3030
npm run build        # production build
npm run start        # serve the build
npm run lint         # eslint
npm run format       # prettier
npm run db:generate  # drizzle migration from schema
npm run db:migrate   # apply migrations
npm run db:studio    # drizzle studio
npm run make-admin <email>
```

## License

MIT
