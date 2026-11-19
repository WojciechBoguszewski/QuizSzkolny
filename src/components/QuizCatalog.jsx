import { useEffect, useRef } from 'react'
import { createQuizStore, quizSaveKey } from '../lib/quiz-model.js'
import { quizHref } from '../lib/quiz-routing.js'

function questionCount(count) {
  if (count === 1) return '1 pytanie'
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) return `${count} pytania`
  return `${count} pytań`
}

export default function QuizCatalog({ catalog, records, onRetry }) {
  const heading = useRef(null)
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [])

  return (
    <>
      <h1 className="qs-page-title" ref={heading} tabIndex={-1}>Quizy</h1>

      {catalog.status === 'loading' && <p className="qs-empty" role="status">Wczytywanie quizów…</p>}
      {catalog.status === 'error' && (
        <div className="qs-empty" role="alert">
          <p>Nie udało się wczytać quizów.</p>
          <button className="qs-button qs-button--secondary" onClick={onRetry}>Spróbuj ponownie</button>
        </div>
      )}
      {catalog.status === 'ready' && catalog.quizzes.length === 0 && <p className="qs-empty">Brak dostępnych quizów.</p>}
      {catalog.status === 'ready' && catalog.quizzes.length > 0 && (
        <ul className="qs-quiz-list">
          {catalog.quizzes.map((quiz) => {
            const storage = records ? { getItem: () => records.get(quizSaveKey(quiz)) ?? null } : undefined
            const { progress, saveStatus } = createQuizStore(quiz, { storage }).getSnapshot()
            const answered = Object.keys(progress.answers).length
            const canResume = saveStatus === 'saved' && answered > 0
            const label = canResume ? progress.finished ? 'Zobacz wynik' : 'Kontynuuj' : 'Rozpocznij'
            return (
              <li key={quiz.id}>
                <a className="qs-quiz-row" href={quizHref(quiz.id)}>
                  <div>
                    <p className="qs-quiz-meta">{[quiz.subject, questionCount(quiz.questions.length)].filter(Boolean).join(' · ')}</p>
                    <h2>{quiz.title}</h2>
                    {quiz.description && <p className="qs-quiz-description">{quiz.description}</p>}
                    {canResume && !progress.finished && <p className="qs-quiz-resume qs-number">Zapisano odpowiedzi: {answered} / {quiz.questions.length}</p>}
                  </div>
                  <span className="qs-quiz-action">{label}</span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
