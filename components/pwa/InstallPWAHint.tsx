'use client'

import { useState, useEffect } from 'react'
import { isStandalonePWA, getOS, isMobile, PWA_INSTRUCTIONS } from '@/lib/pwa'

const DISMISSED_KEY = 'scrimsync_pwa_dismissed'

export function InstallPWAHint() {
  const [visible, setVisible] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [os, setOs] = useState<'ios' | 'android' | 'other'>('other')

  useEffect(() => {
    const standalone = isStandalonePWA()
    const dismissed = localStorage.getItem(DISMISSED_KEY) === '1'
    const mobile = isMobile()
    setOs(getOS())

    if (!standalone && !dismissed && mobile) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  const instructions = os === 'ios' ? PWA_INSTRUCTIONS.ios : PWA_INSTRUCTIONS.android

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v10M5 8l3 3 3-3M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">Installer ScrimSync</p>
            <p className="text-xs text-text-muted">Accès rapide depuis votre écran d'accueil</p>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0 mt-0.5"
          aria-label="Masquer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L7 6.293l4.146-4.147a.5.5 0 0 1 .708.708L7.707 7l4.147 4.146a.5.5 0 0 1-.708.708L7 7.707l-4.146 4.147a.5.5 0 0 1-.708-.708L6.293 7z" />
          </svg>
        </button>
      </div>

      {!showSteps ? (
        <button
          onClick={() => setShowSteps(true)}
          className="mt-3 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
        >
          Comment installer →
        </button>
      ) : (
        <ol className="mt-3 space-y-1.5 list-none">
          {instructions.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
              <span className="flex-shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold text-[10px]">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
