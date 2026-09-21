import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/cli-auth/confirm
// Called when user clicks Confirm in browser
// Marks token as confirmed and stores their access token for CLI to pick up
export async function POST(request: NextRequest) {
  const { token } = await request.json()
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Get their session to store the access token
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'No session' }, { status: 401 })

  // Confirm the token
  const { error } = await supabase
    .from('cli_auth_tokens')
    .update({
      status: 'confirmed',
      user_id: user.id,
      access_token: session.access_token,
    })
    .eq('token', token)
    .eq('status', 'pending')

  if (error) return NextResponse.json({ error: 'Failed to confirm' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
