import test from 'node:test'
import assert from 'node:assert/strict'
import { createQuizProgressStore } from './quiz-progress.js'

const initialProgress = { questionIndex: 0, answers: {}, finished: false, elapsedMs: 0 }
const validate = (value) => value !== null && typeof value === 'object'
  && Number.isInteger(value.questionIndex) && value.questionIndex >= 0
  && value.answers !== null && typeof value.answers === 'object' && !Array.isArray(value.answers)
  && Object.values(value.answers).every((answer) => typeof answer === 'string')
  && typeof value.finished === 'boolean'
  && Number.isFinite(value.elapsedMs) && value.elapsedMs >= 0

function memoryStorage() {
  const data = new Map()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  }
}

const create = (storage, options = {}) => createQuizProgressStore({
  key: 'quizszkolny:test', initialProgress, validate, storage, now: () => 12345, ...options,
})

test('a fresh mount does not create or overwrite a save', () => {
  const storage = memoryStorage()
  const store = create(storage)
  assert.deepEqual(store.getSnapshot().progress, initialProgress)
  assert.equal(store.getSnapshot().saveStatus, 'ready')
  assert.equal(storage.getItem('quizszkolny:test'), null)
})

test('answers, current question and elapsed time survive an immediate reload', () => {
  const storage = memoryStorage()
  const store = create(storage)
  const attempt = { questionIndex: 4, answers: { q1: 'b', q2: 'd' }, finished: false, elapsedMs: 98765 }
  assert.equal(store.setProgress(attempt), true)
  // A new store is a fresh page load. There is no effect or timeout to flush.
  const restored = create(storage).getSnapshot()
  assert.deepEqual(restored.progress, attempt)
  assert.equal(restored.wasRestored, true)
  assert.equal(restored.savedAt, 12345)
  assert.equal(restored.saveStatus, 'saved')
})

test('the final result stays finished after reload', () => {
  const storage = memoryStorage()
  create(storage).setProgress({ ...initialProgress, finished: true, result: { correct: 8, total: 12 } })
  const restored = create(storage).getSnapshot().progress
  assert.equal(restored.finished, true)
  assert.deepEqual(restored.result, { correct: 8, total: 12 })
})

test('functional updates use the latest state, including rapid consecutive answers', () => {
  const storage = memoryStorage()
  const store = create(storage)
  store.setProgress((previous) => ({ ...previous, answers: { ...previous.answers, q1: 'a' } }))
  store.setProgress((previous) => ({ ...previous, answers: { ...previous.answers, q2: 'c' } }))
  assert.deepEqual(create(storage).getSnapshot().progress.answers, { q1: 'a', q2: 'c' })
})

test('quiz keys keep attempts isolated', () => {
  const storage = memoryStorage()
  create(storage, { key: 'quizszkolny:math' }).setProgress({ ...initialProgress, questionIndex: 3 })
  assert.equal(create(storage, { key: 'quizszkolny:history' }).getSnapshot().progress.questionIndex, 0)
  assert.equal(create(storage, { key: 'quizszkolny:math' }).getSnapshot().progress.questionIndex, 3)
})

test('a corrupt save does not crash the page or get erased by initialization', () => {
  const storage = memoryStorage()
  storage.setItem('quizszkolny:test', '{broken-json')
  const store = create(storage)
  assert.equal(store.getSnapshot().saveStatus, 'invalid')
  assert.deepEqual(store.getSnapshot().progress, initialProgress)
  assert.equal(storage.getItem('quizszkolny:test'), '{broken-json')
})

test('invalid saved answer and timestamp shapes are rejected', () => {
  for (const changes of [
    { progress: { ...initialProgress, questionIndex: -1 } },
    { progress: { ...initialProgress, answers: [] } },
    { savedAt: 'yesterday' },
    { savedAt: -1 },
  ]) {
    const storage = memoryStorage()
    storage.setItem('quizszkolny:test', JSON.stringify({ version: 1, savedAt: 123, progress: initialProgress, ...changes }))
    assert.equal(create(storage).getSnapshot().saveStatus, 'invalid')
  }
})

test('another schema version is preserved until an explicit reset', () => {
  const storage = memoryStorage()
  const raw = JSON.stringify({ version: 2, savedAt: 123, progress: { futureShape: true } })
  storage.setItem('quizszkolny:test', raw)
  const store = create(storage)
  assert.equal(store.getSnapshot().saveStatus, 'incompatible')
  assert.equal(store.setProgress({ ...initialProgress, questionIndex: 1 }), false)
  assert.equal(storage.getItem('quizszkolny:test'), raw)
  assert.equal(store.resetProgress(), true)
  assert.equal(store.setProgress(initialProgress), true)
  assert.equal(create(storage).getSnapshot().saveStatus, 'saved')
})

test('unavailable storage keeps the live attempt and reports that it is not saved', () => {
  const store = create(null)
  assert.equal(store.getSnapshot().saveStatus, 'unavailable')
  assert.equal(store.setProgress({ ...initialProgress, questionIndex: 2 }), false)
  assert.equal(store.getSnapshot().progress.questionIndex, 2)
  assert.equal(store.getSnapshot().savedAt, null)
})

test('read access denial is reported as unavailable, not a damaged save', () => {
  const store = create({ getItem() { throw new Error('SecurityError') } })
  assert.equal(store.getSnapshot().saveStatus, 'unavailable')
})

test('a full storage quota retains the old save and can retry the current attempt', () => {
  const storage = memoryStorage()
  const store = create(storage)
  store.setProgress({ ...initialProgress, questionIndex: 1 })
  const originalSet = storage.setItem
  storage.setItem = () => { throw new Error('QuotaExceededError') }
  assert.equal(store.setProgress({ ...initialProgress, questionIndex: 2 }), false)
  assert.equal(store.getSnapshot().saveStatus, 'unavailable')
  assert.equal(store.getSnapshot().progress.questionIndex, 2)
  assert.equal(create(storage).getSnapshot().progress.questionIndex, 1)
  storage.setItem = originalSet
  assert.equal(store.retrySave(), true)
  assert.equal(create(storage).getSnapshot().progress.questionIndex, 2)
})

test('reset only removes this quiz, and the cleared state survives reload', () => {
  const storage = memoryStorage()
  storage.setItem('unrelated-data', 'keep')
  const store = create(storage)
  store.setProgress({ ...initialProgress, questionIndex: 6 })
  assert.equal(store.resetProgress(), true)
  assert.deepEqual(create(storage).getSnapshot().progress, initialProgress)
  assert.equal(storage.getItem('unrelated-data'), 'keep')
  assert.equal(store.getSnapshot().wasRestored, false)
})

test('a failed reset keeps the attempt in memory and reports failure', () => {
  const storage = memoryStorage()
  const store = create(storage)
  store.setProgress({ ...initialProgress, questionIndex: 6 })
  storage.removeItem = () => { throw new Error('SecurityError') }
  assert.equal(store.resetProgress(), false)
  assert.equal(store.getSnapshot().progress.questionIndex, 6)
  assert.equal(create(storage).getSnapshot().progress.questionIndex, 6)
  assert.equal(store.getSnapshot().saveStatus, 'unavailable')
})

test('invalid writes and mutation cannot damage the previous attempt', () => {
  const storage = memoryStorage()
  const store = create(storage)
  assert.throws(() => store.setProgress({ ...initialProgress, questionIndex: -1 }), TypeError)
  assert.throws(() => { store.getSnapshot().progress.answers.q1 = 'b' }, TypeError)
  const next = { ...initialProgress, answers: { q1: 'a' } }
  store.setProgress(next)
  next.answers.q1 = 'd'
  assert.equal(create(storage).getSnapshot().progress.answers.q1, 'a')
})

test('subscribers receive stable snapshots and unsubscribe cleanly', () => {
  const store = create(memoryStorage())
  let calls = 0
  const initial = store.getSnapshot()
  assert.equal(store.getSnapshot(), initial)
  const unsubscribe = store.subscribe(() => { calls += 1 })
  store.setProgress({ ...initialProgress, questionIndex: 1 })
  assert.equal(calls, 1)
  assert.notEqual(store.getSnapshot(), initial)
  unsubscribe()
  store.setProgress({ ...initialProgress, questionIndex: 2 })
  assert.equal(calls, 1)
})
