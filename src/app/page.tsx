'use client'
import Link from 'next/link'
import { useState } from 'react'

const TOOLS = ['Cursor', 'Claude Code', 'Windsurf', 'Aider', 'Goose', 'OpenCode']

const STEPS = [
  {
    num: '01',
    title: 'Install once',
    desc: 'One command. That\'s it. Primer quietly runs in the background — nothing to configure, nothing to maintain.',
    code: 'npm install -g getprimer\nprimer setup',
  },
  {
    num: '02',
    title: 'Primer figures out the rest',
    desc: 'Open any project and Primer already knows what it is. Your stack, your recent decisions, what\'s in progress. No input from you.',
    code: '# AGENTS.md written automatically\n# .cursorrules, .windsurfrules too\n# No commands needed',
  },
  {
    num: '03',
    title: 'Every agent just knows',
    desc: 'Cursor, Claude Code, Windsurf, Aider, Goose — whichever tool you open, it already has full context before you type a word.',
    code: '# Cursor   → .cursorrules\n# Claude    → AGENTS.md\n# Windsurf  → .windsurfrules\n# Aider     → .aider.conf.yml',
  },
]

export default function Home() {
  const [copied, setCopied] = useState(false)
  const [showInstall, setShowInstall] = useState(false)

  function copy() {
    navigator.clipboard.writeText('npm install -g getprimer')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo">primer<span>.</span></div>
        <div className="nav-links">

          <a className="nav-link" href="https://www.npmjs.com/package/getprimer" target="_blank" rel="noopener">npm</a>
          <Link href="/login" className="nav-btn">Sign in</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-tag">
          <span className="hero-tag-dot" />
          v3.0.8 — now on npm
        </div>
        <h1 className="hero-h1">Your context<br />lives with you.</h1>
        <p className="hero-sub">
          Install once. Every AI agent knows your project —<br />
          Cursor, Claude Code, Windsurf, Aider, Goose. Zero config.
        </p>

        <div className="install-box">
          <span className="install-cmd">npm install -g getprimer</span>
          <button className="install-copy" onClick={copy} title="Copy">
            {copied ? (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="8" height="8" stroke="currentColor" strokeWidth="1.2"/><path d="M3 11V3h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            )}
          </button>
        </div>

        <div className="hero-actions">
          <Link href="/login" className="btn-primary">Get started free</Link>
        </div>

        <div className="tools-row">
          {TOOLS.map(t => <span key={t} className="tool-item">{t}</span>)}
        </div>
      </section>

      {/* Context preview */}
      <section className="section">
        <p className="section-label">What agents see</p>
        <h2 className="section-title">Every agent reads this<br />before your first message.</h2>
        <div className="context-preview">
          <div className="context-header">
            <span className="context-filename">AGENTS.md — my-saas-app</span>
          </div>
          <div className="context-body">
            <div className="h1"># Project: my-saas-app</div>
            <div className="muted">{'>'} Auto-maintained by Primer v3.0.8. Last updated: 2m ago. Do not edit manually.</div>
            <br/>
            <div className="section-head">## Stack</div>
            <div>Next.js · TypeScript · Supabase · Stripe · Tailwind</div>
            <br/>
            <div className="section-head">## Recent decisions & context</div>
            <div>- ⚙️ Moved payments to server-side — client was exposing secret key <span className="muted">*(2026-09-21)*</span></div>
            <div>- ⚙️ Switched auth to middleware — no per-route checks needed <span className="muted">*(2026-09-19)*</span></div>
            <div>- 📝 Postgres over SQLite — needed concurrent writes for team features <span className="muted">*(2026-09-18)*</span></div>
            <br/>
            <div className="section-head">## Active files (last 7 days)</div>
            <div>- `src/app/dashboard/page.tsx` — last saved 2h ago, 8 edits</div>
            <div>- `src/app/api/payments/webhook/route.ts` — 5 edits</div>
            <div>- `src/components/ui/button.tsx` — 4 edits</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <p className="section-label">How it works</p>
        <h2 className="section-title">Install once. Works everywhere.</h2>
        <div className="steps">
          {STEPS.map(s => (
            <div key={s.num} className="step">
              <div className="step-num">{s.num}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
              <pre className="step-code">{s.code}</pre>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="section">
        <p className="section-label">Pricing</p>
        <h2 className="section-title">Free forever. Pro for cloud.</h2>
        <div className="pricing-grid">
          <div className="plan">
            <div className="plan-name">Free</div>
            <div className="plan-price">$0</div>
            <div className="plan-desc">Always free. No account needed.</div>
            <ul className="plan-features">
              <li>Runs locally — unlimited projects</li>
              <li>All IDE context files generated</li>
              <li>Git decision extraction</li>
              <li>Automatic project detection</li>
              <li>Works fully offline</li>
            </ul>
            {showInstall ? (
              <div className="install-reveal">
                <div style={{fontSize:'0.72rem', color:'var(--text-3)', marginBottom:'4px'}}>Run in your terminal:</div>
                <pre>{`npm install -g getprimer\nprimer setup`}</pre>
                <button
                  onClick={() => setShowInstall(false)}
                  style={{marginTop:'10px', fontSize:'0.72rem', color:'var(--text-3)', background:'none', textDecoration:'underline'}}
                >
                  close
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowInstall(true)}
                className="plan-cta secondary"
              >
                Install now
              </button>
            )}
          </div>
          <div className="plan featured">
            <div className="plan-name">Pro</div>
            <div className="plan-price">$5 <span>/ month</span></div>
            <div className="plan-desc">Context travels with you across machines.</div>
            <ul className="plan-features">
              <li>Everything in Free</li>
              <li>Cloud sync — context across machines</li>
              <li>Pull context on any new machine instantly</li>
              <li>MCP server — agents query context live</li>
              <li>Dashboard at getprimer.cloud</li>
            </ul>
            <Link href="/upgrade" className="plan-cta primary">Get Pro</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{maxWidth:'var(--max-w)', margin:'0 auto', borderTop:'1px solid var(--border)'}}>
        <div className="footer">
          <div className="footer-logo">primer<span style={{color:'var(--green)'}}>.</span></div>
          <div className="footer-links">

            <a href="https://www.npmjs.com/package/getprimer" className="footer-link" target="_blank" rel="noopener">npm</a>
            <Link href="/login" className="footer-link">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  )
}
