'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TeamEvent } from '@/types'
import { formatEventDate } from '@/lib/dates'

interface EventResultModalProps {
  event: TeamEvent
  open: boolean
  onClose: () => void
  onSubmit: (result: 'win' | 'loss', score: string) => Promise<void>
}

export function EventResultModal({ event, open, onClose, onSubmit }: EventResultModalProps) {
  const [result, setResult] = useState<'win' | 'loss' | null>(event.result ?? null)
  const [score, setScore] = useState(event.score ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!result) return
    setLoading(true)
    await onSubmit(result, score)
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Résultat" size="sm">
      <div className="space-y-4">

        {/* Info événement */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.07] px-4 py-3">
          <p className="text-xs text-text-muted">{formatEventDate(event.event_date, event.event_time)}</p>
          <p className="text-sm font-semibold text-text-primary mt-0.5">{event.title}</p>
        </div>

        {/* Victoire / Défaite */}
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">Résultat</p>
          <div className="flex gap-2">
            <button
              onClick={() => setResult('win')}
              className={[
                'flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-[0.97]',
                result === 'win'
                  ? 'bg-success/15 border-success/35 text-success'
                  : 'bg-white/[0.04] border-white/[0.08] text-text-muted hover:border-success/25 hover:text-success/70',
              ].join(' ')}
            >
              ✓ Victoire
            </button>
            <button
              onClick={() => setResult('loss')}
              className={[
                'flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-[0.97]',
                result === 'loss'
                  ? 'bg-danger/15 border-danger/35 text-danger'
                  : 'bg-white/[0.04] border-white/[0.08] text-text-muted hover:border-danger/25 hover:text-danger/70',
              ].join(' ')}
            >
              ✗ Défaite
            </button>
          </div>
        </div>

        {/* Score */}
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">Score (optionnel)</label>
          <input
            type="text"
            placeholder="ex : 2-1, 3-0..."
            value={score}
            onChange={e => setScore(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={handleSubmit} loading={loading} disabled={!result} className="flex-1">
            Enregistrer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
