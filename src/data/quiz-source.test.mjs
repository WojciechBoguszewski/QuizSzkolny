import test from 'node:test'
import assert from 'node:assert/strict'
import { loadQuizCatalog } from './quiz-source.js'

const data = { quizzes: [{ id: 'test', title: 'Test', questions: [{
  id: 'q1', text: 'Treść kontrolna', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
}] }] }

test('unconfigured data is explicit and does not make a network request', async () => {
  const result = await loadQuizCatalog({ request: () => { throw new Error('Unexpected request') } })
  assert.equal(result.status, 'not-configured')
})

test('the adapter reads and validates the configured source', async () => {
  const result = await loadQuizCatalog({ url: '/quizzes.json', request: async () => ({ ok: true, json: async () => data }) })
  assert.equal(result.status, 'ready')
  assert.equal(result.quizzes[0].id, 'test')
})

test('a valid empty source stays distinct from missing configuration', async () => {
  const result = await loadQuizCatalog({ url: '/quizzes.json', request: async () => ({ ok: true, json: async () => ({ quizzes: [] }) }) })
  assert.equal(result.status, 'ready')
  assert.deepEqual(result.quizzes, [])
})

test('denials, missing endpoints and server failures never masquerade as an empty catalog', async () => {
  for (const status of [401, 403, 404, 500]) {
    await assert.rejects(loadQuizCatalog({ url: '/quizzes.json', request: async () => ({ ok: false, status }) }), /HTTP/)
  }
})

test('malformed JSON, malformed quiz data and network failures are errors', async () => {
  for (const request of [
    async () => ({ ok: true, json: async () => { throw new SyntaxError('Invalid JSON') } }),
    async () => ({ ok: true, json: async () => ({ quizzes: [{}] }) }),
    async () => { throw new Error('Network unavailable') },
  ]) await assert.rejects(loadQuizCatalog({ url: '/quizzes.json', request }))
})

test('the request receives cancellation so unmounted pages cannot finish a stale load', async () => {
  const controller = new AbortController()
  const request = (url, { signal }) => new Promise((resolve, reject) => {
    assert.equal(url, '/quizzes.json')
    signal.addEventListener('abort', () => reject(signal.reason), { once: true })
  })
  const pending = loadQuizCatalog({ url: '/quizzes.json', signal: controller.signal, request })
  controller.abort()
  await assert.rejects(pending, { name: 'AbortError' })
})
