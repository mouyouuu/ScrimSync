import { APP_CONFIG } from '@/config/app'

function Sk({ className = '' }: { className?: string }) {
  return <div className={`animate-shimmer rounded-lg ${className}`} />
}

/* ─── Grille de disponibilités ─────────────────────────────────── */
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

/* ─── ScrimCard ─────────────────────────────────────────────────── */
export function SkeletonScrimCard() {
  return (
    <div className="border border-white/[0.07] rounded-2xl p-4">
      {/* status dot + date + badge */}
      <div className="flex items-center gap-2 mb-2">
        <Sk className="h-2 w-2 rounded-full flex-shrink-0" />
        <Sk className="h-3 w-36" />
        <Sk className="h-5 w-16 rounded-full" />
      </div>
      {/* vs opponent */}
      <Sk className="h-[18px] w-48 mb-3" />
      {/* op.gg link */}
      <Sk className="h-3 w-28" />
    </div>
  )
}

/* ─── Ligne PlayerStatusList ────────────────────────────────────── */
function SkeletonPlayerRow() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Sk className="h-[14px] w-24" />
        <Sk className="h-5 w-14 rounded-full" />
      </div>
      <Sk className="h-5 w-16 rounded-full" />
    </div>
  )
}

/* ─── Créneau parfait ───────────────────────────────────────────── */
function SkeletonPerfectSlot() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] px-4 py-3">
      <Sk className="h-2 w-2 rounded-full flex-shrink-0" />
      <Sk className="h-[14px] flex-1 max-w-[180px]" />
      <Sk className="h-5 w-8 rounded-full flex-shrink-0" />
      <Sk className="h-8 w-24 rounded-xl flex-shrink-0" />
    </div>
  )
}

/* ─── Hero card elo (rank image + tier + LP gained + stats) ─────── */
export function SkeletonEloHeroCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/[0.07]">
      {/* rang principal */}
      <div className="flex items-center gap-4 px-5 py-5">
        <Sk className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Sk className="h-5 w-32" />
          <Sk className="h-3 w-20" />
        </div>
        <Sk className="h-5 w-14 flex-shrink-0" />
      </div>
      {/* stats V/D/WR */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-t border-white/[0.06]">
        {['V', 'D', 'WR'].map(k => (
          <div key={k} className="py-3 flex flex-col items-center gap-1.5">
            <Sk className="h-6 w-8" />
            <Sk className="h-2.5 w-4" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Ligne joueur Comptes LoL ──────────────────────────────────── */
function SkeletonLolRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Sk className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Sk className="h-3 w-20" />
        <Sk className="h-2.5 w-28" />
      </div>
      <Sk className="h-4 w-12 flex-shrink-0" />
    </div>
  )
}

/* ─── Contenu initial admin (onglet Scrims) ─────────────────────── */
export function SkeletonAdminContent() {
  return (
    <div className="space-y-5">
      {/* Créneaux parfaits */}
      <div className="border border-white/[0.07] rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <Sk className="h-5 w-36" />
          <Sk className="h-5 w-16 rounded-full" />
        </div>
        <SkeletonPerfectSlot />
        <SkeletonPerfectSlot />
      </div>

      {/* Scrims */}
      <div className="border border-white/[0.07] rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <Sk className="h-5 w-20" />
          <div className="flex gap-2">
            <Sk className="h-8 w-28 rounded-xl" />
            <Sk className="h-8 w-28 rounded-xl" />
          </div>
        </div>
        <SkeletonScrimCard />
        <SkeletonScrimCard />
      </div>
    </div>
  )
}

/* ─── Stats admin (onglet Équipe) ───────────────────────────────── */
export function SkeletonAdminEquipe() {
  return (
    <div className="space-y-5">
      {/* Hero elo */}
      <div className="border border-white/[0.07] rounded-3xl p-5 space-y-3">
        <Sk className="h-5 w-28 mb-1" />
        <SkeletonEloHeroCard />
        {[1, 2, 3, 4, 5].map(i => <SkeletonLolRow key={i} />)}
      </div>
    </div>
  )
}

/* ─── Stats joueur (onglet Stats) ───────────────────────────────── */
export function SkeletonStats() {
  return (
    <div className="space-y-5">
      {/* Elo Équipe */}
      <div className="border border-white/[0.07] rounded-3xl p-5 space-y-3">
        <Sk className="h-5 w-28 mb-1" />
        <SkeletonEloHeroCard />
        <div className="divide-y divide-white/[0.05]">
          {[1, 2, 3, 4, 5].map(i => <SkeletonPlayerRow key={i} />)}
        </div>
      </div>
    </div>
  )
}

/* ─── Stats admin — 2x2 grid Victoires/Défaites/Matchs/WR ──────── */
export function SkeletonAdminStats() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-2xl border border-white/[0.07] p-4 flex flex-col items-center gap-2">
          <Sk className="h-9 w-14" />
          <Sk className="h-2.5 w-16" />
        </div>
      ))}
    </div>
  )
}
