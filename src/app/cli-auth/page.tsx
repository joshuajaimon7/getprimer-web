'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function CliAuthContent() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token')

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)
  const [denied, setDenied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  async function confirm() {
    if (!token) return
    setConfirming(true)
    setError('')
    try {
      const res = await fetch('/api/cli-auth/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (data.ok) {
        setDone(true)
        // Redirect to dashboard after 2s
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        setError(data.error ?? `Error ${res.status} — try running primer login again`)
      }
    } catch {
      setError('Network error — check your connection and try again')
    } finally {
      setConfirming(false)
    }
  }

  if (!token) return (
    <div className="auth-page">
      <div className="auth-card" style={{textAlign:'center'}}>
        <div className="auth-logo">primer<span style={{color:'#4ade80'}}>.</span></div>
        <p style={{color:'var(--text-2)', fontSize:'0.875rem'}}>Invalid or missing token.</p>
      </div>
    </div>
  )

  if (loading) return (
    <div className="auth-page">
      <div className="auth-card" style={{textAlign:'center'}}>
        <div className="auth-logo">primer<span style={{color:'#4ade80'}}>.</span></div>
        <p style={{color:'var(--text-3)', fontSize:'0.875rem'}}>Loading...</p>
      </div>
    </div>
  )

  // Not signed in — redirect to login with return URL
  if (!user) return (
    <div className="auth-page">
      <div className="auth-card" style={{textAlign:'center'}}>
        <div className="auth-logo">primer<span style={{color:'#4ade80'}}>.</span></div>
        <div className="auth-title" style={{fontSize:'1.25rem'}}>Sign in first</div>
        <p className="auth-subtitle">You need to be signed in to link your terminal.</p>
        <Link
          href={`/login?redirect=${encodeURIComponent(`/cli-auth?token=${token}`)}`}
          className="auth-submit"
          style={{display:'block', textAlign:'center', padding:'11px', borderRadius:'8px', fontWeight:600, fontSize:'0.9rem', background:'var(--text)', color:'#000', marginTop:'8px'}}
        >
          Sign in →
        </Link>
      </div>
    </div>
  )

  if (denied) return (
    <div className="auth-page">
      <div className="auth-card" style={{textAlign:'center'}}>
        <div className="auth-logo">primer<span style={{color:'#4ade80'}}>.</span></div>
        <div style={{fontSize:'2rem', marginBottom:'16px'}}>✗</div>
        <div className="auth-title" style={{fontSize:'1.25rem'}}>Access denied</div>
        <p className="auth-subtitle">You can close this tab. The terminal session was cancelled.</p>
      </div>
    </div>
  )

  if (done) return (
    <div className="auth-page">
      <div className="auth-card" style={{textAlign:'center'}}>
        <div className="auth-logo">primer<span style={{color:'#4ade80'}}>.</span></div>
        <div style={{fontSize:'2rem', marginBottom:'16px'}}>✓</div>
        <div className="auth-title" style={{fontSize:'1.25rem', color:'#4ade80'}}>Machine linked!</div>
        <p className="auth-subtitle">
          Your terminal is now linked to <strong>{user.email}</strong>.<br/>
          Your context will start syncing automatically.
        </p>
        <p style={{fontSize:'0.75rem', color:'var(--text-3)', marginTop:'12px'}}>
          Redirecting to dashboard…
        </p>
      </div>
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{textAlign:'center'}}>primer<span style={{color:'#4ade80'}}>.</span></div>

        <div style={{textAlign:'center', marginBottom:'28px'}}>
          <div style={{
            width:'48px', height:'48px', borderRadius:'50%',
            background:'var(--bg-3)', border:'1px solid var(--border)',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 16px', fontSize:'1.25rem'
          }}>💻</div>
          <div className="auth-title" style={{fontSize:'1.25rem'}}>Link this machine?</div>
          <p className="auth-subtitle" style={{marginBottom:0}}>
            A terminal running <code style={{fontFamily:'JetBrains Mono, monospace', fontSize:'0.8rem', background:'var(--bg-3)', padding:'2px 6px', borderRadius:'4px'}}>primer login</code> wants to link to your account.
          </p>
        </div>

        <div style={{
          background:'var(--bg-3)', border:'1px solid var(--border)',
          borderRadius:'8px', padding:'14px 16px', marginBottom:'24px'
        }}>
          <div style={{fontSize:'0.75rem', color:'var(--text-3)', marginBottom:'4px'}}>Signing in as</div>
          <div style={{fontSize:'0.875rem', fontWeight:500}}>{user.email}</div>
        </div>

        {error && (
          <p style={{color:'#f87171', fontSize:'0.8rem', marginBottom:'12px', textAlign:'center'}}>{error}</p>
        )}

        <div style={{display:'flex', gap:'8px'}}>
          <button
            onClick={() => setDenied(true)}
            style={{
              flex:1, padding:'10px', borderRadius:'8px', fontSize:'0.875rem',
              fontWeight:500, background:'var(--accent-dim)', color:'var(--text)',
              border:'1px solid var(--border)', cursor:'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={confirming}
            style={{
              flex:2, padding:'10px', borderRadius:'8px', fontSize:'0.875rem',
              fontWeight:600, background:'var(--text)', color:'#000',
              border:'none', cursor:confirming ? 'not-allowed' : 'pointer',
              opacity: confirming ? 0.7 : 1
            }}
          >
            {confirming ? 'Linking…' : 'Confirm — Link machine'}
          </button>
        </div>

        <p style={{fontSize:'0.75rem', color:'var(--text-3)', textAlign:'center', marginTop:'16px'}}>
          This grants your terminal read/write access to your Primer context.
        </p>
      </div>
    </div>
  )
}

export default function CliAuthPage() {
  return (
    <Suspense fallback={
      <div className="auth-page">
        <div className="auth-card" style={{textAlign:'center'}}>
          <div className="auth-logo">primer<span style={{color:'#4ade80'}}>.</span></div>
        </div>
      </div>
    }>
      <CliAuthContent />
    </Suspense>
  )
}
