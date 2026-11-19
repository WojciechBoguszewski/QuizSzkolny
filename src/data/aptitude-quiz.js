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

export const [aptitudeQuiz] = parseQuizCatalog({
  quizzes: [{
    id: 'uzdolnienia',
    title: 'Kwestionariusz uzdolnień',
    description: 'Oceń, w jakim stopniu każde stwierdzenie do Ciebie pasuje.',
    questions: aptitudeQuestions.map(({ id, text }) => ({ id: String(id), text, options })),
  }],
})

// Wywoływane po ukończeniu ankiety, kiedy każda odpowiedź przeszła walidację.
export function scoreAptitudeQuiz(answers) {
  const categories = new Map(Array.from(categoryNames, ([id, name]) => [
    id, { name, points: 0, max: 0 },
  ]))
  const maxPoints = options.length - 1
  for (const { id, category, isReversed } of aptitudeQuestions) {
    const result = categories.get(category)
    const points = Number(answers[id])
    result.points += isReversed ? maxPoints - points : points
    result.max += maxPoints
  }
  return [...categories.values()]
}
