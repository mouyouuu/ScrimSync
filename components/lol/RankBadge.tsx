const TIER_META: Record<string, { color: string; bg: string; label: string }> = {
  IRON:         { color: '#9CA3AF', bg: 'rgba(156,163,175,0.10)', label: 'Fer' },
  BRONZE:       { color: '#CD7F32', bg: 'rgba(205,127,50,0.12)',  label: 'Bronze' },
  SILVER:       { color: '#8AA0B0', bg: 'rgba(138,160,176,0.10)', label: 'Argent' },
  GOLD:         { color: '#C9A227', bg: 'rgba(201,162,39,0.12)',  label: 'Or' },
  PLATINUM:     { color: '#0EA5E9', bg: 'rgba(14,165,233,0.10)',  label: 'Platine' },
  EMERALD:      { color: '#10B981', bg: 'rgba(16,185,129,0.10)',  label: 'Émeraude' },
  DIAMOND:      { color: '#6EA8FE', bg: 'rgba(110,168,254,0.10)', label: 'Diamant' },
  MASTER:       { color: '#A855F7', bg: 'rgba(168,85,247,0.12)',  label: 'Master' },
  GRANDMASTER:  { color: '#EF4444', bg: 'rgba(239,68,68,0.10)',   label: 'Grandmaster' },
  CHALLENGER:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  label: 'Challenger' },
  UNRANKED:     { color: '#6B7280', bg: 'rgba(107,114,128,0.08)', label: 'Unranked' },
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

export function lpToTierInfo(totalLP: number): { tier: string; rank: string | null; lp: number } {
  if (totalLP >= 3600) return { tier: 'CHALLENGER', rank: null, lp: totalLP - 3600 }
  if (totalLP >= 3200) return { tier: 'GRANDMASTER', rank: null, lp: totalLP - 3200 }
  if (totalLP >= 2800) return { tier: 'MASTER', rank: null, lp: totalLP - 2800 }
  const brackets: Array<[number, string]> = [
    [2400, 'DIAMOND'], [2000, 'EMERALD'], [1600, 'PLATINUM'],
    [1200, 'GOLD'], [800, 'SILVER'], [400, 'BRONZE'], [0, 'IRON'],
  ]
  for (const [base, tier] of brackets) {
    if (totalLP >= base) {
      const rem = totalLP - base
      const rank = rem >= 300 ? 'I' : rem >= 200 ? 'II' : rem >= 100 ? 'III' : 'IV'
      return { tier, rank, lp: rem % 100 }
    }
  }
  return { tier: 'IRON', rank: 'IV', lp: totalLP }
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
  chip?: boolean
}

export function RankBadge({ tier, rank, lp, wins, losses, size = 'md', showRecord, chip }: RankBadgeProps) {
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

  const inner = (
    <>
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
    </>
  )

  if (chip) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5"
        style={{
          background: meta.bg,
          border: `1px solid ${meta.color}28`,
        }}
      >
        {inner}
      </div>
    )
  }

  return <div className="flex items-center gap-2">{inner}</div>
}
