import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

async function loadUtility(name, env = {}, response = new Response(null, { status: 204 })) {
  const requests = []
  const context = vm.createContext({
    URL, FormData,
    window: { location: { origin: 'https://portal.example.com' } },
    fetch: async (url, options) => {
      requests.push({ url: String(url), ...options })
      return response
    }
  })
  const module = new vm.SourceTextModule(
    await readFile(new URL(`../src/utils/${name}.js`, import.meta.url), 'utf8'),
    { context, initializeImportMeta(meta) { meta.env = env } }
  )
  await module.link(() => new vm.SyntheticModule(['scopedAuth'], function () {
    this.setExport('scopedAuth', { token: { value: 'scoped-token' } })
  }, { context }))
  await module.evaluate()
  return { ...module.namespace, requests }
}

for (const [base, expected] of [
  [undefined, 'https://api.plateit.co.uk/v3/orders/123'],
  ['https://api.plateit.co.uk', 'https://api.plateit.co.uk/v3/orders/123'],
  ['/api', 'https://portal.example.com/api/v3/orders/123'],
  ['/api/', 'https://portal.example.com/api/v3/orders/123'],
  ['https://proxy.example.com/plateit', 'https://proxy.example.com/plateit/v3/orders/123']
]) {
  const { apiFetch, requests } = await loadUtility('apiFetch', { VITE_API_URL: base },
    new Response('{"id":123}', { headers: { 'content-type': 'application/json' } }))
  assert.equal((await apiFetch('/v3/orders/123', { query: { with: ['documents'] } })).id, 123)
  const url = new URL(requests[0].url)
  assert.equal(url.origin + url.pathname, expected)
  assert.equal(url.searchParams.get('with[0]'), 'documents')
  assert.equal(requests[0].headers.Authorization, 'Bearer scoped-token')
}

const file = new File(['document image bytes'], 'document.jpg', { type: 'image/jpeg' })
const signedUrl = 'https://storage.example.com/image?signature=abc%2Fdef&expires=123'
const storageHeaders = { 'Content-Type': 'image/jpeg', 'x-amz-meta-test': 'signed value' }
{
  const { uploadFileToStorage, requests } = await loadUtility('storageUpload')
  await uploadFileToStorage(signedUrl, storageHeaders, file)
  assert.equal(requests[0].url, signedUrl)
  assert.equal(requests[0].method, 'PUT')
  assert.equal(requests[0].body, file)
  assert.equal(requests[0].headers, storageHeaders)
  assert.equal(requests[0].headers.Authorization, undefined)
}
for (const proxy of ['/uploads', 'https://proxy.example.com/uploads']) {
  const { uploadFileToStorage, requests } = await loadUtility('storageUpload', { VITE_UPLOAD_PROXY_URL: proxy })
  await uploadFileToStorage(signedUrl, storageHeaders, file)
  const request = requests[0]
  assert.equal(request.url, new URL(proxy, 'https://portal.example.com').href)
  assert.equal(request.method, 'POST')
  assert.equal(request.headers.Authorization, 'Bearer scoped-token')
  assert.equal(request.headers['Content-Type'], undefined)
  assert.deepEqual(JSON.parse(request.body.get('upload')), { url: signedUrl, headers: storageHeaders })
  assert.equal(await request.body.get('file').text(), await file.text())
  assert.equal(request.body.get('file').name, 'document.jpg')
}
for (const [status, body, expectedMessage] of [
  [401, '{"message":"Session expired."}', 'Session expired.'],
  [413, 'Request too large', 'The file upload failed with status 413.'],
  [502, '', 'The file upload failed with status 502.']
]) {
  const { uploadFileToStorage } = await loadUtility('storageUpload', { VITE_UPLOAD_PROXY_URL: '/uploads' }, new Response(body, { status }))
  await assert.rejects(uploadFileToStorage(signedUrl, storageHeaders, file), error => error.status === status && error.message === expectedMessage)
}
{
  const { uploadFileToStorage } = await loadUtility('storageUpload', {}, new Response('', { status: 401 }))
  await assert.rejects(uploadFileToStorage(signedUrl, storageHeaders, file), error => error.status === undefined)
}
console.log('API base paths, direct/proxied uploads, token boundaries and proxy errors passed.')
