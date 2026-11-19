import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceQuiz, createQuizStore, orderedQuestions, parseQuizCatalog, scoreQuiz } from './quiz-model.js'
import { quizHref, readQuizRoute } from './quiz-routing.js'

function payload() {
  return { quizzes: [{ id: 'test', title: 'Test', questions: [
    { id: 'q1', text: 'Pytanie kontrolne 1', options: [{ id: 'a', text: 'Opcja A' }, { id: 'b', text: 'Opcja B' }], correctOptionId: 'b' },
    { id: 'q2', text: 'Pytanie kontrolne 2', options: [{ id: 'a', text: 'Opcja A' }, { id: 'b', text: 'Opcja B' }] },
  ] }] }
}
const quiz = () => parseQuizCatalog(payload())[0]
function memoryStorage() {
  const data = new Map()
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) }
}

test('an empty catalog is valid; optional empty strings remain valid', () => {
  assert.deepEqual(parseQuizCatalog({ quizzes: [] }), [])
  const data = payload()
  Object.assign(data.quizzes[0], { description: '', subject: '  ' })
  data.quizzes[0].questions[0].explanation = ''
  assert.equal(parseQuizCatalog(data)[0].subject, '')
})

test('bad envelopes, empty questions, missing options and unknown answer keys are rejected', () => {
  for (const bad of [null, [], {}, { quizzes: null }, { quizzes: [{}] }]) {
    assert.throws(() => parseQuizCatalog(bad), TypeError)
  }
  for (const change of [
    (data) => { data.quizzes[0].questions = [] },
    (data) => { data.quizzes[0].questions[0].options = [] },
    (data) => { data.quizzes[0].questions[0].text = ' ' },
    (data) => { data.quizzes[0].questions[0].correctOptionId = 'unknown' },
    (data) => { data.quizzes[0].questions[0].points = -2 },
    (data) => { data.quizzes[0].questions[0].points = '2' },
  ]) {
    const data = payload()
    change(data)
    assert.throws(() => parseQuizCatalog(data), TypeError)
  }
})

test('duplicate quiz, question and option IDs cannot mix answers', () => {
  for (const change of [
    (data) => { data.quizzes.push(data.quizzes[0]) },
    (data) => { data.quizzes[0].questions.push(data.quizzes[0].questions[0]) },
    (data) => { data.quizzes[0].questions[0].options.push(data.quizzes[0].questions[0].options[0]) },
  ]) {
    const data = payload()
    change(data)
    assert.throws(() => parseQuizCatalog(data), /Duplicate/)
  }
})

test('the application model restores answers and current position after reload', () => {
  const storage = memoryStorage()
  const store = createQuizStore(quiz(), { storage })
  store.setProgress((previous) => ({ ...previous, answers: { q1: 'b' } }))
  store.setProgress(advanceQuiz)
  const restored = createQuizStore(quiz(), { storage }).getSnapshot()
  assert.equal(restored.progress.questionIndex, 1)
  assert.equal(restored.progress.answers.q1, 'b')
  assert.equal(restored.wasRestored, true)
})

test('saved order is preserved when the source reorders existing questions', () => {
  const storage = memoryStorage()
  const original = quiz()
  createQuizStore(original, { storage }).setProgress((previous) => ({ ...previous, answers: { q1: 'b' } }))
  const reordered = { ...original, questions: [...original.questions].reverse() }
  const restored = createQuizStore(reordered, { storage }).getSnapshot()
  assert.equal(restored.saveStatus, 'saved')
  assert.deepEqual(orderedQuestions(reordered, restored.progress).map((item) => item.id), ['q1', 'q2'])
})

test('answers for removed options are protected and become readable if the source is restored', () => {
  const storage = memoryStorage()
  const original = quiz()
  createQuizStore(original, { storage }).setProgress((previous) => ({ ...previous, answers: { q1: 'b' } }))
  const changed = structuredClone(original)
  changed.questions[0].options[1].id = 'changed'
  changed.questions[0].correctOptionId = 'changed'
  assert.equal(createQuizStore(changed, { storage }).getSnapshot().saveStatus, 'invalid')
  assert.equal(createQuizStore(original, { storage }).getSnapshot().progress.answers.q1, 'b')
})

test('question bounds, answer IDs, duplicate order and incomplete finished attempts are rejected', () => {
  const store = createQuizStore(quiz(), { storage: memoryStorage() })
  const initial = store.getSnapshot().progress
  for (const invalid of [
    { ...initial, questionIndex: 2 },
    { ...initial, questionOrder: ['q1', 'q1'] },
    { ...initial, answers: { q1: 'missing' } },
    { ...initial, answers: { missing: 'a' } },
    { ...initial, finished: true },
  ]) assert.throws(() => store.setProgress(invalid), TypeError)
})

test('quiz revisions have separate saves', () => {
  const storage = memoryStorage()
  const original = quiz()
  createQuizStore(original, { storage }).setProgress((previous) => ({ ...previous, answers: { q1: 'b' } }))
  assert.deepEqual(createQuizStore({ ...original, revision: '2' }, { storage }).getSnapshot().progress.answers, {})
  assert.equal(createQuizStore(original, { storage }).getSnapshot().progress.answers.q1, 'b')
})

test('next requires an answer and completion routes back to any skipped question', () => {
  const initial = createQuizStore(quiz(), { storage: memoryStorage() }).getSnapshot().progress
  assert.equal(advanceQuiz(initial), initial)
  const skipped = { ...initial, questionIndex: 1, answers: { q2: 'a' } }
  assert.equal(advanceQuiz(skipped).questionIndex, 0)
  const completed = advanceQuiz({ ...skipped, answers: { q1: 'b', q2: 'a' } })
  assert.equal(completed.finished, true)
})

test('scoring excludes ungraded questions and distinguishes unanswered from wrong', () => {
  const current = quiz()
  const state = createQuizStore(current, { storage: memoryStorage() }).getSnapshot().progress
  const partial = scoreQuiz(current, { ...state, answers: { q2: 'a' } })
  assert.equal(partial.rows[0].status, 'unanswered')
  assert.equal(partial.rows[1].status, 'ungraded')
  const correct = scoreQuiz(current, { ...state, answers: { q1: 'b', q2: 'a' } })
  assert.equal(correct.correct, 1)
  assert.equal(correct.graded, 1)
  assert.equal(correct.total, 2)
  const wrong = scoreQuiz(current, { ...state, answers: { q1: 'a' } })
  assert.equal(wrong.rows[0].status, 'incorrect')
  assert.equal(wrong.rows[0].correctAnswer.id, 'b')
})

test('skill results use question weights and exclude questions without a key', () => {
  const data = payload()
  const [first, second] = data.quizzes[0].questions
  Object.assign(first, { points: 2, skill: 'Równania' })
  Object.assign(second, { points: 3, skill: 'Geometria' })
  data.quizzes[0].questions.push({ ...second, id: 'q3', correctOptionId: 'a' })
  const current = parseQuizCatalog(data)[0]
  const initial = createQuizStore(current, { storage: memoryStorage() }).getSnapshot().progress
  const result = scoreQuiz(current, { ...initial, answers: { q1: 'b', q2: 'a', q3: 'b' } })
  assert.equal(result.points, 2)
  assert.equal(result.maxPoints, 5)
  assert.deepEqual(result.skills, [
    { name: 'Równania', points: 2, max: 2 },
    { name: 'Geometria', points: 0, max: 3 },
  ])
})

test('special IDs are handled as data, without prototype collisions', () => {
  const data = payload()
  data.quizzes[0].id = 'żółć / 1'
  data.quizzes[0].questions[0].id = '__proto__'
  const current = parseQuizCatalog(data)[0]
  const storage = memoryStorage()
  const store = createQuizStore(current, { storage })
  store.setProgress((previous) => ({ ...previous, answers: { ['__proto__']: 'b' } }))
  assert.equal(createQuizStore(current, { storage }).getSnapshot().progress.answers['__proto__'], 'b')
  assert.equal(scoreQuiz(current, store.getSnapshot().progress).correct, 1)
})

test('hash routes support reloads, encoded IDs and malformed links without throwing', () => {
  assert.deepEqual(readQuizRoute(quizHref('żółć / 1')), { kind: 'quiz', id: 'żółć / 1' })
  assert.deepEqual(readQuizRoute('#konto'), { kind: 'account' })
  for (const hash of ['', '#', '#quizy']) assert.equal(readQuizRoute(hash).kind, 'catalog')
  for (const hash of ['#quiz/', '#quiz/%zz', '#unknown']) assert.equal(readQuizRoute(hash).kind, 'missing')
})
