'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { Logo } from '@/components/Logo'
import { WeekSelector } from '@/components/availability/WeekSelector'
import { AvailabilityGrid } from '@/components/availability/AvailabilityGrid'
import { ScrimCard } from '@/components/scrims/ScrimCard'
import { InstallPWAHint } from '@/components/pwa/InstallPWAHint'
import { PushNotifications } from '@/components/pwa/PushNotifications'
import { PullToRefresh } from '@/components/pwa/PullToRefresh'
import { BottomNav } from '@/components/ui/BottomNav'
import { SkeletonAvailabilityGrid, SkeletonScrimCard, SkeletonStats } from '@/components/ui/Skeleton'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getCurrentWeekStart,
  formatWeekStart,
  formatWeekLabel,
} from '@/lib/dates'
import { buildPlayerAvailabilitySet } from '@/lib/availability'
import { Player, Availability, Scrim, SaveStatus } from '@/types'

type PlayerTab = 'dispo' | 'scrims' | 'stats'

const TABS = [
  {
    key: 'dispo',
    label: 'Dispo',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 14.5l1.5 1.5L17 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: 'scrims',
    label: 'Scrims',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 8h14" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 11.5h1.5M11 11.5h1.5M7 14.5h1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'stats',
    label: 'Stats',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 17V11M7 17V7M11 17V9M15 17V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

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
  const [stats, setStats] = useState<{ wins: number; losses: number; total: number; scrims: Scrim[] } | null>(null)
  const [activeTab, setActiveTab] = useState<PlayerTab>('dispo')
  const [countdown, setCountdown] = useState<{ text: string; scrim: Scrim } | null>(null)

  const ws = formatWeekStart(weekStart)

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
      const [availData, scrimsData] = await Promise.all([availRes.json(), scrimsRes.json()])
      if (Array.isArray(availData)) {
        setAvailabilities(availData)
        setSelected(buildPlayerAvailabilitySet(availData))
      }
      if (Array.isArray(scrimsData)) setScrims(scrimsData)
    } finally {
      setLoadingData(false)
    }
  }, [player, ws])

  useEffect(() => { loadWeekData() }, [loadWeekData])

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setStats(d)).catch(() => {})
  }, [])

  useEffect(() => {
    function formatDiff(ms: number): string {
      const totalMin = Math.floor(ms / 60000)
      const h = Math.floor(totalMin / 60)
      const m = totalMin % 60
      if (totalMin < 1) return 'quelques instants'
      if (h > 0 && m > 0) return `${h}h${String(m).padStart(2, '0')}`
      if (h > 0) return `${h}h`
      return `${m} min`
    }

    function update() {
      const now = Date.now()
      const upcoming = scrims
        .filter(s => s.status === 'confirmed')
        .map(s => {
          const d = new Date(weekStart)
          d.setDate(d.getDate() + (s.day_of_week - 1))
          d.setHours(s.start_hour, 0, 0, 0)
          return { scrim: s, ms: d.getTime() - now }
        })
        .filter(({ ms }) => ms > 0 && ms <= 24 * 60 * 60 * 1000)
        .sort((a, b) => a.ms - b.ms)

      if (upcoming.length === 0) { setCountdown(null); return }
      const { scrim, ms } = upcoming[0]
      setCountdown({ text: formatDiff(ms), scrim })
    }

    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [scrims, weekStart])

  function toggleSlot(key: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    if (saveStatus !== 'idle') setSaveStatus('idle')
  }

  async function handleResultChange(scrimId: string, result: 'win' | 'loss', score: string, notes: string) {
    await fetch(`/api/scrims/${scrimId}/result`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result, score, notes }),
    })
    await loadWeekData()
    fetch('/api/stats').then(r => r.json()).then(d => setStats(d)).catch(() => {})
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

      <PullToRefresh onRefresh={loadWeekData}>
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">

          {/* Greeting (always visible) */}
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Bonjour, {player.name}
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              Semaine du {formatWeekLabel(weekStart)}
            </p>
          </div>

          <div key={activeTab} className="animate-fade-in space-y-6">

            {/* ── DISPO ── */}
            {activeTab === 'dispo' && <>
              <PushNotifications playerId={player.id} />

              <Card>
                <CardHeader>
                  <CardTitle>Mes disponibilités</CardTitle>
                  <p className="text-xs text-text-muted mt-1">
                    Coche les heures auxquelles tu peux être prêt à lancer un scrim.
                  </p>
                </CardHeader>

                {loadingData ? (
                  <SkeletonAvailabilityGrid />
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
                    <span className="text-sm text-danger animate-fade-in">Erreur, réessaie.</span>
                  )}
                </div>
              </Card>

              <InstallPWAHint />
            </>}

            {/* ── SCRIMS ── */}
            {activeTab === 'scrims' && <>
              {countdown && (
                <div className="flex items-center gap-3 bg-accent/10 border border-accent/25 rounded-xl px-4 py-3 animate-fade-in">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      vs {countdown.scrim.opponent_name}
                    </p>
                    <p className="text-xs text-accent font-medium mt-0.5">
                      Dans {countdown.text}
                    </p>
                  </div>
                  <div className="ml-auto flex-shrink-0 text-right">
                    <p className="text-xs text-text-muted">{countdown.scrim.start_hour}h00</p>
                  </div>
                </div>
              )}

              <Card>
                <CardHeader><CardTitle>Scrims confirmés</CardTitle></CardHeader>
                {loadingData ? (
                  <div className="space-y-3">
                    <SkeletonScrimCard />
                    <SkeletonScrimCard />
                  </div>
                ) : scrims.length === 0 ? (
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
                        onResultChange={(result, score, notes) => handleResultChange(scrim.id, result as 'win' | 'loss', score, notes ?? '')}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </>}

            {/* ── STATS ── */}
            {activeTab === 'stats' && (
              <Card>
                <CardHeader><CardTitle>Statistiques de l'équipe</CardTitle></CardHeader>
                {!stats ? (
                  <SkeletonStats />
                ) : stats.total === 0 ? (
                  <p className="text-sm text-text-muted py-2">Aucun résultat enregistré pour l'instant.</p>
                ) : (
                  <>
                    <div className="flex items-center gap-6 flex-wrap mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success">{stats.wins}</p>
                        <p className="text-xs text-text-muted mt-0.5">Victoires</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-danger">{stats.losses}</p>
                        <p className="text-xs text-text-muted mt-0.5">Défaites</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                        <p className="text-xs text-text-muted mt-0.5">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-accent">
                          {Math.round((stats.wins / stats.total) * 100)}%
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">Win rate</p>
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-border-subtle pt-4">
                      {stats.scrims.map((s) => (
                        <div key={s.id} className="flex items-center justify-between gap-2 text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-xs font-bold w-4 flex-shrink-0 ${s.result === 'win' ? 'text-success' : 'text-danger'}`}>
                              {s.result === 'win' ? 'W' : 'L'}
                            </span>
                            <span className="text-text-primary truncate">vs {s.opponent_name}</span>
                            {s.score && <span className="text-text-muted text-xs flex-shrink-0">{s.score}</span>}
                          </div>
                          <span className="text-xs text-text-muted flex-shrink-0">
                            {new Date(s.week_start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            )}

          </div>
        </main>
      </PullToRefresh>

      <BottomNav tabs={TABS} active={activeTab} onChange={key => setActiveTab(key as PlayerTab)} />
    </div>
  )
}
