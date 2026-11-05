import { parseQuizCatalog } from '../lib/quiz-model.js'

/** Configure a URL or replace this adapter with the real database client. */
export async function loadQuizCatalog({ url, signal, request = globalThis.fetch } = {}) {
  if (!url?.trim()) return { status: 'not-configured', quizzes: [] }
  const response = await request(url, {
    signal,
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Quiz source returned HTTP ${response.status}.`)
  const quizzes = parseQuizCatalog(await response.json())
  return { status: 'ready', quizzes }
}
