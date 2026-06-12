'use client'

export interface BottomNavTab {
  key: string
  label: string
  icon: React.ReactNode
}

export function BottomNav({ tabs, active, onChange }: {
  tabs: BottomNavTab[]
  active: string
  onChange: (key: string) => void
}) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 border-t border-white/[0.06] pb-safe" style={{ background: 'rgba(12,12,15,0.88)', backdropFilter: 'blur(24px) saturate(1.6)', WebkitBackdropFilter: 'blur(24px) saturate(1.6)' }}>
      <div className="flex h-16">
        {tabs.map(tab => {
          const isActive = tab.key === active
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={[
                'flex-1 flex flex-col items-center justify-center gap-1 relative transition-all duration-200',
                isActive ? 'text-accent' : 'text-text-muted hover:text-text-secondary',
              ].join(' ')}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-accent rounded-full opacity-80" />
              )}
              <span className={`transition-all duration-200 ${isActive ? 'scale-[1.08]' : 'scale-100 opacity-60'}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'opacity-100' : 'opacity-50'}`}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
