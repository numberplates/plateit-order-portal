/**
 * Formats a price stored in pence as GBP.
 *
 * @param {number} pence
 * @returns {string}
 */
export function formatPrice(pence = 0) {
  const pounds = Number(pence || 0) / 100

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: Number.isInteger(pounds) ? 0 : 2,
    maximumFractionDigits: 2
  }).format(pounds)
}

/**
 * Formats an ISO date string for display.
 *
 * @param {string|null|undefined} isoString
 * @param {boolean} [includeTime=true]
 * @param {string} [fallback='N/A']
 * @returns {string}
 */
export function formatDateString(
  isoString,
  includeTime = true,
  fallback = 'N/A'
) {
  if (!isoString) {
    return fallback
  }

  const date = new Date(isoString)

  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: '2-digit',
          minute: '2-digit'
        }
      : {})
  }).format(date)
}

/**
 * Converts snake_case text to title case.
 *
 * @param {string|null|undefined} value
 * @returns {string}
 */
export function snakeCaseToTitleCase(value) {
  return String(value ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}
