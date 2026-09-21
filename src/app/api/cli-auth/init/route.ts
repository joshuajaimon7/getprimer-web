import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/cli-auth/init
// Called by the CLI to start the browser auth flow
// Returns { token, url } — CLI opens the url in browser, polls with token
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const machineInfo = {
    hostname: body.hostname ?? 'unknown',
    version: body.version ?? 'unknown',
    platform: body.platform ?? 'unknown',
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cli_auth_tokens')
    .insert({ machine_info: machineInfo, status: 'pending' })
    .select('token')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to create auth session' }, { status: 500 })
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.getprimer.cloud'}/cli-auth?token=${data.token}`

  return NextResponse.json({ token: data.token, url })
}
