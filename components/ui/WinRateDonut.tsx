'use client'

import { useEffect, useState } from 'react'

const R = 36
const CIRC = 2 * Math.PI * R

interface WinRateDonutProps {
  wins: number
  losses: number
  size?: number
}

export function WinRateDonut({ wins, losses, size = 100 }: WinRateDonutProps) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(t)
  }, [])

  const total = wins + losses
  const pct = total > 0 ? wins / total : 0
  const pctRounded = Math.round(pct * 100)
  const dashOffset = animated ? CIRC * (1 - pct) : CIRC

  const arcColor = pct >= 0.6 ? '#4ade80' : pct >= 0.5 ? '#fb923c' : '#f87171'

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx="50" cy="50" r={R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="9"
        />
        {/* Wins arc */}
        <circle
          cx="50" cy="50" r={R}
          fill="none"
          stroke={arcColor}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${CIRC} ${CIRC}`}
          style={{
            strokeDashoffset: dashOffset,
            transition: animated
              ? 'stroke-dashoffset 0.9s cubic-bezier(0.34, 1.05, 0.64, 1), stroke 0.3s ease'
              : 'none',
            filter: animated ? `drop-shadow(0 0 4px ${arcColor}88)` : 'none',
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className="font-bold tracking-tighter leading-none"
          style={{ fontSize: size * 0.22, color: arcColor }}
        >
          {pctRounded}%
        </span>
        <span
          className="font-semibold uppercase tracking-wider text-text-muted mt-0.5"
          style={{ fontSize: size * 0.1 }}
        >
          WR
        </span>
      </div>
    </div>
  )
}
