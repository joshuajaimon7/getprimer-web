/**
 * POST /api/sync
 * Receives context from CLI (authenticated via cli_auth_token)
 * and stores it in Supabase using service role.
 *
 * Body: { cli_token: string, context: ProjectContext }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { cli_token, context } = body

  if (!cli_token || !context) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  // Resolve the CLI token → user_id
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

  // Verify user is Pro
  const { data: user } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single()

  if (user?.plan !== 'pro') {
    return NextResponse.json({ error: 'pro_required' }, { status: 403 })
  }

  if (!context.gitRemote) {
    return NextResponse.json({ ok: true, skipped: 'no_git_remote' })
  }

  // Upsert project
  const { data: projects, error: projErr } = await supabase
    .from('projects')
    .upsert({
      user_id: userId,
      name: context.project,
      git_remote: context.gitRemote,
      last_synced_at: new Date().toISOString(),
    }, { onConflict: 'user_id,git_remote' })
    .select('id')

  if (projErr || !projects?.[0]?.id) {
    return NextResponse.json({ error: 'project_upsert_failed', detail: projErr?.message }, { status: 500 })
  }

  const projectId = projects[0].id

  // Strip machine-specific fields
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
    .insert({
      project_id: projectId,
      user_id: userId,
      context: payload,
      primer_version: context.primerVersion ?? '3.0.4',
    })

  if (snapErr) {
    return NextResponse.json({ error: 'snapshot_failed', detail: snapErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, project: context.project })
}
