interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  variant?: 'scrims' | 'stats' | 'team' | 'default'
}

const ICONS = {
  scrims: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="8" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 16h32" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M13 4v6M27 4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 25l3.5 3.5L28 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  stats: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M6 34V24M13 34V16M20 34V20M27 34V10M34 34V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M6 20l7-6 7 4 7-8 7-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2" opacity="0.5"/>
    </svg>
  ),
  team: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="14" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 34c0-7.732 6.268-12 14-12s14 4.268 14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  default: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M20 14v7M20 26h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
}

export function EmptyState({ title, description, icon, action, variant = 'default' }: EmptyStateProps) {
  const defaultIcon = ICONS[variant]

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
      <div className="mb-4 text-text-disabled/50">
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
