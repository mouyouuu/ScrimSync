'use client'

import { useState, useEffect } from 'react'
import { Player } from '@/types'

type RCStatus = 'confirmed' | 'late' | 'declined'

interface Confirmation {
  player_id: string
  status: RCStatus
}

interface ReadyCheckCardProps {
  scrimId: string
  opponentName: string
  startHour: number
  playerId?: string
  players?: Player[]
  isAdmin?: boolean
}

export function ReadyCheckCard({ scrimId, opponentName, startHour, playerId, players, isAdmin }: ReadyCheckCardProps) {
  const [confirmations, setConfirmations] = useState<Confirmation[]>([])
  const [totalPlayers, setTotalPlayers] = useState(5)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/scrims/${scrimId}/confirmation`)
      .then(r => r.json())
      .then(data => {
        setConfirmations(data.confirmations ?? [])
        setTotalPlayers(data.total_players ?? 5)
      })
  }, [scrimId])

  const myStatus = playerId ? (confirmations.find(c => c.player_id === playerId)?.status ?? null) : null
  const confirmed = confirmations.filter(c => c.status === 'confirmed').length
  const late = confirmations.filter(c => c.status === 'late').length
  const declined = confirmations.filter(c => c.status === 'declined').length

  async function handleConfirm(status: RCStatus) {
    if (!playerId) return
    setLoading(true)
    await fetch(`/api/scrims/${scrimId}/confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId, status }),
    })
    setConfirmations(prev => [...prev.filter(c => c.player_id !== playerId), { player_id: playerId, status }])
    setLoading(false)
  }

  /* ── VUE ADMIN ── */
  if (isAdmin) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">Ready Check</p>
          <div className="flex items-center gap-2 text-xs font-medium">
            {confirmed > 0 && <span className="text-success">{confirmed} ✓</span>}
            {late > 0 && <span className="text-warning">{late} ⏰</span>}
            {declined > 0 && <span className="text-danger">{declined} ✗</span>}
            <span className="text-text-muted">{confirmations.length}/{totalPlayers}</span>
          </div>
        </div>
        {players && players.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {players.map(p => {
              const c = confirmations.find(x => x.player_id === p.id)
              return (
                <span
                  key={p.id}
                  className={[
                    'px-2 py-0.5 rounded-full text-xs font-medium border',
                    c?.status === 'confirmed' ? 'bg-success/10 border-success/30 text-success' :
                    c?.status === 'late'      ? 'bg-warning/10 border-warning/30 text-warning' :
                    c?.status === 'declined'  ? 'bg-danger/10  border-danger/30  text-danger'  :
                    'bg-bg-elevated border-border-subtle text-text-muted',
                  ].join(' ')}
                >
                  {c?.status === 'confirmed' ? '✓ ' : c?.status === 'late' ? '⏰ ' : c?.status === 'declined' ? '✗ ' : '– '}
                  {p.name}
                </span>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  /* ── VUE JOUEUR ── */
  return (
    <div className="bg-accent/[0.05] border border-accent/20 rounded-2xl p-4 space-y-3 animate-fade-in">
      <div>
        <p className="text-[11px] font-semibold text-accent uppercase tracking-wide mb-1">Ready Check</p>
        <p className="text-sm font-semibold text-text-primary">
          Scrim ce soir à {startHour}h vs {opponentName}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          {confirmed}/{totalPlayers} confirmés
          {late > 0 && ` · ${late} en retard`}
          {declined > 0 && ` · ${declined} absent`}
        </p>
      </div>

      {myStatus ? (
        <div className={[
          'flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium',
          myStatus === 'confirmed' ? 'bg-success/10 border-success/30 text-success' :
          myStatus === 'late'      ? 'bg-warning/10 border-warning/30 text-warning' :
          'bg-danger/10 border-danger/30 text-danger',
        ].join(' ')}>
          <span>
            {myStatus === 'confirmed' ? '✓ Présence confirmée' :
             myStatus === 'late'      ? '⏰ Tu seras en retard' :
             '✗ Tu ne peux plus venir'}
          </span>
          <button
            onClick={() => setConfirmations(prev => prev.filter(c => c.player_id !== playerId))}
            className="text-xs opacity-50 hover:opacity-100 transition-opacity ml-3"
          >
            Modifier
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleConfirm('confirmed')}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/12 border border-success/25 text-success text-sm font-semibold transition-all active:scale-[0.97]"
          >
            ✓ Je confirme ma présence
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handleConfirm('late')}
              disabled={loading}
              className="flex-1 py-2 rounded-xl bg-warning/[0.08] border border-warning/20 text-warning text-sm font-medium transition-all active:scale-[0.97]"
            >
              ⏰ En retard
            </button>
            <button
              onClick={() => handleConfirm('declined')}
              disabled={loading}
              className="flex-1 py-2 rounded-xl bg-danger/[0.08] border border-danger/20 text-danger text-sm font-medium transition-all active:scale-[0.97]"
            >
              ✗ Je ne peux plus
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
