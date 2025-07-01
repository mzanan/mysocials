import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [profileViewsResult, linkClicksResult] = await Promise.all([
      supabase
        .from('profile_views')
        .select('id', { count: 'exact' })
        .eq('profile_id', user.id),
      
      supabase
        .from('link_clicks')
        .select('id', { count: 'exact' })
        .eq('profile_id', user.id)
    ])

    const profileViews = profileViewsResult.count || 0
    const totalClicks = linkClicksResult.count || 0

    const [recentViewsResult, recentClicksResult] = await Promise.all([
      supabase
        .from('profile_views')
        .select('id', { count: 'exact' })
        .eq('profile_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      supabase
        .from('link_clicks')
        .select('id', { count: 'exact' })
        .eq('profile_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ])

    const recentViews = recentViewsResult.count || 0
    const recentClicks = recentClicksResult.count || 0

    return NextResponse.json({
      profileViews,
      totalClicks,
      recentViews,
      recentClicks
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 