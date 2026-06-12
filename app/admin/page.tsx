'use client'

import { useState, useEffect, useCallback } from 'react'
import { Logo } from '@/components/Logo'
import { WeekSelector } from '@/components/availability/WeekSelector'
import { PlayerStatusList } from '@/components/availability/PlayerStatusList'
import { AdminAvailabilityMatrix } from '@/components/availability/AdminAvailabilityMatrix'
import { ScrimCard } from '@/components/scrims/ScrimCard'
import { ScrimForm } from '@/components/scrims/ScrimForm'
import { Modal } from '@/components/ui/Modal'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PushNotifications } from '@/components/pwa/PushNotifications'
import { PullToRefresh } from '@/components/pwa/PullToRefresh'
import { BottomNav } from '@/components/ui/BottomNav'
import { SkeletonAdminContent, SkeletonStats } from '@/components/ui/Skeleton'
import {
  getCurrentWeekStart,
  formatWeekStart,
  formatScrimDate,
  formatLongDayWithDate,
  formatHour,
} from '@/lib/dates'
import { buildAvailabilityMatrix, getPerfectSlots } from '@/lib/availability'
import { Player, Availability, AvailabilitySubmission, Scrim, ScrimFormData } from '@/types'
import { ReadyCheckCard } from '@/components/scrims/ReadyCheckCard'
import { RankBadge, getTotalLP } from '@/components/lol/RankBadge'

function lpToTierInfo(totalLP: number): { tier: string; rank: string | null; lp: number } {
  if (totalLP >= 3600) return { tier: 'CHALLENGER', rank: null, lp: totalLP - 3600 }
  if (totalLP >= 3200) return { tier: 'GRANDMASTER', rank: null, lp: totalLP - 3200 }
  if (totalLP >= 2800) return { tier: 'MASTER', rank: null, lp: totalLP - 2800 }
  const brackets: Array<[number, string]> = [
    [2400, 'DIAMOND'], [2000, 'EMERALD'], [1600, 'PLATINUM'],
    [1200, 'GOLD'], [800, 'SILVER'], [400, 'BRONZE'], [0, 'IRON'],
  ]
  for (const [base, tier] of brackets) {
    if (totalLP >= base) {
      const rem = totalLP - base
      const rank = rem >= 300 ? 'I' : rem >= 200 ? 'II' : rem >= 100 ? 'III' : 'IV'
      return { tier, rank, lp: rem % 100 }
    }
  }
  return { tier: 'IRON', rank: 'IV', lp: totalLP }
}

function isScrimToday(scrim: Scrim, wStart: Date): boolean {
  const d = new Date(wStart)
  d.setDate(d.getDate() + (scrim.day_of_week - 1))
  const today = new Date()
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
}
import { APP_CONFIG } from '@/config/app'
import { useRouter } from 'next/navigation'

type AdminTab = 'scrims' | 'equipe' | 'stats' | 'reglages'

const TABS = [
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
    key: 'equipe',
    label: 'Équipe',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 17c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="15" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M18 17c0-2.209-1.343-3.5-3-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
  {
    key: 'reglages',
    label: 'Réglages',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 3.5V5M10 15v1.5M3.5 10H5M15 10h1.5M5.4 5.4l1.07 1.07M13.54 13.54l1.07 1.07M14.6 5.4l-1.07 1.07M6.46 13.54l-1.07 1.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function AdminPage() {
  const router = useRouter()
  const [weekStart, setWeekStart] = useState<Date>(getCurrentWeekStart())
  const [players, setPlayers] = useState<Player[]>([])
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [submissions, setSubmissions] = useState<AvailabilitySubmission[]>([])
  const [scrims, setScrims] = useState<Scrim[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<AdminTab>('scrims')

  const [scrimModal, setScrimModal] = useState<{
    open: boolean
    day?: number
    hour?: number
    scrim?: Scrim
  }>({ open: false })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [notifForm, setNotifForm] = useState({ title: '', body: '' })
  const [notifSending, setNotifSending] = useState(false)
  const [notifSent, setNotifSent] = useState(false)
  const [stats, setStats] = useState<{ wins: number; losses: number; total: number } | null>(null)
  const [playerEdits, setPlayerEdits] = useState<Record<string, string>>({})
  const [playerSaving, setPlayerSaving] = useState<string | null>(null)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerCreating, setNewPlayerCreating] = useState(false)
  const [newPlayerLink, setNewPlayerLink] = useState<string | null>(null)
  const [deletePlayerConfirm, setDeletePlayerConfirm] = useState<string | null>(null)
  const [availHours, setAvailHours] = useState<number[]>([19, 20, 21, 22, 23])
  const [hoursSaving, setHoursSaving] = useState(false)
  const [relanceSending, setRelanceSending] = useState(false)
  const [relanceSent, setRelanceSent] = useState(false)
  const [absences, setAbsences] = useState<string[]>([])
  const [riotInputs, setRiotInputs] = useState<Record<string, string>>({})
  const [riotLinking, setRiotLinking] = useState<Record<string, boolean>>({})
  const [riotErrors, setRiotErrors] = useState<Record<string, string>>({})
  const [riotRefreshing, setRiotRefreshing] = useState(false)

  const ws = formatWeekStart(weekStart)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [playersRes, availRes, subsRes, scrimsRes, absencesRes] = await Promise.all([
        fetch('/api/players'),
        fetch(`/api/availability?week_start=${ws}`),
        fetch('/api/availability', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ week_start: ws }),
        }),
        fetch(`/api/scrims?week_start=${ws}`),
        fetch(`/api/availability/absent?week_start=${ws}`),
      ])

      const [playersData, availData, subsData, scrimsData, absencesData] = await Promise.all([
        playersRes.json(),
        availRes.json(),
        subsRes.json(),
        scrimsRes.json(),
        absencesRes.json(),
      ])

      if (Array.isArray(playersData)) {
        setPlayers(playersData)
        const edits: Record<string, string> = {}
        playersData.forEach((p: Player) => { edits[p.id] = p.name })
        setPlayerEdits(edits)
      }
      if (Array.isArray(availData)) setAvailabilities(availData)
      if (Array.isArray(subsData)) setSubmissions(subsData)
      if (Array.isArray(scrimsData)) setScrims(scrimsData)
      if (Array.isArray(absencesData)) setAbsences(absencesData.map((a: { player_id: string }) => a.player_id))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [ws])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => setStats(d)).catch(() => {})
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (Array.isArray(d.available_hours)) setAvailHours(d.available_hours)
    }).catch(() => {})
  }, [])

  const teamPlayers = players.filter(p => p.role !== 'staff')
  const matrix = buildAvailabilityMatrix(availabilities, teamPlayers)
  const perfectSlots = getPerfectSlots(matrix)

  async function handleCreateScrim(data: ScrimFormData) {
    const res = await fetch('/api/scrims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) { setScrimModal({ open: false }); await loadData() }
  }

  async function handleUpdateScrim(id: string, data: ScrimFormData) {
    const res = await fetch(`/api/scrims/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) { setScrimModal({ open: false }); await loadData() }
  }

  async function handleDeleteScrim(id: string) {
    await fetch(`/api/scrims/${id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    await loadData()
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  function copyDiscordMessage() {
    if (scrims.length === 0) {
      navigator.clipboard.writeText('Aucun scrim confirmé cette semaine.')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return
    }
    const lines = ['📅 **Scrims de la semaine**\n']
    scrims.forEach(scrim => {
      const statusEmoji = scrim.status === 'cancelled' ? '❌' : scrim.status === 'pending' ? '⏳' : '✅'
      lines.push(`${statusEmoji} **${formatScrimDate(weekStart, scrim.day_of_week, scrim.start_hour)}** — vs ${scrim.opponent_name}`)
      lines.push(`OP.GG : ${scrim.opponent_opgg_url}`)
      if (scrim.notes) lines.push(`Note : ${scrim.notes}`)
      lines.push('')
    })
    navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRelanceAbsents() {
    const missing = players.filter(p =>
      !submissions.some(s => s.player_id === p.id) && !absences.includes(p.id)
    )
    if (missing.length === 0) return
    setRelanceSending(true)
    await fetch('/api/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '📅 Disponibilités manquantes',
        body: 'Renseigne tes dispos pour cette semaine !',
        url: '/',
        player_ids: missing.map(p => p.id),
      }),
    })
    setRelanceSending(false)
    setRelanceSent(true)
    setTimeout(() => setRelanceSent(false), 3000)
  }

  async function handleCreatePlayer() {
    if (!newPlayerName.trim()) return
    setNewPlayerCreating(true)
    const res = await fetch('/api/players', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPlayerName.trim() }),
    })
    const data = await res.json()
    if (data.token) {
      setNewPlayerLink(`${window.location.origin}/player/${data.token}`)
      setNewPlayerName('')
      await loadData()
    }
    setNewPlayerCreating(false)
  }

  async function handleDeletePlayer(id: string) {
    await fetch(`/api/players/${id}`, { method: 'DELETE' })
    setDeletePlayerConfirm(null)
    await loadData()
  }

  async function handleSavePlayerName(id: string) {
    const name = playerEdits[id]?.trim()
    if (!name) return
    setPlayerSaving(id)
    await fetch(`/api/players/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setPlayerSaving(null)
    await loadData()
  }

  async function handleToggleHour(hour: number) {
    setAvailHours(prev =>
      prev.includes(hour) ? prev.filter(h => h !== hour) : [...prev, hour].sort((a, b) => a - b)
    )
  }

  async function handleSaveHours() {
    setHoursSaving(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available_hours: availHours }),
    })
    setHoursSaving(false)
  }

  async function handleSendNotif() {
    if (!notifForm.title.trim()) return
    setNotifSending(true)
    await fetch('/api/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: notifForm.title, body: notifForm.body, url: '/' }),
    })
    setNotifSending(false)
    setNotifSent(true)
    setNotifForm({ title: '', body: '' })
    setTimeout(() => setNotifSent(false), 3000)
  }

  async function handleLinkRiot(playerId: string) {
    const input = (riotInputs[playerId] ?? '').trim()
    const hashIdx = input.indexOf('#')
    if (hashIdx < 1 || hashIdx === input.length - 1) {
      setRiotErrors(prev => ({ ...prev, [playerId]: 'Format invalide — ex: Pseudo#TAG' }))
      return
    }
    const gameName = input.slice(0, hashIdx).trim()
    const tagLine = input.slice(hashIdx + 1).trim()
    setRiotLinking(prev => ({ ...prev, [playerId]: true }))
    setRiotErrors(prev => ({ ...prev, [playerId]: '' }))
    const res = await fetch('/api/riot/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId, game_name: gameName, tag_line: tagLine }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setRiotErrors(prev => ({ ...prev, [playerId]: data.error ?? 'Erreur Riot API' }))
    } else {
      setRiotInputs(prev => ({ ...prev, [playerId]: '' }))
      await loadData()
    }
    setRiotLinking(prev => ({ ...prev, [playerId]: false }))
  }

  async function handleUnlinkRiot(playerId: string) {
    await fetch('/api/riot/link', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId }),
    })
    await loadData()
  }

  async function handleRefreshRanks() {
    setRiotRefreshing(true)
    await fetch('/api/riot/refresh', { method: 'POST' })
    await loadData()
    setRiotRefreshing(false)
  }

  async function handleResultChange(scrimId: string, result: 'win' | 'loss', score: string, notes: string) {
    await fetch(`/api/scrims/${scrimId}/result`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result, score, notes }),
    })
    await loadData()
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 pt-safe" style={{ background: 'rgba(9,9,11,0.82)', backdropFilter: 'blur(20px) saturate(1.4)', WebkitBackdropFilter: 'blur(20px) saturate(1.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <WeekSelector weekStart={weekStart} onChange={setWeekStart} />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-danger transition-colors px-2 py-1.5 rounded-lg hover:bg-danger/10"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9.5 9.5L13 7m0 0L9.5 4.5M13 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <PullToRefresh onRefresh={loadData}>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-5">
          {loading ? (
            <SkeletonAdminContent />
          ) : (
            <div key={activeTab} className="animate-fade-in space-y-6">

              {/* ── SCRIMS ── */}
              {activeTab === 'scrims' && <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Créneaux parfaits</CardTitle>
                      <Badge variant={perfectSlots.length > 0 ? 'success' : 'muted'}>
                        {perfectSlots.length} créneau{perfectSlots.length !== 1 ? 'x' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  {perfectSlots.length === 0 ? (
                    <EmptyState
                      variant="team"
                      title="Aucun créneau 5/5 pour l'instant"
                      description="Attendez que tous les joueurs renseignent leurs disponibilités."
                    />
                  ) : (
                    <div className="space-y-2">
                      {perfectSlots.map(slot => (
                        <div
                          key={`${slot.day_of_week}-${slot.start_hour}`}
                          className="flex items-center gap-3 rounded-2xl border border-success/15 bg-success/[0.04] px-4 py-3"
                        >
                          <span className="h-2 w-2 rounded-full bg-success flex-shrink-0" />
                          <p className="flex-1 min-w-0 text-sm font-medium text-text-primary truncate">
                            {formatLongDayWithDate(weekStart, slot.day_of_week)} · {formatHour(slot.start_hour)}
                          </p>
                          <Badge variant="success" className="flex-shrink-0">{APP_CONFIG.expectedPlayers}/{APP_CONFIG.expectedPlayers}</Badge>
                          <Button
                            size="sm"
                            className="flex-shrink-0 whitespace-nowrap"
                            onClick={() => setScrimModal({ open: true, day: slot.day_of_week, hour: slot.start_hour })}
                          >
                            Créer un scrim
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle>Scrims</CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant={copied ? 'success' : 'secondary'} onClick={copyDiscordMessage}>
                          <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier message Discord'}</span>
                          <span className="sm:hidden">{copied ? 'Copié !' : 'Discord'}</span>
                        </Button>
                        <Button size="sm" onClick={() => setScrimModal({ open: true })}>
                          <span className="hidden sm:inline">+ Nouveau scrim</span>
                          <span className="sm:hidden">+ Scrim</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {scrims.length === 0 ? (
                    <EmptyState
                      variant="scrims"
                      title="Aucun scrim cette semaine"
                      description="Créez un scrim depuis un créneau parfait ou manuellement."
                    />
                  ) : (
                    <div className="space-y-3">
                      {scrims.map(scrim => (
                        <div key={scrim.id} className="space-y-2">
                          <ScrimCard
                            scrim={scrim}
                            weekStart={weekStart}
                            isAdmin
                            onEdit={() => setScrimModal({ open: true, scrim })}
                            onDelete={() => setDeleteConfirm(scrim.id)}
                            onResultChange={(result, score, notes) => handleResultChange(scrim.id, result as 'win' | 'loss', score, notes ?? '')}
                          />
                          {isScrimToday(scrim, weekStart) && scrim.status === 'confirmed' && (
                            <ReadyCheckCard
                              scrimId={scrim.id}
                              opponentName={scrim.opponent_name}
                              startHour={scrim.start_hour}
                              isAdmin
                              players={players}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>}

              {/* ── ÉQUIPE ── */}
              {activeTab === 'equipe' && (() => {
                const linkedPlayers = teamPlayers.filter(p => p.riot_tier && p.riot_lp != null)
                const avgTotalLP = linkedPlayers.length > 0
                  ? Math.round(linkedPlayers.reduce((sum, p) => sum + getTotalLP(p.riot_tier!, p.riot_rank, p.riot_lp!), 0) / linkedPlayers.length)
                  : null
                const totalLPGained = linkedPlayers
                  .filter(p => p.riot_lp_start != null)
                  .reduce((sum, p) => sum + (getTotalLP(p.riot_tier!, p.riot_rank, p.riot_lp!) - p.riot_lp_start!), 0)
                return <>
                  {/* Elo Équipe */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Elo Équipe</CardTitle>
                        <Button size="sm" variant="secondary" loading={riotRefreshing} onClick={handleRefreshRanks}>
                          {riotRefreshing ? 'Màj...' : (
                            <span className="flex items-center gap-1.5">
                              <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
                                <path d="M11.5 2A5.5 5.5 0 106.5 12M11.5 2v3.5H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Actualiser
                            </span>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    {linkedPlayers.length === 0 ? (
                      <p className="text-sm text-text-muted">Liez des comptes LoL ci-dessous pour voir les stats d'équipe.</p>
                    ) : (
                      <div className="space-y-3">
                        {/* Hero Elo moyen */}
                        {avgTotalLP !== null && (() => {
                          const avg = lpToTierInfo(avgTotalLP)
                          const tierLabel = avg.tier.charAt(0) + avg.tier.slice(1).toLowerCase()
                          return (
                            <div className="rounded-2xl overflow-hidden border border-white/[0.07]" style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.10) 0%, rgba(30,30,38,0.95) 60%)' }}>
                              <div className="flex items-center gap-4 px-5 py-5">
                                <RankBadge tier={avg.tier} rank={avg.rank} lp={avg.lp} size="lg" />
                                <div>
                                  <p className="text-[22px] font-bold text-text-primary tracking-tight leading-none">
                                    {tierLabel}{avg.rank ? ` ${avg.rank}` : ''}
                                  </p>
                                  <p className="text-sm text-text-muted mt-1">{avg.lp} LP &middot; {linkedPlayers.length}/{teamPlayers.length} liés</p>
                                </div>
                              </div>
                              <div className="border-t border-white/[0.06] px-5 py-3 flex items-center justify-between">
                                <p className="text-xs font-medium text-text-muted">Progression cette semaine</p>
                                <p className={['text-base font-bold tracking-tight', totalLPGained >= 0 ? 'text-success' : 'text-danger'].join(' ')}>
                                  {totalLPGained >= 0 ? '+' : ''}{totalLPGained} LP
                                </p>
                              </div>
                            </div>
                          )
                        })()}
                        {/* Liste joueurs */}
                        <div className="space-y-1.5 pt-1">
                          {linkedPlayers.map(p => {
                            const isUnranked = p.riot_tier === 'UNRANKED'
                            const gained = (!isUnranked && p.riot_lp_start != null)
                              ? getTotalLP(p.riot_tier!, p.riot_rank, p.riot_lp!) - p.riot_lp_start
                              : null
                            return (
                              <div key={p.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                                <RankBadge tier={p.riot_tier!} rank={p.riot_rank} lp={p.riot_lp} size="sm" />
                                <span className="text-[13px] font-semibold text-text-primary flex-1 min-w-0 truncate">{p.name}</span>
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
                    )}
                  </Card>

                  {/* Comptes LoL */}
                  <Card>
                    <CardHeader><CardTitle>Comptes LoL</CardTitle></CardHeader>
                    <div className="space-y-2">
                      {teamPlayers.map(player => {
                        const isLinked = !!(player.riot_game_name && player.riot_tier)
                        const isUnranked = player.riot_tier === 'UNRANKED'
                        return (
                          <div key={player.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                            {isLinked ? (
                              <div className="flex items-center gap-3">
                                <RankBadge
                                  tier={player.riot_tier!}
                                  rank={player.riot_rank}
                                  lp={player.riot_lp}
                                  size="md"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-[14px] font-semibold text-text-primary truncate">{player.name}</p>
                                      <p className="text-[11px] text-text-muted mt-0.5 truncate">{player.riot_game_name}#{player.riot_tag_line}</p>
                                      {player.riot_wins != null && player.riot_losses != null && (
                                        <p className="text-[11px] text-text-disabled mt-0.5">
                                          {player.riot_wins}W {player.riot_losses}L &middot; {Math.round(player.riot_wins / Math.max(1, player.riot_wins + player.riot_losses) * 100)}% WR
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                      {!isUnranked && player.riot_lp_start != null && (() => {
                                        const diff = getTotalLP(player.riot_tier!, player.riot_rank, player.riot_lp!) - player.riot_lp_start
                                        return (
                                          <span className={['text-xs font-bold tabular-nums', diff >= 0 ? 'text-success' : 'text-danger'].join(' ')}>
                                            {diff >= 0 ? '+' : ''}{diff} LP
                                          </span>
                                        )
                                      })()}
                                      <button
                                        onClick={() => handleUnlinkRiot(player.id)}
                                        className="text-[11px] text-text-disabled hover:text-danger transition-colors"
                                      >
                                        Délier
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                <p className="text-[13px] font-semibold text-text-primary">{player.name}</p>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Pseudo#TAG"
                                    value={riotInputs[player.id] ?? ''}
                                    onChange={e => setRiotInputs(prev => ({ ...prev, [player.id]: e.target.value }))}
                                    onKeyDown={e => e.key === 'Enter' && handleLinkRiot(player.id)}
                                    className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                                  />
                                  <Button
                                    size="sm"
                                    loading={riotLinking[player.id]}
                                    disabled={!(riotInputs[player.id] ?? '').includes('#') || riotLinking[player.id]}
                                    onClick={() => handleLinkRiot(player.id)}
                                  >
                                    Lier
                                  </Button>
                                </div>
                                {riotErrors[player.id] && (
                                  <p className="text-xs text-danger">{riotErrors[player.id]}</p>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </Card>

                  {/* Réponses */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle>Réponses</CardTitle>
                        <Button
                          size="sm"
                          variant={relanceSent ? 'success' : 'secondary'}
                          loading={relanceSending}
                          disabled={relanceSending || players.every(p => submissions.some(s => s.player_id === p.id))}
                          onClick={handleRelanceAbsents}
                        >
                          {relanceSent ? 'Envoyé !' : 'Relance'}
                        </Button>
                      </div>
                    </CardHeader>
                    <PlayerStatusList players={teamPlayers} submissions={submissions} absenceIds={absences} />
                  </Card>

                  {/* Disponibilités */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-4 flex-wrap">
                        <CardTitle>Disponibilités</CardTitle>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded bg-success/30 border border-success/40" />
                            5/5
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded bg-warning/20 border border-warning/30" />
                            4/5
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded bg-bg-elevated border border-border-subtle" />
                            &lt; 4
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <AdminAvailabilityMatrix
                      matrix={matrix}
                      weekStart={weekStart}
                      onCreateScrim={(day, hour) => setScrimModal({ open: true, day, hour })}
                    />
                  </Card>
                </>
              })()}

              {/* ── STATS ── */}
              {activeTab === 'stats' && (
                <Card>
                  <CardHeader><CardTitle>Historique des résultats</CardTitle></CardHeader>
                  {!stats ? (
                    <SkeletonStats />
                  ) : stats.total === 0 ? (
                    <EmptyState
                      variant="stats"
                      title="Pas encore de résultats"
                      description="Les stats apparaîtront après votre premier scrim joué."
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
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
                  )}
                </Card>
              )}

              {/* ── RÉGLAGES ── */}
              {activeTab === 'reglages' && <>
                <PushNotifications />

                <Card>
                  <CardHeader><CardTitle>Envoyer une notification</CardTitle></CardHeader>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Titre (ex: Scrim annulé)"
                      value={notifForm.title}
                      onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                    />
                    <input
                      type="text"
                      placeholder="Message (optionnel)"
                      value={notifForm.body}
                      onChange={e => setNotifForm(f => ({ ...f, body: e.target.value }))}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                    />
                    <Button
                      size="sm"
                      onClick={handleSendNotif}
                      loading={notifSending}
                      disabled={!notifForm.title.trim() || notifSending}
                      variant={notifSent ? 'success' : 'primary'}
                    >
                      {notifSent ? '✓ Envoyé !' : 'Envoyer à tous'}
                    </Button>
                  </div>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Joueurs</CardTitle></CardHeader>
                  <div className="divide-y divide-white/[0.04]">
                    {players.map(player => (
                      <div key={player.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="h-8 w-8 rounded-full bg-accent/[0.12] border border-accent/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-accent">{player.name[0]?.toUpperCase()}</span>
                        </div>
                        <input
                          type="text"
                          value={playerEdits[player.id] ?? player.name}
                          onChange={e => setPlayerEdits(prev => ({ ...prev, [player.id]: e.target.value }))}
                          className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-text-primary focus:outline-none border-b border-transparent focus:border-accent/40 pb-0.5 transition-colors"
                        />
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {playerEdits[player.id] !== undefined && playerEdits[player.id] !== player.name && (
                            <Button
                              size="sm"
                              variant="secondary"
                              loading={playerSaving === player.id}
                              onClick={() => handleSavePlayerName(player.id)}
                            >
                              ✓
                            </Button>
                          )}
                          <button
                            onClick={async () => {
                              const newRole = player.role === 'staff' ? 'player' : 'staff'
                              await fetch(`/api/players/${player.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ role: newRole }),
                              })
                              await loadData()
                            }}
                            className={[
                              'px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex-shrink-0 border',
                              player.role === 'staff'
                                ? 'bg-warning/10 text-warning border-warning/25'
                                : 'bg-success/10 text-success border-success/25',
                            ].join(' ')}
                          >
                            {player.role === 'staff' ? 'Staff' : 'Joueur'}
                          </button>
                          <button
                            onClick={() => setDeletePlayerConfirm(player.id)}
                            className="p-1.5 rounded-lg text-text-disabled hover:text-danger hover:bg-danger/10 transition-all"
                          >
                            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                              <path d="M2 4h11M5 4V2.5A1.5 1.5 0 016.5 1h2A1.5 1.5 0 0110 2.5V4M6 7v4M9 7v4M3 4l.8 8.5A1 1 0 004.8 13.5h5.4a1 1 0 001-.995L12 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/[0.05] space-y-3">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Ajouter un joueur</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nom du joueur"
                        value={newPlayerName}
                        onChange={e => setNewPlayerName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCreatePlayer()}
                        className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                      />
                      <Button
                        size="sm"
                        loading={newPlayerCreating}
                        disabled={!newPlayerName.trim() || newPlayerCreating}
                        onClick={handleCreatePlayer}
                      >
                        Créer
                      </Button>
                    </div>
                    {newPlayerLink && (
                      <div className="flex items-center gap-2 bg-success/8 border border-success/20 rounded-lg px-3 py-2 animate-fade-in">
                        <span className="text-xs text-success font-medium flex-1 truncate">{newPlayerLink}</span>
                        <button
                          onClick={() => { navigator.clipboard.writeText(newPlayerLink); setNewPlayerLink(null) }}
                          className="text-xs text-success font-semibold flex-shrink-0 hover:opacity-70 transition-opacity"
                        >
                          Copier
                        </button>
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Heures disponibles</CardTitle></CardHeader>
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {[17, 18, 19, 20, 21, 22, 23].map(h => (
                      <button
                        key={h}
                        onClick={() => handleToggleHour(h)}
                        className={[
                          'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                          availHours.includes(h)
                            ? 'bg-accent/15 border-accent/40 text-accent'
                            : 'bg-bg-elevated border-border-subtle text-text-muted hover:border-border',
                        ].join(' ')}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                  <Button size="sm" loading={hoursSaving} onClick={handleSaveHours}>
                    {hoursSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </Card>
              </>}

            </div>
          )}
        </main>
      </PullToRefresh>

      <BottomNav tabs={TABS} active={activeTab} onChange={key => setActiveTab(key as AdminTab)} />

      <Modal
        open={scrimModal.open}
        onClose={() => setScrimModal({ open: false })}
        title={scrimModal.scrim ? 'Modifier le scrim' : 'Créer un scrim'}
      >
        <ScrimForm
          weekStart={ws}
          initialDay={scrimModal.day}
          initialHour={scrimModal.hour}
          initialData={scrimModal.scrim}
          onSubmit={async data => {
            if (scrimModal.scrim) {
              await handleUpdateScrim(scrimModal.scrim.id, data)
            } else {
              await handleCreateScrim(data)
            }
          }}
          onCancel={() => setScrimModal({ open: false })}
        />
      </Modal>

      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Supprimer le scrim"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-5">
          Cette action est irréversible. Voulez-vous vraiment supprimer ce scrim ?
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirm && handleDeleteScrim(deleteConfirm)}
            className="flex-1"
          >
            Supprimer
          </Button>
        </div>
      </Modal>

      <Modal
        open={deletePlayerConfirm !== null}
        onClose={() => setDeletePlayerConfirm(null)}
        title="Supprimer le joueur"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-5">
          Cette action supprimera le joueur et toutes ses données. Irréversible.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setDeletePlayerConfirm(null)} className="flex-1">
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={() => deletePlayerConfirm && handleDeletePlayer(deletePlayerConfirm)}
            className="flex-1"
          >
            Supprimer
          </Button>
        </div>
      </Modal>
    </div>
  )
}
