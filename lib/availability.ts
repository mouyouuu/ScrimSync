import { Availability, Player, SlotData, AvailabilityMatrix, PerfectSlot } from '@/types'
import { APP_CONFIG } from '@/config/app'

export function buildAvailabilityMatrix(
  availabilities: Availability[],
  players: Player[]
): AvailabilityMatrix {
  const matrix: AvailabilityMatrix = {}

  for (const day of APP_CONFIG.daysOfWeek) {
    matrix[day] = {}
    for (const hour of APP_CONFIG.availableHours) {
      const availablePlayerIds = availabilities
        .filter(a => a.day_of_week === day && a.start_hour === hour)
        .map(a => a.player_id)

      const availablePlayers = players.filter(p => availablePlayerIds.includes(p.id))
      const missingPlayers = players.filter(p => !availablePlayerIds.includes(p.id))

      matrix[day][hour] = {
        day_of_week: day,
        start_hour: hour,
        count: availablePlayers.length,
        availablePlayers,
        missingPlayers,
      }
    }
  }

  return matrix
}

export function getPerfectSlots(matrix: AvailabilityMatrix): PerfectSlot[] {
  const slots: PerfectSlot[] = []
  for (const day of APP_CONFIG.daysOfWeek) {
    for (const hour of APP_CONFIG.availableHours) {
      if (matrix[day]?.[hour]?.count === APP_CONFIG.expectedPlayers) {
        slots.push({ day_of_week: day, start_hour: hour })
      }
    }
  }
  return slots
}

export function buildPlayerAvailabilitySet(availabilities: Availability[]): Set<string> {
  return new Set(availabilities.map(a => `${a.day_of_week}-${a.start_hour}`))
}

export function slotKey(day: number, hour: number): string {
  return `${day}-${hour}`
}
