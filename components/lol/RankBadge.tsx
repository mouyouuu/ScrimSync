import Image from 'next/image'

const TIER_META: Record<string, { color: string; label: string }> = {
  IRON:         { color: '#6B7280', label: 'Fer' },
  BRONZE:       { color: '#92400E', label: 'Bronze' },
  SILVER:       { color: '#8AA0B0', label: 'Argent' },
  GOLD:         { color: '#B8892A', label: 'Or' },
  PLATINUM:     { color: '#0891B2', label: 'Platine' },
  EMERALD:      { color: '#059669', label: 'Émeraude' },
  DIAMOND:      { color: '#4F6DB0', label: 'Diamant' },
  MASTER:       { color: '#9D48E0', label: 'Master' },
  GRANDMASTER:  { color: '#C0392B', label: 'Grandmaster' },
  CHALLENGER:   { color: '#E9B84A', label: 'Challenger' },
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
  const meta = TIER_META[tier?.toUpperCase()] ?? { color: '#6B7280', label: tier }
  const tierLower = tier?.toLowerCase()
  const isApex = ['master', 'grandmaster', 'challenger'].includes(tierLower)

  const imgSizes = { sm: 24, md: 32, lg: 48 }
  const imgSize = imgSizes[size]

  const rankLabel = isApex
    ? `${lp ?? 0} LP`
    : `${tier} ${rank ?? ''} · ${lp ?? 0} LP`

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-shrink-0" style={{ width: imgSize, height: imgSize }}>
        <Image
          src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images/ranked-emblems/${tierLower}.png`}
          alt={meta.label}
          width={imgSize}
          height={imgSize}
          className="object-contain drop-shadow-sm"
          unoptimized
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-tight" style={{ color: meta.color }}>
          {rankLabel}
        </p>
        {showRecord && wins != null && losses != null && (
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
