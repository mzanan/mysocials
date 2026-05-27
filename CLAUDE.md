# CLAUDE.md — mySocials

Linktree-like con tabs (Personal / Valorant / Dev / Trading) mostrando actividad de Matías en cada espacio. Contexto completo y backlog en `~/Documents/projects/personal/personal-brain/01-Projects/07-mysocials/`.

## Stack

Next 16 · React 19 · TypeScript · Tailwind v4 · Turbopack · `motion/react` (paquete `motion`, ex framer-motion) · Radix · Puppeteer (screenshots Dev).

## Comandos

```bash
npm run dev          # next dev --turbopack
npm run build
npm run lint         # next lint
npm run format       # prettier --write .
```

## Paths críticos

- `src/components/PublicProfile/` — raíz con tabs.
- `src/components/Backgrounds/PersonalBackground/` — Instagram.
- `src/components/Backgrounds/DevBackground/` — videos Dev (`preload="none"` hasta active).
- `src/components/Backgrounds/ValorantBackground/` — Reddit.
- `src/components/Backgrounds/TradingBackground/` — TradingView.
- `src/lib/projects.ts` — config de proyectos Dev.
- `src/lib/cache.ts` (server 30 min) + `browser-cache.ts` (localStorage 24 h).
- `src/app/api/instagram/`, `valorant/`, `dev-screenshots/`, `trading-charts/`.

## Env vars

Las credenciales de Instagram / Reddit / etc. viven en `.env`. Ver el endpoint correspondiente para qué key consume cada uno.

## Convenciones del proyecto

- Cache dual server + browser. Cambios a fetch deben mantener ambos.
- Animaciones con `itemVariants` (fade + scale + delay escalonado por `index`). `import { motion } from "motion/react"` (NO `framer-motion`).
- Videos lazy hasta `isActive` para evitar descargar todo en cold load. Sumar siempre `poster={video.replace(/\.mp4$/, '.webp')}` para que el primer frame se vea instant.
- `axios` fue borrado del package.json — no lo uses (los API routes leen filesystem, fetch nativo alcanza).
- `optimizePackageImports` está activo para `motion` y `lucide-react`. **NO sumar `react-social-icons`** — rompe el build prerender (TypeError destructuring `color`).
- **Runtime real:** `usePublicProfile.ts:11-14` solo monta `[PersonalBackground, DevBackground]`. Trading y Valorant existen pero nunca renderizan — tocar esos archivos no afecta producción.

## Heurísticas

- No commits ni PRs sin confirmación.
- IG API y screenshots Puppeteer son flaky: chequear cache layers antes de asumir bug.
