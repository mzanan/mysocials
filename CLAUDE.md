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

- `src/components/PublicProfile/PublicProfile.tsx` — raíz con tabs. `DevBackground` se importa vía `next/dynamic({ ssr: false })`; `PersonalBackground` es eager (default tab). Patrón "ever activated" con `useRef<Set>` para no re-montar al volver.
- `src/components/Backgrounds/PersonalBackground/` — Instagram (grid 480px webp).
- `src/components/Backgrounds/DevBackground/` — videos Dev (`preload="none"` hasta active).
- `src/components/SocialIcon/SocialIcon.tsx` — íconos locales (IG/TikTok/YT/Twitch) con lucide-react + SVG TikTok inline. Reemplaza `react-social-icons` (que pesaba ~99KB en initial chunk).
- `src/lib/projects.ts` — config de proyectos Dev.
- `src/lib/cache.ts` (server 30 min) + `browser-cache.ts` (localStorage 24 h).
- `src/app/api/instagram/`, `valorant/`.

## Env vars

Las credenciales de Instagram / Reddit / etc. viven en `.env`. Ver el endpoint correspondiente para qué key consume cada uno.

## Convenciones del proyecto

- Cache dual server + browser. Cambios a fetch deben mantener ambos.
- Animaciones con `itemVariants` (fade + scale + delay escalonado por `index`). `import { motion } from "motion/react"` (NO `framer-motion`).
- Videos lazy hasta `isActive` para evitar descargar todo en cold load. Sumar siempre `poster={video.replace(/\.mp4$/, '.webp')}` para que el primer frame se vea instant.
- **Imágenes IG en `public/images/instagram/` viven como `.webp` 480px q70 (~30KB avg)**. NO re-introducir `.jpg` — el endpoint filtra ambos pero perdés peso. Si scrapeás IG de nuevo, re-encodear con `cwebp -q 70 -resize 480 0`.
- `axios` fue borrado del package.json — no lo uses (los API routes leen filesystem, fetch nativo alcanza).
- **`react-social-icons` fue borrado** (28/05) por SVGs locales en `SocialIcon/SocialIcon.tsx`. Si necesitás más redes, sumalas ahí (lucide + brand BG) en vez de re-instalar el package.
- `optimizePackageImports` está activo para `motion` y `lucide-react`.
- **Runtime real:** solo se montan Personal (eager) y Dev (via `next/dynamic`). El array `backgrounds` vive en `PublicProfile.tsx`, ya no en `usePublicProfile.ts`. Si querés sumar tabs, agregalas en `categories` de `usePublicProfile` + en `backgrounds` de `PublicProfile.tsx` (idealmente dynamic).

## Heurísticas

- No commits ni PRs sin confirmación.
- IG API y screenshots Puppeteer son flaky: chequear cache layers antes de asumir bug.
