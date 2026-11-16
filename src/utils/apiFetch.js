import { scopedAuth } from '../stores/scopedAuth'

const apiUrl = import.meta.env.VITE_API_URL || 'https://api.plateit.co.uk'

/**
 * Sends an API request using the scoped bearer token when available.
 *
 * @param {string} path
 * @param {object} [options={}]
 * @returns {Promise<any>}
 */
export async function apiFetch(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (scopedAuth.token.value) {
    headers.Authorization = `Bearer ${scopedAuth.token.value}`
  }

  // Preserve an optional proxy prefix, e.g. /api/v3/orders rather than /v3/orders.
  const base = new URL(apiUrl, window.location.origin)
  base.pathname = `${base.pathname.replace(/\/+$/, '')}/`
  const url = new URL(path.replace(/^\/+/, ''), base)

  if (options.query) {
    appendQuery(url.searchParams, options.query)
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : options.body
  })

  const contentType = response.headers.get('content-type') ?? ''
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const error = new Error(
      data?.message || `The request failed with status ${response.status}.`
    )

    error.status = response.status
    error.data = data

    throw error
  }

  return data
}

/**
 * Appends nested query values using PHP-style bracket notation.
 *
 * @param {URLSearchParams} params
 * @param {object} query
 * @param {string} [prefix='']
 * @returns {void}
 */
function appendQuery(params, query, prefix = '') {
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === null || value === undefined || value === '') {
      continue
    }

    const paramKey = prefix
      ? `${prefix}[${key}]`
      : key

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          appendQuery(params, item, `${paramKey}[${index}]`)
        } else {
          params.append(`${paramKey}[${index}]`, String(item))
        }
      })

      continue
    }

    if (typeof value === 'object') {
      appendQuery(params, value, paramKey)
      continue
    }

    params.append(paramKey, String(value))
  }
}
