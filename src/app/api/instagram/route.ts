import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'instagram')

    if (!fs.existsSync(dir)) {
      return NextResponse.json({ images: [] })
    }

    const files = fs.readdirSync(dir)
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
      .sort()
      .map(f => `/images/instagram/${f}`)

    return NextResponse.json({ images: files })
  } catch {
    return NextResponse.json({ images: [] })
  }
}
