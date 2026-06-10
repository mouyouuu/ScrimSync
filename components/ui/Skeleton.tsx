import { APP_CONFIG } from '@/config/app'

function Sk({ className = '' }: { className?: string }) {
  return <div className={`animate-shimmer rounded-md ${className}`} />
}

export function SkeletonAvailabilityGrid() {
  const cols = APP_CONFIG.daysOfWeek.length
  const rows = Math.min(APP_CONFIG.availableHours.length, 5)
  return (
    <div className="w-full">
      <div className="grid mb-1" style={{ gridTemplateColumns: `36px repeat(${cols}, 1fr)`, gap: '3px' }}>
        <div />
        {Array.from({ length: cols }).map((_, i) => <Sk key={i} className="h-8" />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid mb-[3px]" style={{ gridTemplateColumns: `36px repeat(${cols}, 1fr)`, gap: '3px' }}>
          <Sk className="h-9 w-7 ml-auto" />
          {Array.from({ length: cols }).map((_, c) => <Sk key={c} className="h-9" />)}
        </div>
      ))}
    </div>
  )
}

export function SkeletonScrimCard() {
  return (
    <div className="border border-border-subtle rounded-xl p-4 space-y-2.5">
      <div className="flex items-center gap-2">
        <Sk className="h-2 w-2 rounded-full flex-shrink-0" />
        <Sk className="h-3 w-28" />
        <Sk className="h-4 w-14 rounded-md" />
      </div>
      <Sk className="h-5 w-44" />
      <Sk className="h-3 w-20" />
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="flex items-center gap-6 flex-wrap py-1">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="text-center space-y-1.5">
          <Sk className="h-8 w-10 mx-auto" />
          <Sk className="h-3 w-14" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonAdminContent() {
  return (
    <div className="space-y-6">
      {/* Créneaux parfaits */}
      <div className="border border-border-subtle rounded-2xl p-4 space-y-3">
        <Sk className="h-5 w-36" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between py-1">
            <Sk className="h-4 w-44" />
            <Sk className="h-8 w-28 rounded-lg" />
          </div>
        ))}
      </div>
      {/* Scrims */}
      <div className="border border-border-subtle rounded-2xl p-4 space-y-3">
        <Sk className="h-5 w-28" />
        <SkeletonScrimCard />
      </div>
      {/* Réponses joueurs */}
      <div className="border border-border-subtle rounded-2xl p-4 space-y-3">
        <Sk className="h-5 w-24" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center justify-between py-0.5">
            <Sk className="h-4 w-24" />
            <Sk className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
      {/* Matrice dispo */}
      <div className="border border-border-subtle rounded-2xl p-4">
        <Sk className="h-5 w-40 mb-4" />
        <SkeletonAvailabilityGrid />
      </div>
    </div>
  )
}
