'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        window.location.href = '/admin'
      } else {
        const data = await res.json()
        setError(data.error || 'Mot de passe incorrect')
        setLoading(false)
      }
    } catch {
      setError('Erreur réseau, réessaie')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">

        <Link href="/" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-8 w-fit">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour à l'accueil
        </Link>

        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
          <h1 className="text-lg font-semibold text-text-primary mb-1">Accès admin</h1>
          <p className="text-sm text-text-muted mb-5">
            Entrez le mot de passe pour gérer les scrims.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              autoComplete="current-password"
            />
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-danger/10 border border-danger/20 px-3 py-2.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                  <circle cx="7" cy="7" r="6" stroke="#ef4444" strokeWidth="1.5"/>
                  <path d="M7 4v3M7 9.5v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Accéder
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
