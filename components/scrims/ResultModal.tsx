'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Scrim } from '@/types'
import { formatScrimDate } from '@/lib/dates'

interface ResultModalProps {
  scrim: Scrim
  weekStart: Date
  open: boolean
  onClose: () => void
  onSubmit: (result: 'win' | 'loss', score: string, notes: string) => Promise<void>
}

export function ResultModal({ scrim, weekStart, open, onClose, onSubmit }: ResultModalProps) {
  const [result, setResult] = useState<'win' | 'loss' | null>(scrim.result as 'win' | 'loss' | null ?? null)
  const [score, setScore] = useState(scrim.score ?? '')
  const [notes, setNotes] = useState(scrim.notes ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!result) return
    setLoading(true)
    await onSubmit(result, score, notes)
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Résultat du scrim" size="sm">
      <div className="space-y-4">
        {/* Info scrim */}
        <div className="rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2.5">
          <p className="text-xs text-text-muted">{formatScrimDate(weekStart, scrim.day_of_week, scrim.start_hour)}</p>
          <p className="text-sm font-semibold text-text-primary mt-0.5">vs {scrim.opponent_name}</p>
        </div>

        {/* Victoire / Défaite */}
        <div>
          <p className="text-xs font-medium text-text-secondary mb-2">Résultat</p>
          <div className="flex gap-2">
            <button
              onClick={() => setResult('win')}
              className={[
                'flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all',
                result === 'win'
                  ? 'bg-success/15 border-success/40 text-success'
                  : 'bg-bg-elevated border-border-subtle text-text-muted hover:border-success/30',
              ].join(' ')}
            >
              ✓ Victoire
            </button>
            <button
              onClick={() => setResult('loss')}
              className={[
                'flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-all',
                result === 'loss'
                  ? 'bg-danger/15 border-danger/40 text-danger'
                  : 'bg-bg-elevated border-border-subtle text-text-muted hover:border-danger/30',
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
            className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Description / Elo */}
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">Description (optionnel)</label>
          <textarea
            placeholder="ex : adversaires Diamond+, bonne coordination..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
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
