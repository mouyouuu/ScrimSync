'use client'

import { useState, useRef, useEffect } from 'react'
import { Scrim, ScrimStatus } from '@/types'
import { formatScrimDate } from '@/lib/dates'
import { ResultModal } from './ResultModal'

interface ScrimCardProps {
  scrim: Scrim
  weekStart: Date
  onEdit?: () => void
  onDelete?: () => void
  onResultChange?: (result: 'win' | 'loss', score: string, notes: string) => Promise<void>
  isAdmin?: boolean
}

const STATUS_CONFIG: Record<ScrimStatus, { label: string; dot: string; textColor: string; border: string; bg: string }> = {
  confirmed: { label: 'Confirmé',   dot: 'bg-success',  textColor: 'text-success',  border: 'border-success/30', bg: 'bg-success/5'  },
  pending:   { label: 'En attente', dot: 'bg-warning',  textColor: 'text-warning',  border: 'border-warning/30', bg: 'bg-warning/5'  },
  cancelled: { label: 'Annulé',     dot: 'bg-danger',   textColor: 'text-danger',   border: 'border-danger/30',  bg: 'bg-danger/5'   },
}

export function ScrimCard({ scrim, weekStart, onEdit, onDelete, onResultChange, isAdmin }: ScrimCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const swipeXRef = useRef(0)
  const startXRef = useRef(0)
  const isSwipingRef = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const status = scrim.status ?? 'confirmed'
  const cfg = STATUS_CONFIG[status]
  const DELETE_THRESHOLD = 80

  useEffect(() => {
    if (!isAdmin || !onDelete) return
    const el = cardRef.current
    if (!el) return

    function onTouchStart(e: TouchEvent) {
      startXRef.current = e.touches[0].clientX
      isSwipingRef.current = true
    }

    function onTouchMove(e: TouchEvent) {
      if (!isSwipingRef.current) return
      const dx = startXRef.current - e.touches[0].clientX
      if (dx < 0) { isSwipingRef.current = false; return }
      const clamped = Math.min(dx, DELETE_THRESHOLD + 20)
      swipeXRef.current = clamped
      setSwipeX(clamped)
    }

    function onTouchEnd() {
      isSwipingRef.current = false
      if (swipeXRef.current < DELETE_THRESHOLD) {
        setSwipeX(0)
        swipeXRef.current = 0
      } else {
        setSwipeX(DELETE_THRESHOLD)
        swipeXRef.current = DELETE_THRESHOLD
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [isAdmin, onDelete])

  function closeSwipe() {
    setSwipeX(0)
    swipeXRef.current = 0
  }

  return (
    <>
      <div ref={cardRef} className="relative overflow-hidden rounded-xl">
        {/* Bouton supprimer derrière */}
        {isAdmin && onDelete && (
          <div className="absolute inset-y-0 right-0 flex items-center justify-end bg-danger rounded-xl px-5">
            <button
              onClick={() => { closeSwipe(); onDelete() }}
              className="text-white text-sm font-semibold"
            >
              Supprimer
            </button>
          </div>
        )}

        {/* Carte glissante */}
        <div
          className={`${cfg.border} ${cfg.bg} border p-4 transition-transform bg-bg rounded-xl`}
          style={{
            transform: swipeX > 0 ? `translateX(-${swipeX}px)` : undefined,
            transition: isSwipingRef.current ? 'none' : 'transform 0.25s ease',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`h-2 w-2 rounded-full ${cfg.dot} flex-shrink-0`} />
                <p className="text-xs text-text-muted font-medium">
                  {formatScrimDate(weekStart, scrim.day_of_week, scrim.start_hour)}
                </p>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md border ${cfg.border} ${cfg.textColor}`}>
                  {cfg.label}
                </span>
              </div>

              <p className="text-base font-semibold text-text-primary truncate">
                vs {scrim.opponent_name}
              </p>

              {scrim.result ? (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-sm font-semibold ${scrim.result === 'win' ? 'text-success' : 'text-danger'}`}>
                    {scrim.result === 'win' ? '✓ Victoire' : '✗ Défaite'}
                  </span>
                  {scrim.score && <span className="text-sm text-text-muted">{scrim.score}</span>}
                  {onResultChange && (
                    <button
                      onClick={() => setModalOpen(true)}
                      className="text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-2"
                    >
                      Modifier
                    </button>
                  )}
                </div>
              ) : onResultChange && status !== 'cancelled' ? (
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-2 text-xs font-medium px-2.5 py-1 rounded-lg bg-bg-elevated border border-border-subtle text-text-muted hover:text-text-primary hover:border-border transition-colors"
                >
                  + Ajouter le résultat
                </button>
              ) : null}

              {scrim.notes && (
                <p className="mt-1 text-sm text-text-secondary line-clamp-2">{scrim.notes}</p>
              )}

              <div className="mt-3">
                <a
                  href={scrim.opponent_opgg_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                >
                  Voir l'équipe adverse
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3.5 8.5l5-5M5 3.5h3.5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>

            {isAdmin && (
              <div className="flex gap-1 flex-shrink-0">
                {onEdit && (
                  <button onClick={onEdit} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors" aria-label="Modifier">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M10 2l2 2-7 7H3v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {onResultChange && (
        <ResultModal
          scrim={scrim}
          weekStart={weekStart}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={onResultChange}
        />
      )}
    </>
  )
}
