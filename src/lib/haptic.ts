/**
 * Telegram WebApp Haptic Feedback wrapper.
 * Falls back silently if not running inside Telegram.
 */

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
type NotificationType = 'error' | 'success' | 'warning'

function getTg() {
  if (typeof window === 'undefined') return null
  return (window as any).Telegram?.WebApp?.HapticFeedback ?? null
}

/** Light tap — buttons, toggles */
export function hapticLight() {
  const h = getTg()
  if (h) h.impactOccurred('light')
}

/** Medium tap — card open, tab switch */
export function hapticMedium() {
  const h = getTg()
  if (h) h.impactOccurred('medium')
}

/** Heavy tap — significant action */
export function hapticHeavy() {
  const h = getTg()
  if (h) h.impactOccurred('heavy')
}

/** Success notification — goal completed, entry added */
export function hapticSuccess() {
  const h = getTg()
  if (h) h.notificationOccurred('success')
}

/** Warning notification — deadline approaching */
export function hapticWarning() {
  const h = getTg()
  if (h) h.notificationOccurred('warning')
}

/** Error notification — delete goal */
export function hapticError() {
  const h = getTg()
  if (h) h.notificationOccurred('error')
}

/** Selection change — tab switch */
export function hapticSelection() {
  const h = getTg()
  if (h) h.selectionChanged()
}
