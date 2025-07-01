import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const supabase = await createClient()
  const { username } = await params
  
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name, bio, avatar_url')
      .eq('username', username)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: links, error: linksError } = await supabase
      .from('links')
      .select('id, title, url, order')
      .eq('user_id', profile.id)
      .order('order', { ascending: true })

    if (linksError) {
      return NextResponse.json({ error: linksError.message }, { status: 500 })
    }

    return NextResponse.json({
      profile,
      links: links || []
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 