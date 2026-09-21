'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
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

export default function DashboardClient({ user, isPro, projects }: Props) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function getStack(project: Project): string[] {
    const snap = project.context_snapshots?.[0]?.context
    return snap?.stack?.slice(0, 4) ?? []
  }

  function getDecisions(project: Project): string[] {
    const snap = project.context_snapshots?.[0]?.context
    return (snap?.decisions ?? []).slice(0, 3).map((d: any) => d.text)
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
        <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
          <Link href="/" style={{fontFamily:'JetBrains Mono, monospace', fontSize:'1rem', fontWeight:500}}>
            primer<span style={{color:'#4ade80'}}>.</span>
          </Link>
          <span className="dash-title">Dashboard</span>
        </div>
        <div className="dash-user">
          <span>{user.email}</span>
          <button className="dash-signout" onClick={signOut}>Sign out</button>
        </div>
      </div>

      {/* Upgrade banner for free users */}
      {!isPro && (
        <div className="dash-upgrade-banner">
          <div className="dash-upgrade-text">
            <strong>You&apos;re on the free plan.</strong> Upgrade to Pro to sync context across machines and see your projects here.
          </div>
          <a href="https://buy.stripe.com/placeholder" className="dash-upgrade-btn">
            Upgrade to Pro — $5/month
          </a>
        </div>
      )}

      {/* Pro: show projects */}
      {isPro && projects.length === 0 && (
        <div className="dash-empty">
          <div className="dash-empty-icon">🧠</div>
          <div className="dash-empty-title">No projects synced yet</div>
          <p className="dash-empty-desc">
            Install Primer locally and log in from your terminal. Context syncs automatically on every rebuild.
          </p>
          <div className="dash-empty-code">primer login</div>
        </div>
      )}

      {isPro && projects.length > 0 && (
        <>
          <p style={{fontSize:'0.8rem', color:'var(--text-3)', marginBottom:'20px'}}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} synced
          </p>
          <div className="projects-grid">
            {projects.map(p => (
              <div key={p.id} className="project-card">
                <div className="project-name">{p.name}</div>
                <div className="project-remote">{p.git_remote}</div>
                {getStack(p).length > 0 && (
                  <div className="project-stack">
                    {getStack(p).map(t => <span key={t} className="project-tag">{t}</span>)}
                  </div>
                )}
                {getDecisions(p).length > 0 && (
                  <div style={{marginBottom:'12px'}}>
                    {getDecisions(p).map((d, i) => (
                      <div key={i} style={{fontSize:'0.75rem', color:'var(--text-3)', lineHeight:'1.5', marginBottom:'2px'}}>
                        · {d.length > 60 ? d.slice(0, 60) + '…' : d}
                      </div>
                    ))}
                  </div>
                )}
                <div className="project-meta">Last synced {formatDate(p.last_synced_at)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Free: teaser */}
      {!isPro && (
        <div className="dash-empty">
          <div className="dash-empty-icon">☁️</div>
          <div className="dash-empty-title">Context travels with you on Pro</div>
          <p className="dash-empty-desc">
            Switch machines, switch IDEs. Your context is always there. Every agent always knows where you left off.
          </p>
          <pre className="dash-empty-code">primer login  # links this machine to your account</pre>
        </div>
      )}
    </div>
  )
}
