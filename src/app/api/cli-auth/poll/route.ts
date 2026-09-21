import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/cli-auth/poll?token=xxx
// Called by CLI every 2s to check if user confirmed in browser
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cli_auth_tokens')
    .select('status, access_token, expires_at')
    .eq('token', token)
    .single()

  if (error || !data) {
    return NextResponse.json({ status: 'not_found' }, { status: 404 })
  }

  // Check expiry
  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ status: 'expired' })
  }

  if (data.status === 'confirmed' && data.access_token) {
    return NextResponse.json({ status: 'confirmed', access_token: data.access_token })
  }

  return NextResponse.json({ status: data.status }) // 'pending'
}
