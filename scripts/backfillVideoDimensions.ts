import { config } from 'dotenv'
import { and, eq, isNull } from 'drizzle-orm'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

config({ path: '.env.production.local' })

import { db, schema } from '../src/lib/db'

const execFileAsync = promisify(execFile)
const EMAIL = process.argv[2] ?? 'matiaszanan@gmail.com'

async function probeDimensions(url: string): Promise<{ width: number; height: number } | null> {
  try {
    const { stdout } = await execFileAsync('ffprobe', [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height',
      '-of',
      'json',
      url,
    ])
    const parsed = JSON.parse(stdout)
    const stream = parsed.streams?.[0]
    if (!stream?.width || !stream?.height) return null
    return { width: stream.width, height: stream.height }
  } catch (err) {
    console.error(`ffprobe failed for ${url}:`, err instanceof Error ? err.message : err)
    return null
  }
}

async function main() {
  const u = await db.query.user.findFirst({ where: eq(schema.user.email, EMAIL) })
  if (!u) throw new Error(`No user with email ${EMAIL}`)

  const rows = await db
    .select({ id: schema.media.id, url: schema.media.url })
    .from(schema.media)
    .innerJoin(schema.tabs, eq(schema.media.tab_id, schema.tabs.id))
    .where(
      and(eq(schema.tabs.user_id, u.id), eq(schema.media.kind, 'video'), isNull(schema.media.width)),
    )

  console.log(`${EMAIL}: ${rows.length} video(s) missing width/height.`)

  let updated = 0
  for (const row of rows) {
    const dims = await probeDimensions(row.url)
    if (!dims) {
      console.log(`  skip ${row.id} (${row.url}): ffprobe could not read dimensions`)
      continue
    }
    await db.update(schema.media).set(dims).where(eq(schema.media.id, row.id))
    console.log(`  ${row.id}: ${dims.width}x${dims.height}`)
    updated++
  }

  console.log(`Backfilled ${updated}/${rows.length}.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
