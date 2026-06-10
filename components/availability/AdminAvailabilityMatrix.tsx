'use client'

import { useState } from 'react'
import { AvailabilityMatrix, SlotData } from '@/types'
import { APP_CONFIG } from '@/config/app'
import { formatShortDayWithDate, formatHour } from '@/lib/dates'

interface AdminAvailabilityMatrixProps {
  matrix: AvailabilityMatrix
  weekStart: Date
  onCreateScrim?: (day: number, hour: number) => void
}

export function AdminAvailabilityMatrix({
  matrix,
  weekStart,
  onCreateScrim,
}: AdminAvailabilityMatrixProps) {
  const [tooltip, setTooltip] = useState<SlotData | null>(null)

  function getCellStyle(count: number): string {
    const base =
      'h-9 w-full rounded-md border transition-all duration-150 text-[11px] font-semibold tabular-nums cursor-default'
    if (count === APP_CONFIG.expectedPlayers)
      return `${base} bg-success/15 border-success/30 text-success`
    if (count === APP_CONFIG.expectedPlayers - 1)
      return `${base} bg-warning/10 border-warning/20 text-warning`
    if (count === 0)
      return `${base} bg-bg-elevated border-border-subtle text-text-disabled`
    return `${base} bg-bg-elevated border-border-subtle text-text-muted`
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="grid mb-1" style={{ gridTemplateColumns: '36px repeat(7, 1fr)', gap: '3px' }}>
        <div />
        {APP_CONFIG.daysOfWeek.map(day => {
          const label = formatShortDayWithDate(weekStart, day)
          const [dayName, dateNum] = label.split(' ')
          return (
            <div key={day} className="text-center py-1 px-0.5">
              <div className="text-[10px] font-medium text-text-muted leading-tight">{dayName}</div>
              <div className="text-[11px] font-semibold text-text-secondary leading-tight">{dateNum}</div>
            </div>
          )
        })}
      </div>

      {/* Rows */}
      <div className="flex flex-col" style={{ gap: '3px' }}>
        {APP_CONFIG.availableHours.map(hour => (
          <div
            key={hour}
            className="grid items-center"
            style={{ gridTemplateColumns: '36px repeat(7, 1fr)', gap: '3px' }}
          >
            <div className="text-right pr-2 text-[11px] font-medium text-text-muted tabular-nums">
              {formatHour(hour)}
            </div>
            {APP_CONFIG.daysOfWeek.map(day => {
              const slot = matrix[day]?.[hour]
              const count = slot?.count ?? 0
              const isPerfect = count === APP_CONFIG.expectedPlayers

              return (
                <div key={day} className="relative group">
                  <button
                    onClick={() => {
                      setTooltip(tooltip?.day_of_week === day && tooltip?.start_hour === hour ? null : slot)
                      if (isPerfect && onCreateScrim) onCreateScrim(day, hour)
                    }}
                    className={getCellStyle(count)}
                    aria-label={`${formatShortDayWithDate(weekStart, day)} ${formatHour(hour)} — ${count}/${APP_CONFIG.expectedPlayers}`}
                  >
                    {count > 0 ? `${count}/${APP_CONFIG.expectedPlayers}` : '—'}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Slot detail tooltip */}
      {tooltip && (
        <div className="mt-4 rounded-lg border border-border-subtle bg-bg-elevated p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-text-primary">
              {formatShortDayWithDate(weekStart, tooltip.day_of_week)} · {formatHour(tooltip.start_hour)} —{' '}
              <span className={tooltip.count === APP_CONFIG.expectedPlayers ? 'text-success' : 'text-text-secondary'}>
                {tooltip.count}/{APP_CONFIG.expectedPlayers} disponibles
              </span>
            </p>
            <button
              onClick={() => setTooltip(null)}
              className="text-text-muted hover:text-text-primary text-xs px-2 py-1 rounded hover:bg-bg-hover transition-colors"
            >
              Fermer
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wide">Disponibles</p>
              <div className="flex flex-col gap-1">
                {tooltip.availablePlayers.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-sm text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success flex-shrink-0" />
                    {p.name}
                  </div>
                ))}
                {tooltip.availablePlayers.length === 0 && (
                  <p className="text-xs text-text-disabled">Aucun</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wide">Indisponibles</p>
              <div className="flex flex-col gap-1">
                {tooltip.missingPlayers.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-sm text-text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-text-disabled flex-shrink-0" />
                    {p.name}
                  </div>
                ))}
                {tooltip.missingPlayers.length === 0 && (
                  <p className="text-xs text-success">Tous disponibles</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
