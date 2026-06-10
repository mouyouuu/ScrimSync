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

      if (Array.isArray(playersData)) setPlayers(playersData)
      if (Array.isArray(availData)) setAvailabilities(availData)
      if (Array.isArray(subsData)) setSubmissions(subsData)
      if (Array.isArray(scrimsData)) setScrims(scrimsData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [ws])

  useEffect(() => {
    loadData()
  }, [loadData])

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

  async function handleResultChange(scrimId: string, result: 'win' | 'loss', score: string) {
    await fetch(`/api/scrims/${scrimId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...scrims.find(s => s.id === scrimId), result, score }),
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
                      onResultChange={(result, score) => handleResultChange(scrim.id, result as 'win' | 'loss', score)}
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
