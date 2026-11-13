import { apiFetch } from './apiFetch'

/**
 * Resolves a protected API path into its temporary signed destination URL.
 *
 * @param {string} path
 * @returns {Promise<string>}
 */
export async function resolvePresignedDestination(path) {
  const separator = path.includes('?') ? '&' : '?'

  const response = await apiFetch(
    `${path}${separator}redirect=false`
  )

  if (!response?.url) {
    throw new Error('The destination URL could not be resolved.')
  }

  return response.url
}
