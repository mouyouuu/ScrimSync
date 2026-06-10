export const APP_CONFIG = {
  name: 'ScrimSync',
  teamName: 'Notre équipe',
  description: 'Planifiez les scrims de votre équipe sans friction.',
  expectedPlayers: 5,
  availableHours: [19, 20, 21, 22, 23] as const,
  daysOfWeek: [1, 2, 3, 4, 5, 6, 7] as const,
  timezone: 'Europe/Paris',
  pwa: {
    themeColor: '#09090b',
    backgroundColor: '#09090b',
    shortName: 'ScrimSync',
  },
} as const

export type AvailableHour = (typeof APP_CONFIG.availableHours)[number]
export type DayOfWeek = (typeof APP_CONFIG.daysOfWeek)[number]
