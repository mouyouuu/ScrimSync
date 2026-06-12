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
import { ReadyCheckCard } from '@/components/scrims/ReadyCheckCard'
import { RankBadge, getTotalLP, lpToTierInfo } from '@/components/lol/RankBadge'

function isScrimToday(scrim: Scrim, wStart: Date): boolean {
  const d = new Date(wStart)
  d.setDate(d.getDate() + (scrim.day_of_week - 1))
  const today = new Date()
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
}

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
  const [isAbsent, setIsAbsent] = useState(false)
  const [absentLoading, setAbsentLoading] = useState(false)
  const [rankRefreshing, setRankRefreshing] = useState(false)
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([])

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
      const [availRes, scrimsRes, absentRes] = await Promise.all([
        fetch(`/api/availability?week_start=${ws}&player_id=${player.id}`),
        fetch(`/api/scrims?week_start=${ws}`),
        fetch(`/api/availability/absent?week_start=${ws}&player_id=${player.id}`),
      ])
      const [availData, scrimsData, absentData] = await Promise.all([availRes.json(), scrimsRes.json(), absentRes.json()])
      setIsAbsent(absentData.absent ?? false)
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
    fetch('/api/players')
      .then(r => r.json())
      .then((data: Player[]) => {
        if (Array.isArray(data)) setTeamPlayers(data.filter(p => p.role !== 'staff'))
      })
      .catch(() => {})
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

  async function handleToggleAbsent() {
    if (!player) return
    setAbsentLoading(true)
    const next = !isAbsent
    await fetch('/api/availability/absent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: player.id, week_start: ws, absent: next }),
    })
    setIsAbsent(next)
    if (next) setSelected(new Set())
    setAbsentLoading(false)
  }

  async function handleRefreshRank() {
    if (!player) return
    setRankRefreshing(true)
    const res = await fetch('/api/riot/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_token: token }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPlayer(updated)
    }
    setRankRefreshing(false)
  }

  async function copyLastWeek() {
    if (!player) return
    const prevDate = new Date(weekStart)
    prevDate.setDate(prevDate.getDate() - 7)
    const prevWs = prevDate.toISOString().split('T')[0]
    const res = await fetch(`/api/availability?week_start=${prevWs}&player_id=${player.id}`)
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      const keys = new Set(data.map((a: { day_of_week: number; start_hour: number }) => `${a.day_of_week}-${a.start_hour}`))
      setSelected(keys)
      if (isAbsent) {
        await fetch('/api/availability/absent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player_id: player.id, week_start: ws, absent: false }),
        })
        setIsAbsent(false)
      }
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
      <header className="sticky top-0 z-10 pt-safe" style={{ background: 'rgba(9,9,11,0.82)', backdropFilter: 'blur(20px) saturate(1.4)', WebkitBackdropFilter: 'blur(20px) saturate(1.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-5">

          {/* Greeting — dispo tab only */}
          {activeTab === 'dispo' && (
            <div className="animate-fade-in pt-1">
              <h1 className="text-[28px] font-bold tracking-tight text-text-primary leading-tight">
                Bonjour, {player.name}
              </h1>
              <p className="text-[13px] text-text-muted mt-1 font-normal">
                Semaine du {formatWeekLabel(weekStart)}
              </p>
            </div>
          )}

          {/* Bloc ELO — toujours visible si compte lié */}
          {player.riot_tier && (() => {
            const isUnranked = player.riot_tier === 'UNRANKED'
            const currentLP = isUnranked ? 0 : getTotalLP(player.riot_tier!, player.riot_rank, player.riot_lp!)
            const lpGained = player.riot_lp_start != null && !isUnranked ? currentLP - player.riot_lp_start : null
            const wins = player.riot_wins ?? 0
            const losses = player.riot_losses ?? 0
            const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null
            return (
              <div className="animate-fade-in rounded-2xl overflow-hidden border border-white/[0.07]" style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.10) 0%, rgba(20,20,26,0.98) 60%)' }}>
                {/* Rang principal */}
                <div className="px-5 pt-5 pb-4 flex items-center gap-4">
                  <RankBadge
                    tier={player.riot_tier!}
                    rank={player.riot_rank}
                    lp={player.riot_lp}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    {(() => {
                      const tierLabel = player.riot_tier!.charAt(0) + player.riot_tier!.slice(1).toLowerCase()
                      return (
                        <>
                          <p className="text-[20px] font-bold text-text-primary tracking-tight leading-none">
                            {tierLabel}{!['MASTER','GRANDMASTER','CHALLENGER'].includes(player.riot_tier!.toUpperCase()) && player.riot_rank ? ` ${player.riot_rank}` : ''}
                          </p>
                          {!isUnranked && <p className="text-sm text-text-muted mt-1">{player.riot_lp} LP</p>}
                        </>
                      )
                    })()}
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    {lpGained !== null && (
                      <p className={['text-[15px] font-bold tabular-nums', lpGained >= 0 ? 'text-success' : 'text-danger'].join(' ')}>
                        {lpGained >= 0 ? '+' : ''}{lpGained} LP
                      </p>
                    )}
                    <button
                      onClick={handleRefreshRank}
                      disabled={rankRefreshing}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary transition-all disabled:opacity-40"
                      title="Actualiser mon rang"
                    >
                      <svg
                        width="14" height="14" viewBox="0 0 13 13" fill="none"
                        className={rankRefreshing ? 'animate-spin' : ''}
                      >
                        <path d="M11.5 2A5.5 5.5 0 106.5 12M11.5 2v3.5H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Stats ranked */}
                {!isUnranked && (wins + losses > 0) && (
                  <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-t border-white/[0.06]">
                    <div className="py-3 text-center">
                      <p className="text-[22px] font-bold text-success tracking-tight leading-none">{wins}</p>
                      <p className="text-[10px] text-text-muted mt-1.5 font-medium uppercase tracking-wider">V</p>
                    </div>
                    <div className="py-3 text-center">
                      <p className="text-[22px] font-bold text-danger tracking-tight leading-none">{losses}</p>
                      <p className="text-[10px] text-text-muted mt-1.5 font-medium uppercase tracking-wider">D</p>
                    </div>
                    <div className="py-3 text-center">
                      <p className="text-[22px] font-bold text-accent tracking-tight leading-none">{winRate}%</p>
                      <p className="text-[10px] text-text-muted mt-1.5 font-medium uppercase tracking-wider">WR</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          <div key={activeTab} className="animate-fade-in space-y-6">

            {/* ── DISPO ── */}
            {activeTab === 'dispo' && <>
              <PushNotifications playerId={player.id} />

              {/* Toggle absent — masqué si la semaine est entièrement passée */}
              {(() => { const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7); return weekEnd > new Date() })() && <button
                onClick={handleToggleAbsent}
                disabled={absentLoading}
                className={[
                  'flex items-center gap-3 w-full rounded-2xl border px-4 py-3 transition-all duration-200 text-left',
                  isAbsent
                    ? 'bg-warning/[0.08] border-warning/20'
                    : 'bg-white/[0.03] border-white/[0.07]',
                ].join(' ')}
              >
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isAbsent ? 'text-warning' : 'text-text-secondary'}`}>
                    Absent cette semaine
                  </p>
                  {isAbsent && (
                    <p className="text-xs text-text-muted mt-0.5">Signalé à l'admin · appuie pour annuler</p>
                  )}
                </div>
                <div className={[
                  'relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
                  isAbsent ? 'bg-warning' : 'bg-border-subtle border border-border',
                ].join(' ')}>
                  <span className={[
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                    isAbsent ? 'left-[18px]' : 'left-0.5',
                  ].join(' ')} />
                </div>
              </button>}

              {!isAbsent && (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle>Mes disponibilités</CardTitle>
                        <p className="text-[13px] text-text-muted mt-1 leading-relaxed">
                          Coche les heures auxquelles tu peux être prêt à lancer un scrim.
                        </p>
                      </div>
                      <button
                        onClick={copyLastWeek}
                        className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors flex-shrink-0 mt-0.5"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M9 3H3a1 1 0 00-1 1v5a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.2"/>
                          <path d="M8 3V2a1 1 0 00-1-1H5a1 1 0 00-1 1v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                        Sem. passée
                      </button>
                    </div>
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
              )}

              <InstallPWAHint />
            </>}

            {/* ── SCRIMS ── */}
            {activeTab === 'scrims' && <>
              {countdown && (
                <div className="flex items-center gap-3 bg-accent/[0.08] border border-accent/20 rounded-2xl px-4 py-3 animate-fade-in">
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
                <CardHeader><CardTitle>Scrims</CardTitle></CardHeader>
                {loadingData ? (
                  <div className="space-y-3">
                    <SkeletonScrimCard />
                    <SkeletonScrimCard />
                  </div>
                ) : scrims.length === 0 ? (
                  <EmptyState
                    variant="scrims"
                    title="Aucun scrim cette semaine"
                    description="L'admin confirmera les scrims une fois les disponibilités reçues."
                  />
                ) : (
                  <div className="space-y-3">
                    {scrims.map(scrim => (
                      <div key={scrim.id} className="space-y-2">
                        <ScrimCard
                          scrim={scrim}
                          weekStart={weekStart}
                          onResultChange={(result, score, notes) => handleResultChange(scrim.id, result as 'win' | 'loss', score, notes ?? '')}
                        />
                        {isScrimToday(scrim, weekStart) && scrim.status === 'confirmed' && (
                          <ReadyCheckCard
                            scrimId={scrim.id}
                            opponentName={scrim.opponent_name}
                            startHour={scrim.start_hour}
                            playerId={player.id}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>}

            {/* ── STATS ── */}
            {activeTab === 'stats' && (() => {
              const linkedPlayers = teamPlayers.filter(p => p.riot_tier && p.riot_lp != null)
              const avgTotalLP = linkedPlayers.length > 0
                ? Math.round(linkedPlayers.reduce((sum, p) => sum + getTotalLP(p.riot_tier!, p.riot_rank, p.riot_lp!), 0) / linkedPlayers.length)
                : null

              return <>
              {linkedPlayers.length > 0 && avgTotalLP !== null && (() => {
                const avg = lpToTierInfo(avgTotalLP)
                return (
                  <Card>
                    <CardHeader><CardTitle>Elo Équipe</CardTitle></CardHeader>
                    <div className="space-y-3">
                      {(() => {
                        const tierLabel = avg.tier.charAt(0) + avg.tier.slice(1).toLowerCase()
                        return (
                          <div className="rounded-2xl overflow-hidden border border-white/[0.07]" style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.10) 0%, rgba(20,20,26,0.98) 60%)' }}>
                            <div className="flex items-center gap-4 px-5 py-4">
                              <RankBadge tier={avg.tier} rank={avg.rank} lp={avg.lp} size="lg" />
                              <div>
                                <p className="text-[20px] font-bold text-text-primary tracking-tight leading-none">
                                  {tierLabel}{avg.rank ? ` ${avg.rank}` : ''}
                                </p>
                                <p className="text-sm text-text-muted mt-1">{avg.lp} LP · {linkedPlayers.length}/{teamPlayers.length} liés</p>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                      <div className="space-y-1">
                        {linkedPlayers.map(p => {
                          const isUnranked = p.riot_tier === 'UNRANKED'
                          const gained = (!isUnranked && p.riot_lp_start != null)
                            ? getTotalLP(p.riot_tier!, p.riot_rank, p.riot_lp!) - p.riot_lp_start
                            : null
                          return (
                            <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                              <RankBadge tier={p.riot_tier!} rank={p.riot_rank} lp={p.riot_lp} size="sm" />
                              <span className={['text-[13px] font-semibold flex-1 min-w-0 truncate', p.id === player?.id ? 'text-accent' : 'text-text-primary'].join(' ')}>
                                {p.name}{p.id === player?.id ? ' (toi)' : ''}
                              </span>
                              {gained !== null && (
                                <span className={['text-xs font-bold flex-shrink-0 tabular-nums', gained >= 0 ? 'text-success' : 'text-danger'].join(' ')}>
                                  {gained >= 0 ? '+' : ''}{gained} LP
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </Card>
                )
              })()}

              <Card>
                <CardHeader><CardTitle>Statistiques de l'équipe</CardTitle></CardHeader>
                {!stats ? (
                  <SkeletonStats />
                ) : stats.total === 0 ? (
                  <EmptyState
                    variant="stats"
                    title="Pas encore de résultats"
                    description="Les stats apparaîtront après votre premier scrim joué."
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2.5 mb-5">
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-center">
                        <p className="text-[36px] font-bold text-success tracking-tight leading-none">{stats.wins}</p>
                        <p className="text-[11px] text-text-muted mt-2 font-medium uppercase tracking-wider">Victoires</p>
                      </div>
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-center">
                        <p className="text-[36px] font-bold text-danger tracking-tight leading-none">{stats.losses}</p>
                        <p className="text-[11px] text-text-muted mt-2 font-medium uppercase tracking-wider">Défaites</p>
                      </div>
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-center">
                        <p className="text-[36px] font-bold text-text-primary tracking-tight leading-none">{stats.total}</p>
                        <p className="text-[11px] text-text-muted mt-2 font-medium uppercase tracking-wider">Matchs</p>
                      </div>
                      <div className="rounded-2xl border border-accent/20 bg-accent/[0.06] p-4 text-center">
                        <p className="text-[36px] font-bold text-accent tracking-tight leading-none">
                          {Math.round((stats.wins / stats.total) * 100)}%
                        </p>
                        <p className="text-[11px] text-accent/60 mt-2 font-medium uppercase tracking-wider">Win rate</p>
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-white/[0.05] pt-4">
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
              </>
            })()}

          </div>
        </main>
      </PullToRefresh>

      <BottomNav tabs={TABS} active={activeTab} onChange={key => setActiveTab(key as PlayerTab)} />
    </div>
  )
}
