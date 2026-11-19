import { useEffect, useRef, useState } from 'react'
import { scoreAptitudeQuiz } from '../data/aptitude-quiz.js'
import { advanceQuiz, orderedQuestions, scoreQuiz } from '../lib/quiz-model.js'
import ScoreChart from './ScoreChart.jsx'

function ResetConfirmation({ onConfirm, onCancel, pending }) {
  const dialog = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const element = dialog.current
    const opener = document.activeElement
    element.showModal()
    return () => {
      element.close()
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog className="qs-confirm" ref={dialog} role="alertdialog" aria-labelledby="restart-title"
      aria-describedby="restart-summary" onCancel={(event) => {
        event.preventDefault()
        if (!pending) onCancel()
      }}>
      <h2 id="restart-title">Rozpocząć od nowa?</h2>
      <p id="restart-summary">Zapisane odpowiedzi z tej próby zostaną usunięte.</p>
      {failed && <p className="qs-confirm-error" role="alert">Nie udało się usunąć zapisu. Spróbuj ponownie.</p>}
      <div className="qs-confirm-actions">
        <button type="button" className="qs-button qs-button--ghost" disabled={pending} onClick={onCancel}>Anuluj</button>
        <button type="button" className="qs-button qs-button--primary" disabled={pending} onClick={async () => {
          setFailed(false)
          if (!await onConfirm()) setFailed(true)
        }}>{pending ? 'Resetowanie…' : 'Zacznij od nowa'}</button>
      </div>
    </dialog>
  )
}

function SaveNotice({ status, onRetry, isCloud, disabled }) {
  if (status === 'ready') return null
  return (
    <div className="qs-save-line">
      <p className="qs-save-status" data-state={status === 'unavailable' ? 'error' : undefined}
        role={status === 'unavailable' ? 'alert' : 'status'}>
        {status === 'saving' && 'Zapisywanie postępu na koncie…'}
        {status === 'saved' && (isCloud ? 'Postęp zapisany na koncie.' : 'Postęp zapisany w tej przeglądarce.')}
        {status === 'unavailable' && 'Nie udało się zapisać postępu. Spróbuj ponownie.'}
      </p>
      {status === 'unavailable' && <button type="button" className="qs-text-button" disabled={disabled} onClick={onRetry}>Ponów zapis</button>}
    </div>
  )
}

function AnswerReview({ result }) {
  return (
    <details className="qs-review">
      <summary>Przejrzyj odpowiedzi</summary>
      <ol tabIndex={0} aria-label="Odpowiedzi z tej próby">
        {result.rows.map(({ question, answer, correctAnswer, status }, index) => (
          <li key={question.id}>
            <p className="qs-review-number">
              Pytanie {index + 1}{correctAnswer && ` · ${status === 'correct' ? question.points : 0} / ${question.points} pkt`}
            </p>
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

export default function QuizSession({ quiz, attempt, isCloud }) {
  const { progress, setProgress, resetProgress, retrySave, saveStatus } = attempt
  const [confirmRestart, setConfirmRestart] = useState(false)
  const [restartPending, setRestartPending] = useState(false)
  const heading = useRef(null)
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

  async function restart() {
    setRestartPending(true)
    const reset = await resetProgress()
    setRestartPending(false)
    if (!reset) return false
    setProtectedSave(false)
    setConfirmRestart(false)
    heading.current?.focus({ preventScroll: true })
    return true
  }

  const startRestart = () => setConfirmRestart(true)
  const confirmation = confirmRestart && (
    <ResetConfirmation onConfirm={restart} onCancel={() => setConfirmRestart(false)} pending={restartPending} />
  )
  const saveNotice = <SaveNotice status={saveStatus} onRetry={retrySave} isCloud={isCloud} disabled={restartPending} />

  if (blocked) {
    return (
      <>
        <p className="qs-section-label">{quiz.title}</p>
        <h1 className="qs-page-title" ref={heading} tabIndex={-1}>Nie można przywrócić postępu.</h1>
        <p className="qs-page-intro">Poprzedni zapis nie pasuje do tej wersji quizu lub jest uszkodzony. Został zachowany.</p>
        <div className="qs-actions">
          <a className="qs-button qs-button--ghost" href="#quizy">Wróć na start</a>
          <button type="button" className="qs-button qs-button--primary" disabled={restartPending} onClick={startRestart}>Zacznij od nowa</button>
        </div>
        {confirmation}
      </>
    )
  }

  if (progress.finished) {
    const result = scoreQuiz(quiz, progress)
    const aptitudeScores = scoreAptitudeQuiz(quiz, progress.answers)
    return (
      <>
        {!aptitudeScores && <p className="qs-section-label">{quiz.title}</p>}
        <div className="qs-result-heading">
          <h1 className="qs-page-title" ref={heading} tabIndex={-1}>{aptitudeScores ? 'Wynik kwestionariusza' : 'Quiz ukończony.'}</h1>
          <button type="button" className="qs-text-button" disabled={restartPending} onClick={startRestart}>Zrób jeszcze raz</button>
        </div>
        {saveNotice}
        <AnswerReview result={result} />
        {aptitudeScores ? <ScoreChart scores={aptitudeScores} title="Wynik według kategorii" /> : (
          <div className="qs-result">
            <p className="qs-result-number qs-number">
              {result.graded > 0 ? result.points : result.answered} / {result.graded > 0 ? result.maxPoints : result.total}
              {result.graded > 0 && ' pkt'}
            </p>
            <p className="qs-result-caption">{result.graded > 0
              ? `${result.correct} / ${result.graded} poprawnych odpowiedzi`
              : 'Udzielone odpowiedzi'}</p>
          </div>
        )}
        {result.skills.length > 0 && <ScoreChart scores={result.skills} title="Wynik według umiejętności" />}
        {confirmation}
      </>
    )
  }

  return (
    <>
      <div className="qs-question__meta">
        <p>{quiz.title}</p>
        <div className="qs-question__tools">
          {answered > 0 && <button type="button" className="qs-text-button" disabled={restartPending} onClick={startRestart}>Zacznij od nowa</button>}
          <p className="qs-question__count" aria-label={`Pytanie ${progress.questionIndex + 1} z ${questions.length}`}>
            {progress.questionIndex + 1} / {questions.length}
          </p>
        </div>
      </div>
      <div className="qs-question__progress" aria-hidden="true">
        <div style={{ width: `${100 * (progress.questionIndex + 1) / questions.length}%` }} />
      </div>
      {saveStatus === 'unavailable' && saveNotice}
      <h1 className="qs-question__title" id="question-title" ref={heading} tabIndex={-1}>{question.text}</h1>
      <p className="qs-question__hint" id="question-hint">
        {question.correctOptionId !== null && `${question.skill ? question.skill + ' · ' : ''}${question.points} pkt. `}
        Wybierz jedną odpowiedź.
      </p>
      <form onSubmit={(event) => { event.preventDefault(); setProgress(advanceQuiz) }}>
        <fieldset className="qs-options" disabled={restartPending} aria-labelledby="question-title" aria-describedby="question-hint">
          <legend className="qs-sr-only">Odpowiedzi</legend>
          {question.options.map((option) => (
            <label className="qs-option" key={option.id}>
              <input type="radio" name={`answer-${question.id}`} value={option.id} checked={selected === option.id}
                onChange={() => setProgress((previous) => ({ ...previous, answers: { ...previous.answers, [question.id]: option.id } }))} />
              <span className="qs-option__text">{option.text}</span>
            </label>
          ))}
        </fieldset>
        <div className="qs-actions">
          <button type="button" className="qs-button qs-button--ghost" disabled={restartPending || progress.questionIndex === 0}
            onClick={() => setProgress((previous) => ({ ...previous, questionIndex: previous.questionIndex - 1 }))}>Wstecz</button>
          <button type="submit" className="qs-button qs-button--primary" disabled={restartPending || selected === undefined}>
            {progress.questionIndex === questions.length - 1 ? 'Zakończ' : 'Dalej'}
          </button>
        </div>
      </form>
      {saveStatus !== 'unavailable' && saveNotice}
      {confirmation}
    </>
  )
}
