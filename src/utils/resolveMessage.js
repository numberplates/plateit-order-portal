/**
 * Resolves a readable message from an API or JavaScript error.
 *
 * @param {unknown} input
 * @param {string} [fallback='Something went wrong.']
 * @returns {string}
 */
export function resolveMessage(input, fallback = 'Something went wrong.') {
  return (
    input?.data?.message ??
    input?.response?._data?.message ??
    input?.message ??
    fallback
  )
}
