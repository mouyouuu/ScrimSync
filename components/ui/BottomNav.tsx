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
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-bg-surface/95 backdrop-blur-md border-t border-border-subtle pb-safe">
      <div className="flex h-16">
        {tabs.map(tab => {
          const isActive = tab.key === active
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={[
                'flex-1 flex flex-col items-center justify-center gap-1.5 relative transition-colors duration-150',
                isActive ? 'text-accent' : 'text-text-disabled hover:text-text-muted',
              ].join(' ')}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-accent rounded-full" />
              )}
              <span className={`transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100 opacity-70'}`}>
                {tab.icon}
              </span>
              <span className={`text-[11px] font-semibold tracking-tight ${isActive ? 'opacity-100' : 'opacity-60'}`}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
