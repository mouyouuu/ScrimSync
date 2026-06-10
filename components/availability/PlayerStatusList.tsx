import { Player, AvailabilitySubmission } from '@/types'
import { Badge } from '@/components/ui/Badge'

interface PlayerStatusListProps {
  players: Player[]
  submissions: AvailabilitySubmission[]
}

export function PlayerStatusList({ players, submissions }: PlayerStatusListProps) {
  const submittedIds = new Set(submissions.map(s => s.player_id))

  const answered = players.filter(p => submittedIds.has(p.id))
  const pending = players.filter(p => !submittedIds.has(p.id))

  return (
    <div className="space-y-2">
      {players.map(player => {
        const hasSubmitted = submittedIds.has(player.id)
        return (
          <div
            key={player.id}
            className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0"
          >
            <span className="text-sm font-medium text-text-primary">{player.name}</span>
            {hasSubmitted ? (
              <Badge variant="success">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Répondu
              </Badge>
            ) : (
              <Badge variant="muted">
                <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-pulse" />
                En attente
              </Badge>
            )}
          </div>
        )
      })}
      <div className="pt-1 text-xs text-text-muted">
        {answered.length}/{players.length} joueurs ont répondu
      </div>
    </div>
  )
}
