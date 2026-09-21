'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">primer<span style={{color:'#4ade80'}}>.</span></div>

        {sent ? (
          <>
            <div className="auth-title">Check your email</div>
            <p className="auth-subtitle">
              We sent a magic link to <strong>{email}</strong>.<br />
              Click it to sign in — no password needed.
            </p>
            <p className="auth-msg">Didn&apos;t get it? Check your spam folder.</p>
          </>
        ) : (
          <>
            <div className="auth-title">Sign in to Primer</div>
            <p className="auth-subtitle">Enter your email to get a magic link. No password needed.</p>
            <form onSubmit={submit}>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
              {error && <p style={{color:'#f87171', fontSize:'0.8rem', marginBottom:'8px'}}>{error}</p>}
              <button className="auth-submit" type="submit" disabled={loading || !email}>
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
            <p className="auth-msg">
              Free plan requires no account.{' '}
              <a href="https://www.npmjs.com/package/getprimer" style={{color:'#888', textDecoration:'underline'}}>
                Install directly →
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
