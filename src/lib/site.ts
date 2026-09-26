export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  'http://localhost:3030'
).replace(/\/$/, '')
