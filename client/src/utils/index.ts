export function replaceDate(date: Date, isShortView = false) {
  return new Date(date).toLocaleDateString(
    'ru-RU',
    isShortView ? { day: 'numeric', month: 'short' } : {},
  )
}

export function replaceDateTime(date: Date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
