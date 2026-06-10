'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Scrim } from '@/types'
import {
  formatScrimDate,
  formatHour,
  formatDayLong,
  getCurrentWeekStart,
  parseWeekStart,
} from '@/lib/dates'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ScrimDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const [scrim, setScrim] = useState<Scrim | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/scrims/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('not found')
        return r.json()
      })
      .then(data => setScrim(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  if (notFound || !scrim) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <Logo size="md" className="justify-center mb-6" />
          <p className="text-base font-medium text-text-primary mb-1">Scrim introuvable</p>
          <p className="text-sm text-text-muted">Ce scrim n'existe pas.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-accent hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  const weekStart = parseWeekStart(scrim.week_start)

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border-subtle bg-bg-surface/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <Link
            href="/"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            ← Accueil
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <div className="mb-6">
          <Badge variant="accent" className="mb-3">Scrim confirmé</Badge>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            vs {scrim.opponent_name}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {formatScrimDate(weekStart, scrim.day_of_week, scrim.start_hour)}
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated text-text-muted flex-shrink-0">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 1a6.5 6.5 0 1 0 0 13A6.5 6.5 0 0 0 7.5 1zm0 1a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm.5 2.5h-1v4.293l2.854 2.853.707-.707-2.56-2.56V4.5z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted font-medium mb-0.5">Heure de début</p>
                  <p className="text-sm font-semibold text-text-primary">{formatHour(scrim.start_hour)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated text-text-muted flex-shrink-0">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M12 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM3 1h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zm.5 3.5h8v1h-8v-1zm0 2.5h5v1h-5V7z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted font-medium mb-0.5">Jour</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {formatDayLong(scrim.day_of_week)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated text-text-muted flex-shrink-0">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5.5A7 7 0 1 0 7.5 14.5 7 7 0 0 0 7.5.5zm0 1A6 6 0 1 1 7.5 13.5 6 6 0 0 1 7.5 1.5zm.5 2.5h-1v3.5L4.5 10l.707.707 2.793-2.793V4z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-text-muted font-medium mb-0.5">Adversaire</p>
                  <p className="text-sm font-semibold text-text-primary">{scrim.opponent_name}</p>
                </div>
              </div>

              <a
                href={scrim.opponent_opgg_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-10 w-full rounded-lg bg-accent/10 border border-accent/20 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
              >
                Voir l'équipe adverse sur OP.GG
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3.5 8.5l5-5M5 3.5h3.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </Card>

          {scrim.notes && (
            <Card>
              <p className="text-xs text-text-muted font-medium mb-1.5 uppercase tracking-wide">Notes</p>
              <p className="text-sm text-text-secondary">{scrim.notes}</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
