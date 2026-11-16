/** Normalise login input without changing order references or their leading zeros. */
export function getLoginDetails(orderId, email) {
  const reference = String(orderId ?? '').trim()
  const address = typeof email === 'string' ? email.trim() : ''

  if (!reference || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return null

  return { order_id: reference, email: address }
}
