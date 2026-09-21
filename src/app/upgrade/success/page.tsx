import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function UpgradeSuccessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="auth-page">
      <div className="auth-card" style={{textAlign:'center'}}>
        <div className="auth-logo">primer<span style={{color:'#4ade80'}}>.</span></div>
        <div style={{fontSize:'2.5rem', marginBottom:'16px'}}>🎉</div>
        <div className="auth-title" style={{color:'#4ade80'}}>You&apos;re on Pro!</div>
        <p className="auth-subtitle">
          Your context will now sync across machines.<br/>
          Link your terminal with:
        </p>
        <pre style={{
          fontFamily:'JetBrains Mono, monospace', fontSize:'0.85rem',
          background:'var(--bg-3)', border:'1px solid var(--border)',
          borderRadius:'8px', padding:'12px 16px', marginBottom:'24px',
          color:'var(--text-2)', textAlign:'left'
        }}>
          primer upgrade
        </pre>
        <a href="/dashboard" style={{
          display:'block', background:'var(--text)', color:'#000',
          fontWeight:600, fontSize:'0.9rem', padding:'11px',
          borderRadius:'8px', textDecoration:'none'
        }}>
          Go to dashboard →
        </a>
      </div>
    </div>
  )
}
