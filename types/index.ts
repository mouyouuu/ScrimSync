export interface Player {
  id: string
  name: string
  token: string
  created_at: string
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

export interface Scrim {
  id: string
  week_start: string
  day_of_week: number
  start_hour: number
  opponent_name: string
  opponent_opgg_url: string
  notes?: string | null
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
  week_start: string
}
