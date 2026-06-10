import { Scrim } from '@/types'
import { formatScrimDate } from '@/lib/dates'

interface ScrimCardProps {
  scrim: Scrim
  weekStart: Date
  onEdit?: () => void
  onDelete?: () => void
  isAdmin?: boolean
}

export function ScrimCard({ scrim, weekStart, onEdit, onDelete, isAdmin }: ScrimCardProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-4 transition-colors hover:border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0" />
            <p className="text-xs text-text-muted font-medium">
              {formatScrimDate(weekStart, scrim.day_of_week, scrim.start_hour)}
            </p>
          </div>

          <p className="text-base font-semibold text-text-primary truncate">
            vs {scrim.opponent_name}
          </p>

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
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
                aria-label="Modifier"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M10 2l2 2-7 7H3v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                aria-label="Supprimer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 4h10M5 4V2.5h4V4M11 4l-.7 7.5H3.7L3 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
