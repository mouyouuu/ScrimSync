export function validateUrl(url: string): boolean {
  if (!url.trim()) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export function validateScrimForm(data: {
  opponent_name: string
  opponent_opgg_url: string
  day_of_week: number
  start_hour: number
}): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.opponent_name.trim()) {
    errors.opponent_name = "Le nom de l'adversaire est requis"
  }

  if (!data.opponent_opgg_url.trim()) {
    errors.opponent_opgg_url = 'Le lien OP.GG est requis'
  } else if (!validateUrl(data.opponent_opgg_url)) {
    errors.opponent_opgg_url = "L'URL n'est pas valide"
  }

  if (!data.day_of_week || data.day_of_week < 1 || data.day_of_week > 7) {
    errors.day_of_week = 'Le jour est requis'
  }

  if (!data.start_hour) {
    errors.start_hour = "L'heure est requise"
  }

  return errors
}
