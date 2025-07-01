import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const supabase = await createClient()
  
  try {
    const { linkId } = await params

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
    }

    const { data: link } = await supabase
      .from('links')
      .select('id, url, user_id')
      .eq('id', linkId)
      .single()

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') ||
                     '127.0.0.1'
    
    const userAgent = request.headers.get('user-agent') || ''

    const { error } = await supabase
      .from('link_clicks')
      .insert({
        link_id: link.id,
        profile_id: link.user_id,
        ip_address: clientIP,
        user_agent: userAgent
      })

    if (error) {
      console.error('Error tracking link click:', error)
    }

    redirect(link.url)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 