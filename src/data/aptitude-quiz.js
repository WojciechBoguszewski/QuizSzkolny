import { parseQuizCatalog } from '../lib/quiz-model.js'
import { aptitudeQuestions } from './quizzes.js'

const options = [
  'Zdecydowanie nie',
  'Raczej nie',
  'Czasem tak, czasem nie',
  'Raczej tak',
  'Zdecydowanie tak',
].map((text, points) => ({ id: String(points), text }))

const categoryNames = new Map([
  ['matematyczne', 'Matematyczne'],
  ['technologiczno_informatyczne', 'Technologiczno-informatyczne'],
  ['przyrodnicze', 'Przyrodnicze'],
  ['naukowo_analityczne', 'Naukowo-analityczne'],
  ['tworcze', 'Twórcze'],
  ['przedsiebiorczo_innowacyjne', 'Przedsiębiorczo-innowacyjne'],
  ['przywodcze', 'Przywódcze'],
  ['jezykowe', 'Językowe'],
  ['literackie', 'Literackie'],
  ['plastyczne', 'Plastyczne'],
  ['muzyczne', 'Muzyczne'],
  ['aktorskie', 'Aktorskie'],
  ['sportowe', 'Sportowe'],
])

// Cztery stwierdzenia na kategorię, w kolejności pełnego kwestionariusza.
const demoIds = new Set([
  25, 49, 73, 84, // Matematyczne
  1, 14, 62, 85, // Technologiczno-informatyczne
  2, 15, 38, 74, // Przyrodnicze
  4, 16, 52, 88, // Twórcze
  7, 19, 43, 67, // Językowe
])
const demoQuestions = aptitudeQuestions.filter(({ id }) => demoIds.has(id))
const description = 'Oceń, w jakim stopniu każde stwierdzenie do Ciebie pasuje.'

function questionnaire(id, questions) {
  return {
    id,
    title: 'Kwestionariusz uzdolnień',
    description,
    questions: questions.map(({ id: questionId, text }) => ({ id: String(questionId), text, options })),
  }
}

export const [aptitudeDemo, aptitudeQuiz] = parseQuizCatalog({
  quizzes: [
    questionnaire('uzdolnienia-demo', demoQuestions),
    questionnaire('uzdolnienia', aptitudeQuestions),
  ],
})

const questionsByQuiz = new Map([
  [aptitudeDemo, demoQuestions],
  [aptitudeQuiz, aptitudeQuestions],
])

// Wywoływane po ukończeniu ankiety, kiedy każda odpowiedź przeszła walidację.
export function scoreAptitudeQuiz(quiz, answers) {
  const questions = questionsByQuiz.get(quiz)
  if (!questions) return null

  const categories = new Map()
  const maxPoints = options.length - 1
  for (const { id, category, isReversed } of questions) {
    const result = categories.get(category) ?? { name: categoryNames.get(category), points: 0, max: 0 }
    const points = Number(answers[id])
    result.points += isReversed ? maxPoints - points : points
    result.max += maxPoints
    categories.set(category, result)
  }

  return [...categoryNames.keys()].filter((category) => categories.has(category)).map((category) => categories.get(category))
}
