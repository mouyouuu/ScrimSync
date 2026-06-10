'use client'

import { APP_CONFIG } from '@/config/app'
import { formatShortDayWithDate, formatHour } from '@/lib/dates'
import { slotKey } from '@/lib/availability'

interface AvailabilityGridProps {
  weekStart: Date
  selected: Set<string>
  onToggle: (key: string) => void
  disabled?: boolean
}

export function AvailabilityGrid({
  weekStart,
  selected,
  onToggle,
  disabled = false,
}: AvailabilityGridProps) {
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="min-w-[480px]">
        {/* Header row */}
        <div className="grid mb-1" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
          <div />
          {APP_CONFIG.daysOfWeek.map(day => (
            <div
              key={day}
              className="text-center text-xs font-medium text-text-muted py-2 px-1"
            >
              {formatShortDayWithDate(weekStart, day)}
            </div>
          ))}
        </div>

        {/* Hour rows */}
        <div className="flex flex-col gap-1">
          {APP_CONFIG.availableHours.map(hour => (
            <div
              key={hour}
              className="grid items-center gap-1"
              style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}
            >
              <div className="text-right pr-3 text-xs font-medium text-text-muted tabular-nums">
                {formatHour(hour)}
              </div>
              {APP_CONFIG.daysOfWeek.map(day => {
                const key = slotKey(day, hour)
                const isSelected = selected.has(key)
                return (
                  <button
                    key={day}
                    onClick={() => !disabled && onToggle(key)}
                    disabled={disabled}
                    aria-label={`${formatShortDayWithDate(weekStart, day)} ${formatHour(hour)}`}
                    aria-pressed={isSelected}
                    className={[
                      'h-10 w-full rounded-lg border transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
                      disabled ? 'cursor-default opacity-60' : 'cursor-pointer active:scale-95',
                      isSelected
                        ? 'bg-accent/20 border-accent/50 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]'
                        : 'bg-bg-elevated border-border-subtle hover:border-border hover:bg-bg-hover',
                    ].join(' ')}
                  >
                    {isSelected && (
                      <span className="flex items-center justify-center h-full">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M2.5 7l3.5 3.5 5.5-6"
                            stroke="#6366f1"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
