/**
 * POST /api/pull
 * Returns compiled AGENTS.md + latest context for a git remote.
 * Used by Primer CLI for cross-machine context sync.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  let body: any
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

  const { cli_token, git_remote } = body
  if (!cli_token || !git_remote) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  // Resolve CLI token → user_id
  const { data: tokenRow } = await supabase
    .from('cli_auth_tokens')
    .select('user_id, status')
    .eq('access_token', cli_token)
    .eq('status', 'confirmed')
    .single()

  if (!tokenRow?.user_id) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 })
  }

  // Find project by git_remote for this user
  const { data: project } = await supabase
    .from('projects')
    .select('id, compiled_md')
    .eq('user_id', tokenRow.user_id)
    .eq('git_remote', git_remote)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  // Get latest context snapshot
  const { data: snapshot } = await supabase
    .from('context_snapshots')
    .select('context')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return NextResponse.json({
    compiled_md: project.compiled_md ?? null,
    context: snapshot?.context ?? null,
  })
}
