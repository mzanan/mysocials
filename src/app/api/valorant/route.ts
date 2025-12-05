import { NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    const valorantImagesDir = join(process.cwd(), 'public', 'images', 'valorant')
    const files = await readdir(valorantImagesDir)

    const imageFiles = files.filter(file => file.endsWith('.jpg'))

    return NextResponse.json({ images: imageFiles })
  } catch (error) {
    console.error('Error reading valorant images directory:', error)
    return NextResponse.json({ images: [] }, { status: 500 })
  }
}
