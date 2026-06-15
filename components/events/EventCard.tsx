'use client'

import { useState } from 'react'
import { TeamEvent } from '@/types'
import { formatEventDate, isEventPast } from '@/lib/dates'
import { EventResultModal } from './EventResultModal'

interface EventCardProps {
  event: TeamEvent
  isAdmin?: boolean
  onDelete?: () => void
  onResult?: (result: 'win' | 'loss', score: string) => Promise<void>
}

type EventCfg = { dot: string; textColor: string; border: string; bg: string }

function getConfig(event: TeamEvent, past: boolean): EventCfg {
  if (past && event.result === 'win')  return { dot: 'bg-success',      textColor: 'text-success',    border: 'border-success/20',    bg: 'bg-success/[0.04]'  }
  if (past && event.result === 'loss') return { dot: 'bg-danger/50',    textColor: 'text-danger/70',  border: 'border-danger/[0.12]', bg: 'bg-danger/[0.02]'   }
  if (past)                            return { dot: 'bg-text-muted/40', textColor: 'text-text-muted', border: 'border-white/[0.06]',  bg: 'bg-white/[0.025]'   }
  if (event.type === 'tournament')     return { dot: 'bg-warning',      textColor: 'text-warning',    border: 'border-warning/20',    bg: 'bg-warning/[0.03]'  }
  return                                      { dot: 'bg-accent',       textColor: 'text-accent',     border: 'border-accent/20',     bg: 'bg-accent/[0.03]'   }
}

export function EventCard({ event, isAdmin, onDelete, onResult }: EventCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const past = isEventPast(event.event_date, event.event_time)
  const cfg = getConfig(event, past)

  return (
    <>
      <div className={`${cfg.border} ${cfg.bg} border p-4 rounded-2xl`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">

            {/* Header row: dot · date · type badge */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`h-2 w-2 rounded-full ${cfg.dot} flex-shrink-0`} />
              <p className="text-xs text-text-muted font-medium">
                {formatEventDate(event.event_date, event.event_time)}
              </p>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md border ${cfg.border} ${cfg.textColor}`}>
                {event.type === 'tournament' ? 'Tournoi' : 'Match'}
              </span>
            </div>

            {/* Title */}
            <p className="text-base font-semibold text-text-primary truncate">{event.title}</p>

            {/* Result */}
            {event.result ? (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-sm font-semibold ${event.result === 'win' ? 'text-success' : 'text-danger'}`}>
                  {event.result === 'win' ? '✓ Victoire' : '✗ Défaite'}
                </span>
                {event.score && <span className="text-sm text-text-muted">{event.score}</span>}
                {onResult && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-2"
                  >
                    Modifier
                  </button>
                )}
              </div>
            ) : past && onResult ? (
              <button
                onClick={() => setModalOpen(true)}
                className="mt-2 text-xs font-medium px-2.5 py-1 rounded-lg bg-bg-elevated border border-border-subtle text-text-muted hover:text-text-primary hover:border-border transition-colors"
              >
                + Ajouter le résultat
              </button>
            ) : null}

            {/* Description */}
            {event.description && (
              <p className="mt-1 text-sm text-text-secondary line-clamp-2">{event.description}</p>
            )}

            {/* Creator */}
            {event.created_by_name && (
              <p className="mt-2 text-xs text-text-muted">Ajouté par {event.created_by_name}</p>
            )}
          </div>

          {/* Admin: delete */}
          {isAdmin && onDelete && (
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                aria-label="Supprimer"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M2 4h11M5 4V2.5A1.5 1.5 0 016.5 1h2A1.5 1.5 0 0110 2.5V4M6 7v4M9 7v4M3 4l.8 8.5A1 1 0 004.8 13.5h5.4a1 1 0 001-.995L12 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {onResult && (
        <EventResultModal
          event={event}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={onResult}
        />
      )}
    </>
  )
}
