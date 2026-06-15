const DAY_NAMES_SHORT = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const DAY_NAMES_LONG = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const MONTH_NAMES = [
  'jan.', 'fév.', 'mar.', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sep.', 'oct.', 'nov.', 'déc.',
]

export function getCurrentWeekStart(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

export function getWeekStart(date: Date): Date {
  const dayOfWeek = date.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(date)
  monday.setDate(date.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

export function formatWeekStart(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    return day
  })
}

export function getDayFromWeekStart(weekStart: Date, dayOfWeek: number): Date {
  const day = new Date(weekStart)
  day.setDate(weekStart.getDate() + dayOfWeek - 1)
  return day
}

export function formatDayShort(dayOfWeek: number): string {
  return DAY_NAMES_SHORT[dayOfWeek]
}

export function formatDayLong(dayOfWeek: number): string {
  return DAY_NAMES_LONG[dayOfWeek]
}

export function formatShortDayWithDate(weekStart: Date, dayOfWeek: number): string {
  const day = getDayFromWeekStart(weekStart, dayOfWeek)
  return `${DAY_NAMES_SHORT[dayOfWeek]} ${day.getDate()}`
}

export function formatLongDayWithDate(weekStart: Date, dayOfWeek: number): string {
  const day = getDayFromWeekStart(weekStart, dayOfWeek)
  return `${DAY_NAMES_LONG[dayOfWeek]} ${day.getDate()} ${MONTH_NAMES[day.getMonth()]}`
}

export function formatHour(hour: number): string {
  return `${hour}h`
}

export function formatWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const startDay = weekStart.getDate()
  const endDay = weekEnd.getDate()
  const startMonth = MONTH_NAMES[weekStart.getMonth()]
  const endMonth = MONTH_NAMES[weekEnd.getMonth()]

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${startDay} – ${endDay} ${startMonth} ${weekStart.getFullYear()}`
  }
  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${weekStart.getFullYear()}`
}

export function formatScrimDate(weekStart: Date, dayOfWeek: number, hour: number): string {
  const day = getDayFromWeekStart(weekStart, dayOfWeek)
  return `${DAY_NAMES_LONG[dayOfWeek]} ${day.getDate()} ${MONTH_NAMES[day.getMonth()]} à ${hour}h`
}

export function formatScrimDateShort(weekStart: Date, dayOfWeek: number, hour: number): string {
  const day = getDayFromWeekStart(weekStart, dayOfWeek)
  return `${DAY_NAMES_SHORT[dayOfWeek]} ${day.getDate()} ${MONTH_NAMES[day.getMonth()]} · ${hour}h`
}

export function getPreviousWeek(weekStart: Date): Date {
  const prev = new Date(weekStart)
  prev.setDate(weekStart.getDate() - 7)
  return prev
}

export function getNextWeek(weekStart: Date): Date {
  const next = new Date(weekStart)
  next.setDate(weekStart.getDate() + 7)
  return next
}

export function parseWeekStart(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function isCurrentWeek(weekStart: Date): boolean {
  const current = getCurrentWeekStart()
  return formatWeekStart(weekStart) === formatWeekStart(current)
}

export function formatEventDate(eventDate: string, eventTime: string): string {
  const [year, month, day] = eventDate.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const jsDay = d.getDay()
  const dayIndex = jsDay === 0 ? 7 : jsDay
  return `${DAY_NAMES_LONG[dayIndex]} ${day} ${MONTH_NAMES[month - 1]} à ${eventTime.slice(0, 5)}`
}

export function isEventPast(eventDate: string, eventTime: string): boolean {
  const [year, month, day] = eventDate.split('-').map(Number)
  const [h, m] = eventTime.split(':').map(Number)
  return new Date(year, month - 1, day, h, m) < new Date()
}
