import { useEffect, useRef } from 'react'
import { createQuizStore, quizSaveKey } from '../lib/quiz-model.js'
import { quizHref } from '../lib/quiz-routing.js'

function questionCount(count) {
  if (count === 1) return '1 pytanie'
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) return `${count} pytania`
  return `${count} pytań`
}

function quizStatus(quiz, records) {
  const storage = records ? { getItem: () => records.get(quizSaveKey(quiz)) ?? null } : undefined
  const { progress, saveStatus } = createQuizStore(quiz, { storage }).getSnapshot()
  const answered = Object.keys(progress.answers).length
  if (saveStatus !== 'saved' || answered === 0) return { label: 'Rozpocznij', resumable: false }
  if (progress.finished) return { label: 'Zobacz wynik', resumable: false }
  return { label: 'Kontynuuj', resumable: true, answered }
}

function QuizHome({ heading, quiz, records }) {
  const status = quizStatus(quiz, records)
  return (
    <section className="qs-home">
      <p className="qs-home-meta">{questionCount(quiz.questions.length)}</p>
      <h1 ref={heading} tabIndex={-1}>{quiz.title}</h1>
      {quiz.description && <p className="qs-home-description">{quiz.description}</p>}
      <div className="qs-home-start">
        <a className="qs-button qs-button--primary" href={quizHref(quiz.id)}>{status.label}</a>
        {status.resumable && <p className="qs-quiz-resume qs-number">Zapisano {status.answered} / {quiz.questions.length} odpowiedzi</p>}
      </div>
    </section>
  )
}

export default function QuizCatalog({ catalog, records, onRetry }) {
  const heading = useRef(null)
  const singleQuiz = catalog.quizzes.length === 1 ? catalog.quizzes[0] : null
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [singleQuiz])

  if (singleQuiz) return <QuizHome heading={heading} quiz={singleQuiz} records={records} />

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
            const { answered, label, resumable } = quizStatus(quiz, records)
            return (
              <li key={quiz.id}>
                <a className="qs-quiz-row" href={quizHref(quiz.id)}>
                  <div>
                    <p className="qs-quiz-meta">{[quiz.subject, questionCount(quiz.questions.length)].filter(Boolean).join(' · ')}</p>
                    <h2>{quiz.title}</h2>
                    {quiz.description && <p className="qs-quiz-description">{quiz.description}</p>}
                    {resumable && <p className="qs-quiz-resume qs-number">Zapisano {answered} / {quiz.questions.length} odpowiedzi</p>}
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
