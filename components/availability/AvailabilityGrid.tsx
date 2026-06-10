'use client'

import { useRef, useEffect } from 'react'
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
  const gridRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef(selected)
  selectedRef.current = selected

  const drag = useRef<{
    active: boolean
    selecting: boolean
    visited: Set<string>
  }>({ active: false, selecting: true, visited: new Set() })

  useEffect(() => {
    const el = gridRef.current
    if (!el) return

    function getKey(x: number, y: number): string | null {
      const target = document.elementFromPoint(x, y) as HTMLElement | null
      return target?.dataset?.slotKey ?? null
    }

    function onTouchStart(e: TouchEvent) {
      if (disabled) return
      const t = e.touches[0]
      const key = getKey(t.clientX, t.clientY)
      if (!key) return

      e.preventDefault() // empêche le scroll et le click synthétique

      drag.current = {
        active: true,
        selecting: !selectedRef.current.has(key),
        visited: new Set([key]),
      }
      onToggle(key)
    }

    function onTouchMove(e: TouchEvent) {
      if (!drag.current.active) return
      e.preventDefault()
      const t = e.touches[0]
      const key = getKey(t.clientX, t.clientY)
      if (!key || drag.current.visited.has(key)) return

      drag.current.visited.add(key)
      const isSelected = selectedRef.current.has(key)
      if (drag.current.selecting && !isSelected) onToggle(key)
      if (!drag.current.selecting && isSelected) onToggle(key)
    }

    function onTouchEnd() {
      drag.current.active = false
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [disabled, onToggle])

  return (
    <div ref={gridRef} className="w-full select-none">
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
              const key = slotKey(day, hour)
              const isSelected = selected.has(key)
              return (
                <button
                  key={day}
                  data-slot-key={key}
                  onClick={() => !disabled && onToggle(key)}
                  disabled={disabled}
                  aria-label={`${formatShortDayWithDate(weekStart, day)} ${formatHour(hour)}`}
                  aria-pressed={isSelected}
                  className={[
                    'h-9 w-full rounded-md border transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
                    disabled ? 'cursor-default opacity-60' : 'cursor-pointer active:scale-95',
                    isSelected
                      ? 'bg-accent/20 border-accent/50 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]'
                      : 'bg-bg-elevated border-border-subtle hover:border-border hover:bg-bg-hover',
                  ].join(' ')}
                >
                  {isSelected && (
                    <span className="flex items-center justify-center h-full pointer-events-none">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
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
  )
}
