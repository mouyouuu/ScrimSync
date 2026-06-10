'use client'

import { formatWeekLabel, getPreviousWeek, getNextWeek } from '@/lib/dates'

interface WeekSelectorProps {
  weekStart: Date
  onChange: (week: Date) => void
}

export function WeekSelector({ weekStart, onChange }: WeekSelectorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(getPreviousWeek(weekStart))}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted hover:text-text-primary hover:border-border-strong hover:bg-bg-elevated transition-all duration-150"
        aria-label="Semaine précédente"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="text-xs font-medium text-text-primary text-center whitespace-nowrap">
        {formatWeekLabel(weekStart)}
      </span>
      <button
        onClick={() => onChange(getNextWeek(weekStart))}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted hover:text-text-primary hover:border-border-strong hover:bg-bg-elevated transition-all duration-150"
        aria-label="Semaine suivante"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
