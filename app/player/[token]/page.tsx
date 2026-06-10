'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { Logo } from '@/components/Logo'
import { WeekSelector } from '@/components/availability/WeekSelector'

import { AvailabilityGrid } from '@/components/availability/AvailabilityGrid'
import { ScrimCard } from '@/components/scrims/ScrimCard'
import { InstallPWAHint } from '@/components/pwa/InstallPWAHint'
import { PushNotifications } from '@/components/pwa/PushNotifications'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getCurrentWeekStart,
  formatWeekStart,
  formatWeekLabel,
  parseWeekStart,
} from '@/lib/dates'
import { buildPlayerAvailabilitySet, slotKey } from '@/lib/availability'
import { APP_CONFIG } from '@/config/app'
import { Player, Availability, Scrim, SaveStatus } from '@/types'

interface PageProps {
  params: Promise<{ token: string }>
}

export default function PlayerPage({ params }: PageProps) {
  const { token } = use(params)

  const [weekStart, setWeekStart] = useState<Date>(getCurrentWeekStart())
  const [player, setPlayer] = useState<Player | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [scrims, setScrims] = useState<Scrim[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [loadingData, setLoadingData] = useState(true)

  const ws = formatWeekStart(weekStart)

  // Load player once
  useEffect(() => {
    fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setNotFound(true)
        } else {
          setPlayer(data)
          localStorage.setItem('player_token', token)
        }
      })
      .catch(() => setNotFound(true))
  }, [token])

  const loadWeekData = useCallback(async () => {
    if (!player) return
    setLoadingData(true)
    try {
      const [availRes, scrimsRes] = await Promise.all([
        fetch(`/api/availability?week_start=${ws}&player_id=${player.id}`),
        fetch(`/api/scrims?week_start=${ws}`),
      ])
      const [availData, scrimsData] = await Promise.all([
        availRes.json(),
        scrimsRes.json(),
      ])
      if (Array.isArray(availData)) {
        setAvailabilities(availData)
        setSelected(buildPlayerAvailabilitySet(availData))
      }
      if (Array.isArray(scrimsData)) setScrims(scrimsData)
    } finally {
      setLoadingData(false)
    }
  }, [player, ws])

  useEffect(() => {
    loadWeekData()
  }, [loadWeekData])

  function toggleSlot(key: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
    if (saveStatus !== 'idle') setSaveStatus('idle')
  }

  async function handleResultChange(scrimId: string, result: 'win' | 'loss', score: string) {
    await fetch(`/api/scrims/${scrimId}/result`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result, score }),
    })
    await loadWeekData()
  }

  async function handleSave() {
    if (!player) return
    setSaveStatus('saving')

    const slots = Array.from(selected).map(key => {
      const [day, hour] = key.split('-').map(Number)
      return { day_of_week: day, start_hour: hour }
    })

    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: player.id, week_start: ws, slots }),
      })

      if (res.ok) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <Logo size="md" className="justify-center mb-6" />
          <p className="text-base font-medium text-text-primary mb-1">Lien invalide</p>
          <p className="text-sm text-text-muted">Ce lien joueur n'existe pas ou a expiré.</p>
        </div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-surface/80 backdrop-blur-sm sticky top-0 z-10 pt-safe">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <WeekSelector weekStart={weekStart} onChange={setWeekStart} />
            <a
              href="/player"
              onClick={() => localStorage.removeItem('player_token')}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-danger transition-colors px-2 py-1.5 rounded-lg hover:bg-danger/10"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9.5 9.5L13 7m0 0L9.5 4.5M13 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden sm:inline">Changer</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Greeting */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Bonjour, {player.name}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Semaine du {formatWeekLabel(weekStart)}
          </p>
        </div>

        {/* Push notifications */}
        <PushNotifications playerId={player.id} />

        {/* Availability card */}
        <Card>
          <CardHeader>
            <CardTitle>Mes disponibilités</CardTitle>
            <p className="text-xs text-text-muted mt-1">
              Coche les heures auxquelles tu peux être prêt à lancer un scrim. Pas besoin d'indiquer l'heure de fin.
            </p>
          </CardHeader>

          {loadingData ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : (
            <AvailabilityGrid
              weekStart={weekStart}
              selected={selected}
              onToggle={toggleSlot}
              disabled={saveStatus === 'saving'}
            />
          )}

          <div className="mt-4 flex items-center gap-3">
            <Button
              onClick={handleSave}
              loading={saveStatus === 'saving'}
              disabled={saveStatus === 'saving'}
              className="flex-1 sm:flex-none"
              size="lg"
            >
              Enregistrer
            </Button>

            {saveStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-sm text-success animate-fade-in">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Disponibilités enregistrées
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm text-danger animate-fade-in">
                Erreur, réessaie.
              </span>
            )}
          </div>
        </Card>

        {/* Confirmed scrims */}
        <Card>
          <CardHeader>
            <CardTitle>Scrims confirmés</CardTitle>
          </CardHeader>
          {scrims.length === 0 ? (
            <EmptyState
              title="Aucun scrim confirmé cette semaine"
              description="L'admin confirmera les scrims une fois les disponibilités reçues."
            />
          ) : (
            <div className="space-y-3">
              {scrims.map(scrim => (
                <ScrimCard
                  key={scrim.id}
                  scrim={scrim}
                  weekStart={weekStart}
                  onResultChange={(result, score) => handleResultChange(scrim.id, result as 'win' | 'loss', score)}
                />
              ))}
            </div>
          )}
        </Card>

        {/* PWA hint */}
        <InstallPWAHint />
      </main>
    </div>
  )
}
