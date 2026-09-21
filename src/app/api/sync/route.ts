/**
 * POST /api/sync
 * Receives context from the CLI (authenticated via cli_auth_token).
 * Uses service role to write. Never renames existing projects.
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

  const { cli_token, context } = body
  if (!cli_token || !context) {
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
  const userId = tokenRow.user_id

  // Verify Pro
  const { data: userRow } = await supabase.from('users').select('plan').eq('id', userId).single()
  if (userRow?.plan !== 'pro') {
    return NextResponse.json({ error: 'pro_required' }, { status: 403 })
  }

  if (!context.gitRemote) {
    return NextResponse.json({ ok: true, skipped: 'no_git_remote' })
  }

  // Find existing project (by git_remote + user_id)
  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', userId)
    .eq('git_remote', context.gitRemote)
    .single()

  let projectId: string

  if (existing?.id) {
    // Project exists — only update last_synced_at, NEVER rename
    await supabase
      .from('projects')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', existing.id)
    projectId = existing.id
  } else {
    // New project — insert with name from context
    const { data: inserted, error: insertErr } = await supabase
      .from('projects')
      .insert({ user_id: userId, name: context.project, git_remote: context.gitRemote, last_synced_at: new Date().toISOString() })
      .select('id')
      .single()

    if (insertErr || !inserted?.id) {
      return NextResponse.json({ error: 'project_insert_failed', detail: insertErr?.message }, { status: 500 })
    }
    projectId = inserted.id
  }

  // Strip local-only fields before storing
  const payload = {
    project: context.project,
    gitRemote: context.gitRemote,
    stack: context.stack ?? [],
    decisions: context.decisions ?? [],
    hotFiles: context.hotFiles ?? [],
    architecture: context.architecture ?? [],
    description: context.description ?? '',
    builtAt: context.builtAt,
    primerVersion: context.primerVersion,
  }

  // Insert snapshot
  const { error: snapErr } = await supabase
    .from('context_snapshots')
    .insert({ project_id: projectId, user_id: userId, context: payload, primer_version: context.primerVersion ?? '3.0.4' })

  if (snapErr) {
    return NextResponse.json({ error: 'snapshot_failed', detail: snapErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, project: context.project })
}
