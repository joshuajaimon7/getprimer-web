import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function UpgradeSuccessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">primer<span style={{ color: '#4ade80' }}>.</span></div>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>✓</div>
        <div className="auth-title" style={{ color: '#4ade80' }}>You&apos;re on Pro!</div>
        <p className="auth-subtitle">
          Context now syncs across all your machines.<br />
          Link your terminal:
        </p>
        <pre style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem',
          background: 'var(--bg-3)', border: '1px solid var(--border)',
          padding: '12px 16px', marginBottom: '20px',
          color: 'var(--text-2)', textAlign: 'left',
        }}>
          primer login
        </pre>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '20px' }}>
          To connect IDE agents, go to Dashboard → Connect MCP.
        </p>
        <a href="/dashboard" style={{
          display: 'block', background: 'var(--text)', color: '#000',
          fontWeight: 600, fontSize: '0.9rem', padding: '11px',
          textDecoration: 'none',
        }}>
          Go to dashboard →
        </a>
      </div>
    </div>
  )
}
