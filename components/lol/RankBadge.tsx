const TIER_META: Record<string, { color: string; bg: string; label: string; short: string }> = {
  IRON:         { color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)', label: 'Fer',        short: 'Fe' },
  BRONZE:       { color: '#CD7F32', bg: 'rgba(205,127,50,0.12)',  label: 'Bronze',     short: 'Br' },
  SILVER:       { color: '#8AA0B0', bg: 'rgba(138,160,176,0.12)', label: 'Argent',     short: 'Ag' },
  GOLD:         { color: '#B8892A', bg: 'rgba(184,137,42,0.12)',  label: 'Or',         short: 'Or' },
  PLATINUM:     { color: '#0891B2', bg: 'rgba(8,145,178,0.12)',   label: 'Platine',    short: 'Pl' },
  EMERALD:      { color: '#059669', bg: 'rgba(5,150,105,0.12)',   label: 'Émeraude',   short: 'Em' },
  DIAMOND:      { color: '#5B8DEF', bg: 'rgba(91,141,239,0.12)', label: 'Diamant',    short: 'Di' },
  MASTER:       { color: '#9D48E0', bg: 'rgba(157,72,224,0.12)', label: 'Master',     short: 'M'  },
  GRANDMASTER:  { color: '#C0392B', bg: 'rgba(192,57,43,0.12)',  label: 'Grandmaster',short: 'GM' },
  CHALLENGER:   { color: '#E9B84A', bg: 'rgba(233,184,74,0.12)', label: 'Challenger', short: 'Ch' },
  UNRANKED:     { color: '#6B7280', bg: 'rgba(107,114,128,0.10)', label: 'Unranked',  short: 'U'  },
}

const TIER_BASE: Record<string, number> = {
  IRON: 0, BRONZE: 400, SILVER: 800, GOLD: 1200,
  PLATINUM: 1600, EMERALD: 2000, DIAMOND: 2400,
  MASTER: 2800, GRANDMASTER: 3200, CHALLENGER: 3600,
}
const RANK_LP: Record<string, number> = { IV: 0, III: 100, II: 200, I: 300 }

export function getTotalLP(tier: string, rank: string | null | undefined, lp: number): number {
  const base = TIER_BASE[tier] ?? 0
  const rankBonus = (rank && RANK_LP[rank] != null) ? RANK_LP[rank] : 0
  return base + rankBonus + lp
}

interface RankBadgeProps {
  tier: string
  rank?: string | null
  lp?: number | null
  wins?: number | null
  losses?: number | null
  size?: 'sm' | 'md' | 'lg'
  showRecord?: boolean
}

export function RankBadge({ tier, rank, lp, wins, losses, size = 'md', showRecord }: RankBadgeProps) {
  const key = tier?.toUpperCase() ?? 'UNRANKED'
  const meta = TIER_META[key] ?? TIER_META['UNRANKED']
  const isApex = ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(key)
  const isUnranked = key === 'UNRANKED'

  const circleSizes = { sm: 22, md: 30, lg: 42 }
  const fontSizes   = { sm: 9,  md: 11, lg: 14 }
  const sz = circleSizes[size]
  const fs = fontSizes[size]

  const rankLabel = isUnranked
    ? 'Unranked'
    : isApex
      ? `${meta.label} · ${lp ?? 0} LP`
      : `${meta.label} ${rank ?? ''} · ${lp ?? 0} LP`

  return (
    <div className="flex items-center gap-2">
      {/* Icône tier */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-lg font-bold"
        style={{
          width: sz,
          height: sz,
          background: meta.bg,
          border: `1.5px solid ${meta.color}40`,
          color: meta.color,
          fontSize: fs,
          letterSpacing: '-0.02em',
        }}
      >
        {meta.short}
      </div>

      {/* Texte */}
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-tight truncate" style={{ color: meta.color }}>
          {rankLabel}
        </p>
        {showRecord && !isUnranked && wins != null && losses != null && (
          <p className="text-[10px] text-text-muted mt-0.5">
            {wins}W {losses}L
            {wins + losses > 0 && (
              <span className="ml-1">· {Math.round((wins / (wins + losses)) * 100)}%</span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
