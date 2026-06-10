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
import {
  getCurrentWeekStart,
  formatWeekStart,
  formatScrimDate,
  formatLongDayWithDate,
  formatHour,
} from '@/lib/dates'
import { buildAvailabilityMatrix, getPerfectSlots } from '@/lib/availability'
import { Player, Availability, AvailabilitySubmission, Scrim, ScrimFormData } from '@/types'
import { APP_CONFIG } from '@/config/app'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [weekStart, setWeekStart] = useState<Date>(getCurrentWeekStart())
  const [players, setPlayers] = useState<Player[]>([])
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [submissions, setSubmissions] = useState<AvailabilitySubmission[]>([])
  const [scrims, setScrims] = useState<Scrim[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
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
  const [availHours, setAvailHours] = useState<number[]>([19, 20, 21, 22, 23])
  const [hoursSaving, setHoursSaving] = useState(false)

  const ws = formatWeekStart(weekStart)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [playersRes, availRes, subsRes, scrimsRes] = await Promise.all([
        fetch('/api/players'),
        fetch(`/api/availability?week_start=${ws}`),
        fetch('/api/availability', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ week_start: ws }),
        }),
        fetch(`/api/scrims?week_start=${ws}`),
      ])

      const [playersData, availData, subsData, scrimsData] = await Promise.all([
        playersRes.json(),
        availRes.json(),
        subsRes.json(),
        scrimsRes.json(),
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

  const matrix = buildAvailabilityMatrix(availabilities, players)
  const perfectSlots = getPerfectSlots(matrix)

  async function handleCreateScrim(data: ScrimFormData) {
    const res = await fetch('/api/scrims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setScrimModal({ open: false })
      await loadData()
    }
  }

  async function handleUpdateScrim(id: string, data: ScrimFormData) {
    const res = await fetch(`/api/scrims/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setScrimModal({ open: false })
      await loadData()
    }
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

  const [relanceCopied, setRelanceCopied] = useState(false)

  function copyRelanceMessage() {
    const missing = players.filter(p => !submissions.some(s => s.player_id === p.id))
    if (missing.length === 0) {
      navigator.clipboard.writeText('✅ Tous les joueurs ont renseigné leurs disponibilités !')
    } else {
      const names = missing.map(p => p.name).join(', ')
      navigator.clipboard.writeText(`⚠️ **Relance disponibilités** — Les joueurs suivants n'ont pas encore répondu cette semaine :\n${names}\n\nMerci de renseigner vos dispos dès que possible !`)
    }
    setRelanceCopied(true)
    setTimeout(() => setRelanceCopied(false), 2000)
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
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-surface/80 backdrop-blur-sm sticky top-0 z-10 pt-safe">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Push notifications */}
            <PushNotifications />

            {/* Envoyer une notification personnalisée */}
            <Card>
              <CardHeader>
                <CardTitle>Envoyer une notification</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Titre (ex: Scrim annulé)"
                  value={notifForm.title}
                  onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Message (optionnel)"
                  value={notifForm.body}
                  onChange={e => setNotifForm(f => ({ ...f, body: e.target.value }))}
                  className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
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

            {/* Créneaux parfaits */}
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
                  title="Aucun créneau avec 5/5 joueurs disponibles"
                  description="Attendez que tous les joueurs renseignent leurs disponibilités."
                />
              ) : (
                <div className="space-y-2">
                  {perfectSlots.map(slot => (
                    <div
                      key={`${slot.day_of_week}-${slot.start_hour}`}
                      className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-success flex-shrink-0" />
                        <span className="text-sm font-medium text-text-primary">
                          {formatLongDayWithDate(weekStart, slot.day_of_week)} · {formatHour(slot.start_hour)}
                        </span>
                        <Badge variant="success">{APP_CONFIG.expectedPlayers}/{APP_CONFIG.expectedPlayers}</Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          setScrimModal({
                            open: true,
                            day: slot.day_of_week,
                            hour: slot.start_hour,
                          })
                        }
                      >
                        Créer un scrim
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Scrims confirmés */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle>Scrims confirmés</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={copied ? 'success' : 'secondary'}
                      onClick={copyDiscordMessage}
                    >
                      <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier message Discord'}</span>
                      <span className="sm:hidden">{copied ? 'Copié !' : 'Discord'}</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setScrimModal({ open: true })}
                    >
                      <span className="hidden sm:inline">+ Nouveau scrim</span>
                      <span className="sm:hidden">+ Scrim</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {scrims.length === 0 ? (
                <EmptyState
                  title="Aucun scrim confirmé cette semaine"
                  description="Créez un scrim depuis un créneau parfait ou manuellement."
                />
              ) : (
                <div className="space-y-3">
                  {scrims.map(scrim => (
                    <ScrimCard
                      key={scrim.id}
                      scrim={scrim}
                      weekStart={weekStart}
                      isAdmin
                      onEdit={() => setScrimModal({ open: true, scrim })}
                      onDelete={() => setDeleteConfirm(scrim.id)}
                      onResultChange={(result, score, notes) => handleResultChange(scrim.id, result as 'win' | 'loss', score, notes ?? '')}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* Réponses joueurs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle>Réponses</CardTitle>
                  <Button size="sm" variant={relanceCopied ? 'success' : 'secondary'} onClick={copyRelanceMessage}>
                    <span className="hidden sm:inline">{relanceCopied ? 'Copié !' : 'Relance Discord'}</span>
                    <span className="sm:hidden">{relanceCopied ? 'Copié !' : 'Relance'}</span>
                  </Button>
                </div>
              </CardHeader>
              <PlayerStatusList players={players} submissions={submissions} />
            </Card>

            {/* Stats W/L */}
            {stats && stats.total > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Historique des résultats</CardTitle>
                </CardHeader>
                <div className="flex items-center gap-6 flex-wrap">
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
                      {stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0}%
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">Win rate</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Gestion des joueurs */}
            <Card>
              <CardHeader><CardTitle>Joueurs</CardTitle></CardHeader>
              <div className="space-y-2">
                {players.map(player => (
                  <div key={player.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={playerEdits[player.id] ?? player.name}
                      onChange={e => setPlayerEdits(prev => ({ ...prev, [player.id]: e.target.value }))}
                      className="flex-1 rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={playerSaving === player.id}
                      disabled={playerEdits[player.id] === player.name || playerSaving === player.id}
                      onClick={() => handleSavePlayerName(player.id)}
                    >
                      Sauvegarder
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Heures disponibles */}
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

            {/* Matrice complète */}
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
                onCreateScrim={(day, hour) =>
                  setScrimModal({ open: true, day, hour })
                }
              />
            </Card>
          </>
        )}
      </main>

      {/* Scrim create/edit modal */}
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

      {/* Delete confirm modal */}
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
    </div>
  )
}
