const TIER_META: Record<string, { color: string; label: string }> = {
  IRON:         { color: '#9CA3AF', label: 'Fer' },
  BRONZE:       { color: '#CD7F32', label: 'Bronze' },
  SILVER:       { color: '#8AA0B0', label: 'Argent' },
  GOLD:         { color: '#B8892A', label: 'Or' },
  PLATINUM:     { color: '#0891B2', label: 'Platine' },
  EMERALD:      { color: '#059669', label: 'Émeraude' },
  DIAMOND:      { color: '#5B8DEF', label: 'Diamant' },
  MASTER:       { color: '#9D48E0', label: 'Master' },
  GRANDMASTER:  { color: '#C0392B', label: 'Grandmaster' },
  CHALLENGER:   { color: '#E9B84A', label: 'Challenger' },
  UNRANKED:     { color: '#6B7280', label: 'Unranked' },
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

function tierImageUrl(tier: string): string {
  const t = tier.toLowerCase()
  return `/ranks/${t}.png`
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

  const imgSizes = { sm: 24, md: 32, lg: 48 }
  const imgSize = imgSizes[size]

  const rankLabel = isUnranked
    ? 'Unranked'
    : isApex
      ? `${meta.label} · ${lp ?? 0} LP`
      : `${meta.label} ${rank ?? ''} · ${lp ?? 0} LP`

  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0" style={{ width: imgSize, height: imgSize }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tierImageUrl(key)}
          alt={meta.label}
          width={imgSize}
          height={imgSize}
          style={{ objectFit: 'contain', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
        />
      </div>
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
