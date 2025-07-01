import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function generateUsername(email: string): string {
  const baseUsername = email.split('@')[0].toLowerCase()
  const cleanUsername = baseUsername.replace(/[^a-z0-9]/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `${cleanUsername}${randomSuffix}`
}

export async function POST() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json({ error: 'Profile already exists' }, { status: 400 })
    }

    let username = generateUsername(user.email || 'user')
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

      if (!existingUser) {
        break
      }

      attempts++
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      username = generateUsername(user.email || 'user').replace(/\d+$/, '') + randomSuffix
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json({ error: 'Could not generate unique username' }, { status: 500 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: username,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        username_updated_at: null,
      })
      .select()
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 