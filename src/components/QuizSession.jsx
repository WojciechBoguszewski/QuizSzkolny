import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuizProgress } from '../hooks/useQuizProgress.js'
import { advanceQuiz, createQuizStore, orderedQuestions, scoreQuiz } from '../lib/quiz-model.js'

function ResetConfirmation({ onConfirm, onCancel }) {
  const heading = useRef(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [])
  return (
    <section className="qs-reset" aria-labelledby="reset-title">
      <h2 id="reset-title" ref={heading} tabIndex={-1}>Rozpocząć od nowa?</h2>
      <p>Usunie to zapisane odpowiedzi z tej próby.</p>
      {failed && <p className="qs-feedback" data-state="error" role="alert">Nie udało się usunąć zapisu. Poprzednia próba została zachowana.</p>}
      <div className="qs-actions">
        <button type="button" className="qs-button qs-button--ghost" onClick={onCancel}>Anuluj</button>
        <button type="button" className="qs-button qs-button--primary" onClick={() => {
          if (!onConfirm()) setFailed(true)
        }}>Rozpocznij od nowa</button>
      </div>
    </section>
  )
}

function SaveNotice({ status, onRetry, onRestart, canRestart, restartRef }) {
  if (status === 'ready' && !canRestart) return null
  return (
    <div className="qs-save-line">
      <p className="qs-save-status" data-state={status === 'unavailable' ? 'error' : undefined}
        role={status === 'unavailable' ? 'alert' : 'status'}>
        {status === 'saved' && 'Postęp zapisany w tej przeglądarce.'}
        {status === 'unavailable' && 'Nie udało się zapisać postępu. Nie zamykaj strony.'}
      </p>
      <div className="qs-save-actions">
        {status === 'unavailable' && <button type="button" className="qs-text-button" onClick={onRetry}>Ponów zapis</button>}
        {canRestart && <button type="button" className="qs-text-button" onClick={onRestart} ref={restartRef}>Zacznij od nowa</button>}
      </div>
    </div>
  )
}

function AnswerReview({ result }) {
  return (
    <details className="qs-review">
      <summary>Przejrzyj odpowiedzi</summary>
      <ol>
        {result.rows.map(({ question, answer, correctAnswer, status }, index) => (
          <li key={question.id}>
            <p className="qs-review-number">Pytanie {index + 1}</p>
            <h2>{question.text}</h2>
            <p className="qs-review-answer" data-state={status}>
              {status === 'correct' ? 'Poprawnie. ' : status === 'incorrect' ? 'Błędna odpowiedź. ' : ''}
              Twoja odpowiedź: {answer?.text ?? 'Brak odpowiedzi'}
            </p>
            {status === 'incorrect' && <p>Poprawna odpowiedź: {correctAnswer.text}</p>}
            {question.explanation && <p className="qs-review-explanation">{question.explanation}</p>}
          </li>
        ))}
      </ol>
    </details>
  )
}

export default function QuizSession({ quiz }) {
  const store = useMemo(() => createQuizStore(quiz), [quiz])
  const { progress, setProgress, resetProgress, retrySave, saveStatus } = useQuizProgress(store)
  const [confirmRestart, setConfirmRestart] = useState(false)
  const heading = useRef(null)
  const restartButton = useRef(null)
  const [protectedSave, setProtectedSave] = useState(() => saveStatus === 'invalid' || saveStatus === 'incompatible')
  const blocked = protectedSave || saveStatus === 'invalid' || saveStatus === 'incompatible'
  const questions = orderedQuestions(quiz, progress)
  const question = questions[progress.questionIndex]
  const selected = progress.answers[question.id]
  const answered = Object.keys(progress.answers).length

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [progress.questionIndex, progress.finished, blocked])

  const restart = () => {
    if (!resetProgress()) return false
    setProtectedSave(false)
    setConfirmRestart(false)
    heading.current?.focus({ preventScroll: true })
    return true
  }
  const cancelRestart = () => {
    setConfirmRestart(false)
    restartButton.current?.focus({ preventScroll: true })
  }

  if (blocked) {
    return (
      <>
        <p className="qs-section-label">{quiz.title}</p>
        <h1 className="qs-page-title" ref={heading} tabIndex={-1}>Nie można przywrócić postępu.</h1>
        <p className="qs-page-intro">Poprzedni zapis nie pasuje do tej wersji quizu lub jest uszkodzony. Został zachowany.</p>
        <div className="qs-actions">
          <a className="qs-button qs-button--ghost" href="#quizy">Wróć do quizów</a>
          <button type="button" className="qs-button qs-button--primary" ref={restartButton} onClick={() => setConfirmRestart(true)}>Zacznij od nowa</button>
        </div>
        {confirmRestart && <ResetConfirmation onConfirm={restart} onCancel={cancelRestart} />}
      </>
    )
  }

  if (progress.finished) {
    const result = scoreQuiz(quiz, progress)
    return (
      <>
        <p className="qs-section-label">{quiz.title}</p>
        <h1 className="qs-page-title" ref={heading} tabIndex={-1}>Quiz ukończony.</h1>
        <div className="qs-result">
          <p className="qs-result-number qs-number">
            {result.graded > 0 ? result.correct : result.answered}<span> / {result.graded > 0 ? result.graded : result.total}</span>
          </p>
          <p className="qs-result-caption">{result.graded > 0
            ? result.graded === result.total ? 'Poprawne odpowiedzi' : 'Poprawne odpowiedzi w pytaniach z kluczem'
            : 'Udzielone odpowiedzi'}</p>
        </div>
        <AnswerReview result={result} />
        <div className="qs-actions">
          <a className="qs-button qs-button--ghost" href="#quizy">Wróć do quizów</a>
          <button type="button" className="qs-button qs-button--primary" ref={restartButton} onClick={() => setConfirmRestart(true)}>Jeszcze raz</button>
        </div>
        <SaveNotice status={saveStatus} onRetry={retrySave} canRestart={false} />
        {confirmRestart && <ResetConfirmation onConfirm={restart} onCancel={cancelRestart} />}
      </>
    )
  }

  return (
    <>
      <div className="qs-question__meta">
        <p>{quiz.title}</p>
        <p className="qs-question__count" aria-label={`Pytanie ${progress.questionIndex + 1} z ${questions.length}`}>
          <strong>{String(progress.questionIndex + 1).padStart(2, '0')}</strong> / {questions.length}
        </p>
      </div>
      <h1 className="qs-question__title" id="question-title" ref={heading} tabIndex={-1}>{question.text}</h1>
      <p className="qs-question__hint" id="question-hint">Wybierz jedną odpowiedź.</p>
      <form onSubmit={(event) => { event.preventDefault(); setProgress(advanceQuiz) }}>
        <fieldset className="qs-options" aria-labelledby="question-title" aria-describedby="question-hint">
          <legend className="qs-sr-only">Odpowiedzi</legend>
          {question.options.map((option, index) => (
            <label className="qs-option" key={option.id}>
              <input type="radio" name={`answer-${question.id}`} value={option.id} checked={selected === option.id}
                onChange={() => setProgress((previous) => ({ ...previous, answers: { ...previous.answers, [question.id]: option.id } }))} />
              <span className="qs-option__letter" aria-hidden="true">{index < 26 ? String.fromCharCode(65 + index) : index + 1}</span>
              <span className="qs-option__text">{option.text}</span>
            </label>
          ))}
        </fieldset>
        <div className="qs-actions">
          <button type="button" className="qs-button qs-button--ghost" disabled={progress.questionIndex === 0}
            onClick={() => setProgress((previous) => ({ ...previous, questionIndex: previous.questionIndex - 1 }))}>Wstecz</button>
          <button type="submit" className="qs-button qs-button--primary" disabled={selected === undefined}>
            {progress.questionIndex === questions.length - 1 ? 'Zakończ' : 'Dalej'}
          </button>
        </div>
      </form>
      <SaveNotice status={saveStatus} onRetry={retrySave} onRestart={() => setConfirmRestart(true)}
        canRestart={answered > 0} restartRef={restartButton} />
      {confirmRestart && <ResetConfirmation onConfirm={restart} onCancel={cancelRestart} />}
    </>
  )
}
