'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

interface Player {
  name: string
  token: string
}

export default function PlayerSelectPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/players')
      .then(r => r.json())
      .then(data => { setPlayers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 pt-safe">
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

        <h1 className="text-xl font-bold text-text-primary text-center mb-1">
          Qui es-tu ?
        </h1>
        <p className="text-sm text-text-muted text-center mb-6">
          Sélectionne ton prénom pour accéder à tes disponibilités.
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {players.map(player => (
              <button
                key={player.token}
                onClick={() => router.push(`/player/${player.token}`)}
                className="flex items-center justify-between w-full px-4 h-12 rounded-xl border border-border-subtle bg-bg-surface hover:bg-bg-elevated hover:border-border active:scale-[0.98] transition-all duration-150 text-left"
              >
                <span className="font-medium text-text-primary">{player.name}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12l4-4-4-4" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
