import { computed, ref } from 'vue'

const storageKey = 'scoped_auth'

const token = ref(null)
const orderId = ref(null)
const expiresAt = ref(null)

const isAuthenticated = computed(() => {
  return Boolean(
    token.value &&
    orderId.value &&
    expiresAt.value
  )
})

/**
 * Stores the scoped authentication response for the current tab.
 *
 * @param {string} accessToken
 * @param {number|string} scopedOrderId
 * @param {string} scopedExpiresAt
 * @returns {void}
 */
function setAuth(
  accessToken,
  scopedOrderId,
  scopedExpiresAt
) {
  token.value = accessToken
  orderId.value = scopedOrderId
  expiresAt.value = scopedExpiresAt

  sessionStorage.setItem(
    storageKey,
    JSON.stringify({
      token: accessToken,
      orderId: scopedOrderId,
      expiresAt: scopedExpiresAt
    })
  )
}

/**
 * Restores scoped authentication from the current tab session.
 *
 * @returns {void}
 */
function restoreAuth() {
  const stored = sessionStorage.getItem(storageKey)

  if (!stored) {
    return
  }

  try {
    const parsed = JSON.parse(stored)

    token.value = parsed.token ?? null
    orderId.value = parsed.orderId ?? null
    expiresAt.value = parsed.expiresAt ?? null
  } catch {
    clearAuth()
  }
}

/**
 * Clears the current scoped authentication session.
 *
 * @returns {void}
 */
function clearAuth() {
  token.value = null
  orderId.value = null
  expiresAt.value = null

  sessionStorage.removeItem(storageKey)
}

export const scopedAuth = {
  token,
  orderId,
  expiresAt,
  isAuthenticated,
  setAuth,
  restoreAuth,
  clearAuth
}
