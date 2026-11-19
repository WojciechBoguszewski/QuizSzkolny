import { parseQuizCatalog } from '../lib/quiz-model.js'
import { aptitudeQuiz } from './aptitude-quiz.js'
import { subjectQuizzes } from './subject-quizzes.js'

const builtInQuizzes = [...parseQuizCatalog({ quizzes: subjectQuizzes }), aptitudeQuiz]

export async function loadQuizCatalog({ url, signal, request = globalThis.fetch } = {}) {
  const source = url?.trim()
  if (!source) return { status: 'ready', quizzes: builtInQuizzes }
  const response = await request(source, {
    signal,
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Quiz source returned HTTP ${response.status}.`)
  const quizzes = parseQuizCatalog(await response.json())
  return { status: 'ready', quizzes }
}
