import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

import * as schema from './schema'

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>

let cached: DrizzleDb | null = null

function init(): DrizzleDb {
  const url = process.env.TURSO_DATABASE_URL
  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not set')
  }
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
  return drizzle(client, { schema })
}

// Proxy defers connecting until the first method is actually called, so Next's
// build-time module evaluation succeeds without TURSO env vars set. For local
// dev set TURSO_DATABASE_URL=file:local.db (libSQL handles file: URLs natively).
export const db = new Proxy({} as DrizzleDb, {
  get(_, prop) {
    if (!cached) cached = init()
    return (cached as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export { schema }
