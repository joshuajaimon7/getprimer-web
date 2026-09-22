'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  git_remote: string
  last_synced_at: string | null
  context_snapshots: { context: any; created_at: string }[]
}

interface Props {
  user: User
  isPro: boolean
  projects: Project[]
}

const MCP_CONFIG = `{
  "mcpServers": {
    "primer": {
      "command": "primer",
      "args": ["mcp"]
    }
  }
}`

function MCPSection() {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(MCP_CONFIG)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <span style={{ fontSize: '1rem', fontWeight: 600 }}>🔌 Connect MCP</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--green)', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '4px', padding: '2px 8px' }}>Pro</span>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: '24px', lineHeight: 1.6 }}>
        Give your IDE agents a live connection to Primer — query context, log decisions, and more mid-conversation.
      </p>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
        {[
          { n: '1', text: 'Copy the config below' },
          { n: '2', text: 'Open your IDE\'s MCP config file and paste it in' },
          { n: '3', text: 'Restart your IDE — done' },
        ].map(s => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--border-2)', color: 'var(--text-2)', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.n}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>{s.text}</span>
          </div>
        ))}
      </div>

      {/* Config block */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'monospace' }}>mcp_config.json</span>
          <button onClick={copy} style={{ fontSize: '0.75rem', color: copied ? 'var(--green)' : 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', fontWeight: copied ? 600 : 400 }}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <pre style={{ margin: 0, padding: '16px', fontSize: '0.8rem', lineHeight: 1.7, overflowX: 'auto', color: 'var(--text)' }}>
          {MCP_CONFIG}
        </pre>
      </div>
    </div>
  )
}


export default function DashboardClient({ user, isPro, projects }: Props) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function manageSubscription() {
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else alert('Could not open billing portal. Try again.')
  }

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${user.id}` }, () => router.refresh())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'context_snapshots', filter: `user_id=eq.${user.id}` }, () => router.refresh())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user.id, router])

  function getStack(project: Project): string[] {
    return project.context_snapshots?.[0]?.context?.stack?.slice(0, 4) ?? []
  }

  function getDecisions(project: Project): string[] {
    return (project.context_snapshots?.[0]?.context?.decisions ?? []).slice(0, 3).map((d: any) => d.text)
  }

  function formatDate(d: string | null) {
    if (!d) return 'Never'
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="dash-wrap">
      <div className="dash-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', fontWeight: 500 }}>
            primer<span style={{ color: '#4ade80' }}>.</span>
          </Link>
          <span className="dash-title">Dashboard</span>
        </div>
        <div className="dash-user">
          <span>{user.email}</span>
          {isPro && (
            <button className="dash-signout" onClick={manageSubscription}>Manage plan</button>
          )}
          <button className="dash-signout" onClick={signOut}>Sign out</button>
        </div>
      </div>

      {/* Upgrade banner for free users */}
      {!isPro && (
        <div className="dash-upgrade-banner">
          <div className="dash-upgrade-text">
            <strong>You&apos;re on the free plan.</strong> Upgrade to Pro to sync context across machines and connect IDE agents live.
          </div>
          <a href="/upgrade" className="dash-upgrade-btn">Upgrade to Pro — $5/month</a>
        </div>
      )}

      {/* Pro: empty state */}
      {isPro && projects.length === 0 && (
        <div className="dash-empty">
          <div className="dash-empty-icon">🧠</div>
          <div className="dash-empty-title">No projects synced yet</div>
          <p className="dash-empty-desc">
            Install Primer locally and run <code>primer login</code>. Context syncs automatically.
          </p>
          <div className="dash-empty-code">primer login</div>
        </div>
      )}

      {/* Pro: projects grid */}
      {isPro && projects.length > 0 && (
        <>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '20px' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} synced
          </p>
          <div className="projects-grid">
            {projects.map(p => (
              <Link key={p.id} href={`/dashboard/project/${p.id}`} className="project-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div className="project-name">{p.name}</div>
                <div className="project-remote">{p.git_remote}</div>
                {getStack(p).length > 0 && (
                  <div className="project-stack">
                    {getStack(p).map(t => <span key={t} className="project-tag">{t}</span>)}
                  </div>
                )}
                {getDecisions(p).length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    {getDecisions(p).map((d, i) => (
                      <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: '1.5', marginBottom: '2px' }}>
                        · {d.length > 60 ? d.slice(0, 60) + '…' : d}
                      </div>
                    ))}
                  </div>
                )}
                <div className="project-meta">Last synced {formatDate(p.last_synced_at)}</div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Pro: MCP connect */}
      {isPro && <MCPSection />}

      {/* Free: teaser */}
      {!isPro && (
        <div className="dash-empty">
          <div className="dash-empty-icon">☁️</div>
          <div className="dash-empty-title">Context travels with you on Pro</div>
          <p className="dash-empty-desc">
            Switch machines, switch IDEs. Your context is always there.
          </p>
          <pre className="dash-empty-code">primer login  # links this machine to your account</pre>
        </div>
      )}
    </div>
  )
}
