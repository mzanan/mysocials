import fs from 'node:fs/promises'
import path from 'node:path'

import type { Storage } from './types'

const ROOT = path.join(process.cwd(), 'public', 'uploads')

export const localDriver: Storage = {
  async put(key, body) {
    const full = path.join(ROOT, key)
    await fs.mkdir(path.dirname(full), { recursive: true })
    await fs.writeFile(full, body)
  },
  async delete(key) {
    await fs.rm(path.join(ROOT, key), { force: true })
  },
  publicUrl(key) {
    return `/uploads/${key}`
  },
}
