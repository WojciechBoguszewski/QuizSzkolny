import { createQuizProgressStore } from './quiz-progress.js'

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

function text(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new TypeError(`Missing or invalid ${label}.`)
  }
  return value.trim()
}

function unique(items, label) {
  if (new Set(items.map((item) => item.id)).size !== items.length) {
    throw new TypeError(`Duplicate ${label} IDs.`)
  }
  return items
}

function optionalText(value, label) {
  if (value == null) return ''
  if (typeof value !== 'string') throw new TypeError(`Invalid ${label}.`)
  return value.trim()
}

/** Public data contract, independent of the database implementation. */
export function parseQuizCatalog(payload) {
  if (!isRecord(payload) || !Array.isArray(payload.quizzes)) {
    throw new TypeError('Expected an object containing a quizzes array.')
  }
  return unique(payload.quizzes.map((quiz) => {
    if (!isRecord(quiz) || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      throw new TypeError('Every quiz must contain questions.')
    }
    const questions = unique(quiz.questions.map((question) => {
      if (!isRecord(question) || !Array.isArray(question.options) || question.options.length < 2) {
        throw new TypeError('Every question needs at least two options.')
      }
      const options = unique(question.options.map((option) => ({
        id: text(option?.id, 'option ID'),
        text: text(option?.text, 'option text'),
      })), 'option')
      const correctOptionId = question.correctOptionId == null
        ? null : text(question.correctOptionId, 'correct option ID')
      if (correctOptionId !== null && !options.some((option) => option.id === correctOptionId)) {
        throw new TypeError('The correct option must exist in the question.')
      }
      return {
        id: text(question.id, 'question ID'),
        text: text(question.text, 'question text'),
        options,
        correctOptionId,
        explanation: optionalText(question.explanation, 'explanation'),
      }
    }), 'question')
    return {
      id: text(quiz.id, 'quiz ID'),
      title: text(quiz.title, 'quiz title'),
      subject: optionalText(quiz.subject, 'subject'),
      description: optionalText(quiz.description, 'description'),
      revision: quiz.revision == null ? '1' : text(quiz.revision, 'quiz revision'),
      questions,
    }
  }), 'quiz')
}

export function createQuizStore(quiz, options = {}) {
  const questionOptions = new Map(quiz.questions.map((question) => [
    question.id, new Set(question.options.map((option) => option.id)),
  ]))
  const validate = (value) => isRecord(value)
    && Number.isInteger(value.questionIndex)
    && value.questionIndex >= 0 && value.questionIndex < quiz.questions.length
    && Array.isArray(value.questionOrder)
    && value.questionOrder.length === quiz.questions.length
    && new Set(value.questionOrder).size === quiz.questions.length
    && value.questionOrder.every((id) => questionOptions.has(id))
    && isRecord(value.answers)
    && Object.entries(value.answers).every(([id, answer]) => questionOptions.get(id)?.has(answer))
    && typeof value.finished === 'boolean'
    && (!value.finished || value.questionOrder.every((id) => Object.hasOwn(value.answers, id)))

  return createQuizProgressStore({
    ...options,
    key: `quizszkolny:progress:${encodeURIComponent(quiz.id)}:${encodeURIComponent(quiz.revision)}`,
    version: 1,
    initialProgress: {
      questionIndex: 0,
      questionOrder: quiz.questions.map((question) => question.id),
      answers: {},
      finished: false,
    },
    validate,
  })
}

export function orderedQuestions(quiz, progress) {
  const byId = new Map(quiz.questions.map((question) => [question.id, question]))
  return progress.questionOrder.map((id) => byId.get(id))
}

export function scoreQuiz(quiz, progress) {
  const rows = orderedQuestions(quiz, progress).map((question) => {
    const answer = question.options.find((option) => option.id === progress.answers[question.id]) ?? null
    const correctAnswer = question.options.find((option) => option.id === question.correctOptionId) ?? null
    const status = answer === null ? 'unanswered' : correctAnswer === null ? 'ungraded'
      : answer.id === correctAnswer.id ? 'correct' : 'incorrect'
    return { question, answer, correctAnswer, status }
  })
  return {
    rows,
    answered: rows.filter((row) => row.answer !== null).length,
    graded: rows.filter((row) => row.correctAnswer !== null).length,
    correct: rows.filter((row) => row.status === 'correct').length,
    total: rows.length,
  }
}

/** Advance only after an answer; completion never skips an unanswered question. */
export function advanceQuiz(progress) {
  if (!Object.hasOwn(progress.answers, progress.questionOrder[progress.questionIndex])) return progress
  if (progress.questionIndex < progress.questionOrder.length - 1) {
    return { ...progress, questionIndex: progress.questionIndex + 1 }
  }
  const missingIndex = progress.questionOrder.findIndex((id) => !Object.hasOwn(progress.answers, id))
  return missingIndex < 0
    ? { ...progress, finished: true }
    : { ...progress, questionIndex: missingIndex }
}
