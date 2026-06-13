export function haptic(ms: number = 8) {
  navigator.vibrate?.(ms)
}
