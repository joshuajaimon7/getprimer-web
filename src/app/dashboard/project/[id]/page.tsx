import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify Pro
  const { data: profile } = await supabase.from('users').select('plan').eq('id', user.id).single()
  if (profile?.plan !== 'pro') redirect('/dashboard')

  // Fetch project + latest snapshot
  const { data: project } = await supabase
    .from('projects')
    .select('*, context_snapshots(context, created_at, primer_version)')
    .eq('id', id)
    .eq('user_id', user.id)
    .order('created_at', { referencedTable: 'context_snapshots', ascending: false })
    .limit(1, { referencedTable: 'context_snapshots' })
    .single()

  if (!project) notFound()

  const ctx = project.context_snapshots?.[0]?.context ?? {}
  const decisions: any[] = ctx.decisions ?? []
  const hotFiles: any[] = ctx.hotFiles ?? []
  const stack: string[] = ctx.stack ?? []
  const architecture: string[] = ctx.architecture ?? []

  function formatDate(d: string | null | undefined) {
    if (!d) return ''
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch { return d }
  }

  function timeAgo(d: string | null) {
    if (!d) return 'Never'
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px' }}>
      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '48px', paddingBottom: '24px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', fontWeight: 500, color: 'var(--text)' }}>
            primer<span style={{ color: '#4ade80' }}>.</span>
          </Link>
          <span style={{ color: 'var(--text-3)' }}>/</span>
          <Link href="/dashboard" style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Dashboard</Link>
          <span style={{ color: 'var(--text-3)' }}>/</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{project.name}</span>
        </div>
        <Link href="/dashboard" style={{ fontSize: '0.75rem', color: 'var(--text-3)', border: '1px solid var(--border)', padding: '6px 12px' }}>
          ← Back
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '6px' }}>
          {project.name}
        </h1>
        <a href={project.git_remote} target="_blank" rel="noopener"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--text-3)' }}>
          {project.git_remote}
        </a>
        <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-3)' }}>
          Last synced {timeAgo(project.last_synced_at)}
          {ctx.primerVersion && ` · Primer v${ctx.primerVersion}`}
        </div>

        {/* Stack */}
        {stack.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
            {stack.map((t: string) => (
              <span key={t} className="project-tag">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      {ctx.description && (
        <div style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '10px' }}>
            About
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{ctx.description}</p>
        </div>
      )}

      {/* Decisions */}
      {decisions.length > 0 && (
        <div style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '20px' }}>
            Decisions & context — {decisions.length} total
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {decisions.map((d: any, i: number) => (
              <div key={i} style={{
                padding: '16px 0',
                borderBottom: i < decisions.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5, flex: 1 }}>
                    {d.text || d.raw}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {formatDate(d.date)}
                    {d.manual && <span style={{ marginLeft: '6px', color: '#4ade80' }}>manual</span>}
                  </div>
                </div>
                {d.why && (
                  <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-3)', fontStyle: 'italic' }}>
                    → {d.why}
                  </div>
                )}
                {d.files?.length > 0 && (
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {d.files.slice(0, 4).map((f: string) => (
                      <span key={f} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'var(--text-3)', background: 'var(--bg-2)', border: '1px solid var(--border)', padding: '1px 6px' }}>
                        {f.split('/').pop()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hot files */}
      {hotFiles.length > 0 && (
        <div style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: architecture.length > 0 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '20px' }}>
            Active files — last 7 days
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {hotFiles.map((f: any, i: number) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < hotFiles.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'var(--text-2)' }}>
                  {f.path}
                </span>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.7rem', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                  <span>{f.touches} edit{f.touches !== 1 ? 's' : ''}</span>
                  {f.lastSaved && <span>{timeAgo(f.lastSaved)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Architecture */}
      {architecture.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '16px' }}>
            Architecture
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {architecture.map((a: string, i: number) => (
              <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>— {a}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
