import { scopedAuth } from '../stores/scopedAuth'

const uploadProxyUrl = import.meta.env.VITE_UPLOAD_PROXY_URL

/** Upload directly to storage, or use an external proxy's multipart contract. */
export async function uploadFileToStorage(url, headers, file) {
  let response

  if (uploadProxyUrl) {
    const body = new FormData()
    body.append('upload', JSON.stringify({ url, headers: headers ?? {} }))
    body.append('file', file)

    response = await fetch(new URL(uploadProxyUrl, window.location.origin), {
      method: 'POST',
      headers: scopedAuth.token.value
        ? { Authorization: `Bearer ${scopedAuth.token.value}` }
        : {},
      body
    })
  } else {
    response = await fetch(url, { method: 'PUT', headers, body: file })
  }

  if (!response.ok) {
    let message = `The file upload failed with status ${response.status}.`
    if (uploadProxyUrl) {
      try {
        const data = await response.json()
        if (typeof data?.message === 'string' && data.message) message = data.message
      } catch { /* A proxy may return an empty or non-JSON error response. */ }
    }
    const error = new Error(message)
    // Only an auth error from the proxy should expire scoped order access.
    if (uploadProxyUrl) error.status = response.status
    throw error
  }
}
