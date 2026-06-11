export interface Player {
  id: string
  name: string
  token: string
  created_at: string
  riot_game_name?: string | null
  riot_tag_line?: string | null
  riot_puuid?: string | null
  riot_summoner_id?: string | null
  riot_tier?: string | null
  riot_rank?: string | null
  riot_lp?: number | null
  riot_wins?: number | null
  riot_losses?: number | null
  riot_lp_start?: number | null
  riot_updated_at?: string | null
}

export interface Availability {
  id: string
  player_id: string
  week_start: string
  day_of_week: number
  start_hour: number
  created_at: string
}

export interface AvailabilitySubmission {
  id: string
  player_id: string
  week_start: string
  submitted_at: string
}

export type ScrimStatus = 'pending' | 'confirmed' | 'cancelled'
export type ScrimResult = 'win' | 'loss' | null

export interface Scrim {
  id: string
  week_start: string
  day_of_week: number
  start_hour: number
  opponent_name: string
  opponent_opgg_url: string
  notes?: string | null
  status: ScrimStatus
  result?: ScrimResult
  score?: string | null
  created_at: string
}

export interface TeamSettings {
  id: string
  team_name: string
  created_at: string
}

export interface SlotData {
  day_of_week: number
  start_hour: number
  count: number
  availablePlayers: Player[]
  missingPlayers: Player[]
}

export type AvailabilityMatrix = Record<number, Record<number, SlotData>>

export interface PerfectSlot {
  day_of_week: number
  start_hour: number
}

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

export interface ScrimFormData {
  day_of_week: number
  start_hour: number
  opponent_name: string
  opponent_opgg_url: string
  notes: string
  status: ScrimStatus
  week_start: string
}
