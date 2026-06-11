import { Player, AvailabilitySubmission } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { RankBadge } from '@/components/lol/RankBadge'

interface PlayerStatusListProps {
  players: Player[]
  submissions: AvailabilitySubmission[]
  absenceIds?: string[]
}

export function PlayerStatusList({ players, submissions, absenceIds = [] }: PlayerStatusListProps) {
  const submittedIds = new Set(submissions.map(s => s.player_id))
  const absentSet = new Set(absenceIds)

  const responded = players.filter(p => submittedIds.has(p.id) || absentSet.has(p.id)).length
  const pending = players.filter(p => !submittedIds.has(p.id) && !absentSet.has(p.id)).length

  return (
    <div className="space-y-0">
      {players.map(player => {
        const hasSubmitted = submittedIds.has(player.id)
        const isAbsent = absentSet.has(player.id)
        const hasRank = player.riot_tier && player.riot_lp != null

        return (
          <div
            key={player.id}
            className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-semibold text-text-primary">{player.name}</span>
              {hasRank && (
                <RankBadge
                  tier={player.riot_tier!}
                  rank={player.riot_rank}
                  lp={player.riot_lp}
                  size="sm"
                />
              )}
            </div>
            <div className="flex-shrink-0 ml-2">
              {hasSubmitted ? (
                <Badge variant="success">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Répondu
                </Badge>
              ) : isAbsent ? (
                <Badge variant="warning">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 2v3M5 7h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Absent
                </Badge>
              ) : (
                <Badge variant="muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-pulse" />
                  En attente
                </Badge>
              )}
            </div>
          </div>
        )
      })}
      <div className="pt-2 text-xs text-text-muted">
        {responded}/{players.length} ont répondu
        {pending > 0 && <span className="ml-1">· {pending} en attente</span>}
      </div>
    </div>
  )
}
