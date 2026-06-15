interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  variant?: 'scrims' | 'slots' | 'stats' | 'team' | 'events' | 'default'
}

const ICONS = {
  scrims: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      {/* Calendar */}
      <rect x="5" y="10" width="42" height="36" rx="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 21h42" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M17 5v9M35 5v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Crossed swords inside */}
      <path d="M17 32l18 10M35 32L17 42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
      <path d="M15 30l3 2.5M37 30l-3 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5"/>
      <circle cx="26" cy="37" r="2" fill="currentColor" opacity="0.25"/>
    </svg>
  ),
  slots: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      {/* Outer ring */}
      <circle cx="26" cy="26" r="20" stroke="currentColor" strokeWidth="1.5"/>
      {/* Middle ring */}
      <circle cx="26" cy="26" r="12" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
      {/* Center dot */}
      <circle cx="26" cy="26" r="3.5" fill="currentColor" opacity="0.5"/>
      {/* Crosshair lines */}
      <path d="M26 4v8M26 40v8M4 26h8M40 26h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      {/* 5 player dots around ring (perfect slot) */}
      <circle cx="26" cy="6" r="2" fill="currentColor" opacity="0.3"/>
      <circle cx="43.5" cy="15.5" r="2" fill="currentColor" opacity="0.3"/>
      <circle cx="37" cy="43" r="2" fill="currentColor" opacity="0.3"/>
      <circle cx="15" cy="43" r="2" fill="currentColor" opacity="0.3"/>
      <circle cx="8.5" cy="15.5" r="2" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  stats: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      {/* Trophy cup */}
      <path d="M15 7h22v18c0 8.284-4.925 12-11 12S15 33.284 15 25V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Handles */}
      <path d="M15 16H10a5 5 0 005 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M37 16h5a5 5 0 01-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Stem */}
      <path d="M26 37v8M18 45h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Stars inside */}
      <path d="M26 14l1.5 3h3l-2.5 2 1 3L26 20l-3 2 1-3-2.5-2h3z" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  team: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      {/* Center player */}
      <circle cx="26" cy="17" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 44c0-9.941 8.059-15 18-15s18 5.059 18 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Side players (faded) */}
      <circle cx="10" cy="20" r="4.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
      <path d="M2 42c0-5.523 3.134-8.5 8-8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      <circle cx="42" cy="20" r="4.5" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
      <path d="M50 42c0-5.523-3.134-8.5-8-8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  ),
  events: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      {/* Calendar base */}
      <rect x="5" y="12" width="42" height="34" rx="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 23h42" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M17 6v10M35 6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Trophy inside calendar */}
      <path d="M19 30h14v7c0 3.866-2.686 5-7 5s-7-1.134-7-5v-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" opacity="0.85"/>
      <path d="M19 34h-2.5a2.5 2.5 0 002.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
      <path d="M33 34h2.5a2.5 2.5 0 01-2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
      <path d="M26 42v3M22 45h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
      {/* Star in trophy */}
      <path d="M26 33l.9 1.8h2l-1.5 1.2.6 1.8-1.6-1-1.6 1 .6-1.8-1.5-1.2h2z" fill="currentColor" opacity="0.35"/>
    </svg>
  ),
  default: (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="18" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M26 18v10M26 33h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
}

export function EmptyState({ title, description, icon, action, variant = 'default' }: EmptyStateProps) {
  const defaultIcon = ICONS[variant]

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
      <div className="mb-4 text-text-disabled/40">
        {icon ?? defaultIcon}
      </div>
      <p className="text-[14px] font-semibold text-text-secondary">{title}</p>
      {description && (
        <p className="mt-1.5 text-[13px] text-text-muted max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
