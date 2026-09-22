'use client'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const params = useSearchParams()
  const redirectTo = params.get('redirect') ?? '/dashboard'

  async function signInWithGitHub() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" style={{ textAlign: 'center', marginBottom: '28px' }}>
          primer<span style={{ color: '#4ade80' }}>.</span>
        </div>

        <div className="auth-title">Sign in to Primer</div>
        <p className="auth-subtitle" style={{ marginBottom: '24px' }}>
          Continue with your GitHub account.
        </p>

        <button
          onClick={signInWithGitHub}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.95rem',
            background: 'var(--text)',
            color: '#000',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          Continue with GitHub
        </button>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', textAlign: 'center', marginTop: '20px' }}>
          Free plan requires no account.{' '}
          <a href="https://www.npmjs.com/package/getprimer" style={{ color: 'var(--text-3)', textDecoration: 'underline' }}>
            Install directly →
          </a>
        </p>
      </div>
    </div>
  )
}

export default function LoginClient() {
  return (
    <Suspense fallback={
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo">primer<span style={{ color: '#4ade80' }}>.</span></div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
