export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function getOS(): 'ios' | 'android' | 'other' {
  if (typeof window === 'undefined') return 'other'
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  return 'other'
}

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)
}

export const PWA_INSTRUCTIONS = {
  ios: [
    'Ouvrez cette page dans Safari',
    "Appuyez sur l'icône Partager \u{1F4E4}",
    'Sélectionnez "Sur l\'écran d\'accueil"',
    'Appuyez sur "Ajouter"',
  ],
  android: [
    'Ouvrez cette page dans Chrome',
    'Appuyez sur le menu ⋮ (3 points)',
    'Sélectionnez "Ajouter à l\'écran d\'accueil"',
    'Appuyez sur "Ajouter"',
  ],
} as const
