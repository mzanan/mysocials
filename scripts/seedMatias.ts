import { config } from 'dotenv'
import { eq } from 'drizzle-orm'
import { readdir, mkdir, copyFile } from 'node:fs/promises'
import path from 'node:path'

config({ path: '.env.local' })

import { db, schema } from '../src/lib/db'

const EMAIL = 'matiaszanan@gmail.com'
const PUBLIC = path.join(process.cwd(), 'public')
const UPLOADS = path.join(PUBLIC, 'uploads')
const IMAGE_RE = /\.(jpg|jpeg|png|webp|gif)$/i

const personalLinks = [
  { title: 'Instagram', url: 'https://instagram.com/matiasenasia' },
  { title: 'Tiktok', url: 'https://www.tiktok.com/@matiasenasia' },
  { title: 'Youtube', url: 'https://www.youtube.com/@PerdidoenAsia/shorts' },
]

const devLinks = [
  { title: 'Ecommerce Landing', url: 'https://landing.itsmatias.com', icon: 'shopping-bag' },
  { title: 'Ecommerce', url: 'https://ecommerce.itsmatias.com', icon: 'shopping-cart' },
  { title: 'My Dev Portfolio', url: 'https://itsmatias.com', icon: 'code' },
]

const devVideos = ['ecommerce', 'landing', 'links', 'portfolio']

async function copyInto(srcAbs: string, key: string): Promise<string> {
  const dest = path.join(UPLOADS, key)
  await mkdir(path.dirname(dest), { recursive: true })
  await copyFile(srcAbs, dest)
  return `/uploads/${key}`
}

async function main() {
  const u = await db.query.user.findFirst({ where: eq(schema.user.email, EMAIL) })
  if (!u) throw new Error(`No user with email ${EMAIL}`)
  const userId = u.id

  await db.delete(schema.links).where(eq(schema.links.user_id, userId))
  await db.delete(schema.tabs).where(eq(schema.tabs.user_id, userId))

  await db
    .update(schema.profiles)
    .set({
      display_name: 'Matias Zanan',
      bio: '✈ Digital Nomad',
      avatar_url: '/avatar.webp',
      published: true,
    })
    .where(eq(schema.profiles.user_id, userId))

  const [personal] = await db
    .insert(schema.tabs)
    .values({ user_id: userId, label: 'Personal', type: 'grid', position: 0 })
    .returning({ id: schema.tabs.id })
  const [dev] = await db
    .insert(schema.tabs)
    .values({ user_id: userId, label: 'Dev', type: 'video', position: 1 })
    .returning({ id: schema.tabs.id })

  const igDir = path.join(PUBLIC, 'images', 'instagram')
  const igFiles = (await readdir(igDir)).filter((f) => IMAGE_RE.test(f)).sort()
  let pos = 0
  for (const file of igFiles) {
    const key = `media/${userId}/${personal.id}/${file}`
    const url = await copyInto(path.join(igDir, file), key)
    await db
      .insert(schema.media)
      .values({ tab_id: personal.id, kind: 'image', r2_key: key, url, position: pos++ })
  }

  const vidDir = path.join(PUBLIC, 'videos')
  pos = 0
  for (const name of devVideos) {
    const clipKey = `media/${userId}/${dev.id}/${name}.mp4`
    const posterKey = `media/${userId}/${dev.id}/${name}.webp`
    const url = await copyInto(path.join(vidDir, `${name}.mp4`), clipKey)
    const posterUrl = await copyInto(path.join(vidDir, `${name}.webp`), posterKey)
    await db.insert(schema.media).values({
      tab_id: dev.id,
      kind: 'video',
      r2_key: clipKey,
      url,
      poster_key: posterKey,
      poster_url: posterUrl,
      position: pos++,
    })
  }

  pos = 0
  for (const l of personalLinks) {
    await db
      .insert(schema.links)
      .values({ user_id: userId, tab_id: personal.id, title: l.title, url: l.url, position: pos++ })
  }
  for (const l of devLinks) {
    await db.insert(schema.links).values({
      user_id: userId,
      tab_id: dev.id,
      title: l.title,
      url: l.url,
      icon: l.icon,
      position: pos++,
    })
  }

  console.log(
    `Seeded ${u.email}: ${igFiles.length} photos, ${devVideos.length} videos, ${personalLinks.length + devLinks.length} links across 2 tabs.`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
