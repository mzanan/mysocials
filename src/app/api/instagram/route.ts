import { NextResponse } from 'next/server'
import { getInstagramImages } from '@/lib/instagram'

export async function GET() {
  return NextResponse.json({ images: getInstagramImages() })
}
