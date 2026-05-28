import fs from 'fs'
import path from 'path'

const IMAGE_RE = /\.(jpg|jpeg|png|webp|gif)$/i

export function getInstagramImages(): string[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'instagram')
    if (!fs.existsSync(dir)) return []
    return fs
      .readdirSync(dir)
      .filter(f => IMAGE_RE.test(f))
      .sort()
      .map(f => `/images/instagram/${f}`)
  } catch {
    return []
  }
}
