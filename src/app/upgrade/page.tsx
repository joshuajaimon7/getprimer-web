'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const PRO_FEATURES = [
  'Everything in Free (unlimited local use)',
  'Cloud sync — context across machines',
  'LLM extraction (WHY, not just WHAT)',
  'MCP server — agents query live context',
  'Dashboard at getprimer.cloud',
  'Cancel anytime',
]

function UpgradeContent() {
  const params = useSearchParams()
  const cliToken = params.get('token')
  const cancelled = params.get('cancelled')

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  async function signInWithGitHub() {
    const supabase = createClient()
    const next = `/upgrade${cliToken ? `?token=${cliToken}` : ''}`
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
  }

  async function startCheckout() {
    setPaying(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cli_token: cliToken }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { alert('Something went wrong. Try again.'); setPaying(false) }
    } catch {
      alert('Network error. Try again.')
      setPaying(false)
    }
  }

  if (loading) return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">primer<span style={{ color: '#4ade80' }}>.</span></div>
      </div>
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ textAlign: 'center', marginBottom: '24px' }}>
          primer<span style={{ color: '#4ade80' }}>.</span>
        </div>

        {cancelled && (
          <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', padding: '12px 16px', marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-2)' }}>
            Payment cancelled — no charge was made.
          </div>
        )}

        {cliToken && (
          <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', padding: '12px 16px', marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#4ade80' }}>●</span>
            Terminal session detected — your machine links automatically after payment.
          </div>
        )}

        <div className="auth-title" style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
          Upgrade to Pro
        </div>
        <p className="auth-subtitle">Context travels with you across machines.</p>

        {/* Pricing card — sharp corners to match design system */}
        <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>$5</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>per month</div>
            </div>
            <div style={{ border: '1px solid var(--border)', padding: '2px 8px', fontSize: '0.68rem', color: 'var(--text-3)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Pro</div>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PRO_FEATURES.map(f => (
              <li key={f} style={{ fontSize: '0.85rem', color: 'var(--text-2)', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#4ade80', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {!user ? (
          <>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '10px', textAlign: 'center' }}>
              Step 1 of 2 — Sign in to continue
            </p>
            <button
              onClick={signInWithGitHub}
              style={{ width: '100%', padding: '11px', fontWeight: 600, fontSize: '0.9rem', background: 'var(--text)', color: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              Continue with GitHub
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '14px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>
            <Link
              href={`/login?redirect=${encodeURIComponent(`/upgrade${cliToken ? `?token=${cliToken}` : ''}`)}`}
              style={{ display: 'block', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-3)' }}
            >
              Sign in instead →
            </Link>
          </>
        ) : (
          <>
            <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', padding: '12px 16px', marginBottom: '16px', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-3)' }}>Signed in as </span>
              <span style={{ color: 'var(--text)' }}>{user.email}</span>
            </div>
            <button
              onClick={startCheckout}
              disabled={paying}
              style={{
                width: '100%', padding: '12px', fontWeight: 700, fontSize: '0.95rem',
                background: paying ? 'var(--bg-3)' : 'var(--text)',
                color: paying ? 'var(--text-3)' : '#000',
                border: paying ? '1px solid var(--border)' : 'none',
                cursor: paying ? 'not-allowed' : 'pointer',
              }}
            >
              {paying ? 'Redirecting to payment…' : 'Upgrade to Pro — $5/month →'}
            </button>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', textAlign: 'center', marginTop: '10px' }}>
              Powered by Stripe · Cancel anytime · No contracts
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo">primer<span style={{ color: '#4ade80' }}>.</span></div>
        </div>
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  )
}
