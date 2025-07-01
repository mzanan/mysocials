import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function isValidUsername(username: string): boolean {
  const regex = /^[a-z0-9_]{3,20}$/
  return regex.test(username)
}

function canUpdateUsername(lastUpdate: string): boolean {
  const lastUpdateDate = new Date(lastUpdate)
  const now = new Date()
  const daysDifference = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 3600 * 24)
  return daysDifference >= 30
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const { newUsername } = await request.json()

    if (!newUsername || !isValidUsername(newUsername)) {
      return NextResponse.json({ 
        error: 'Username must be 3-20 characters, lowercase letters, numbers and underscores only' 
      }, { status: 400 })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('username, username_updated_at')
      .eq('id', user.id)
      .single()

    if (profileError || !currentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (currentProfile.username_updated_at && !canUpdateUsername(currentProfile.username_updated_at)) {
      return NextResponse.json({ 
        error: 'You can only change your username once every 30 days' 
      }, { status: 400 })
    }

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', newUsername)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        username: newUsername,
        username_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ profile: updatedProfile })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 