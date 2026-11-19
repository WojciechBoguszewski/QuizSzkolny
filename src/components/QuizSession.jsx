import { useEffect, useRef, useState } from 'react'
import { aptitudeQuiz, scoreAptitudeQuiz } from '../data/aptitude-quiz.js'
import { advanceQuiz, orderedQuestions, scoreQuiz } from '../lib/quiz-model.js'

function ResetConfirmation({ onConfirm, onCancel, pending }) {
  const heading = useRef(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [])
  return (
    <section className="qs-reset" aria-labelledby="reset-title">
      <h2 id="reset-title" ref={heading} tabIndex={-1}>Rozpocząć od nowa?</h2>
      <p>Usunie to zapisane odpowiedzi z tej próby.</p>
      {failed && <p className="qs-feedback" data-state="error" role="alert">Nie udało się usunąć zapisu. Poprzednia próba została zachowana.</p>}
      <div className="qs-actions">
        <button type="button" className="qs-button qs-button--ghost" disabled={pending} onClick={onCancel}>Anuluj</button>
        <button type="button" className="qs-button qs-button--primary" disabled={pending} onClick={async () => {
          setFailed(false)
          if (!await onConfirm()) setFailed(true)
        }}>{pending ? 'Resetowanie…' : 'Rozpocznij od nowa'}</button>
      </div>
    </section>
  )
}

function SaveNotice({ status, onRetry, onRestart, canRestart, restartRef, isCloud }) {
  if (status === 'ready' && !canRestart) return null
  return (
    <div className="qs-save-line">
      <p className="qs-save-status" data-state={status === 'unavailable' ? 'error' : undefined}
        role={status === 'unavailable' ? 'alert' : 'status'}>
        {status === 'saving' && 'Zapisywanie postępu na koncie…'}
        {status === 'saved' && (isCloud ? 'Postęp zapisany na koncie.' : 'Postęp zapisany w tej przeglądarce.')}
        {status === 'unavailable' && 'Nie udało się zapisać postępu. Spróbuj ponownie.'}
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

function ScoreChart({ scores, title }) {
  return (
    <section className="qs-score-chart" aria-labelledby="score-chart-title">
      <h2 id="score-chart-title">{title}</h2>
      <ul>
        {scores.map(({ name, points, max }) => (
          <li key={name}>
            <div className="qs-score-label">
              <span>{name}</span><span>{points} / {max} pkt</span>
            </div>
            <div className="qs-score-track" aria-hidden="true">
              <div style={{ width: `${100 * points / max}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function QuizSession({ quiz, attempt, isCloud }) {
  const { progress, setProgress, resetProgress, retrySave, saveStatus } = attempt
  const [confirmRestart, setConfirmRestart] = useState(false)
  const [restartPending, setRestartPending] = useState(false)
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

  const restart = async () => {
    setRestartPending(true)
    const reset = await resetProgress()
    setRestartPending(false)
    if (!reset) return false
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
        {confirmRestart && <ResetConfirmation onConfirm={restart} onCancel={cancelRestart} pending={restartPending} />}
      </>
    )
  }

  if (progress.finished) {
    const result = scoreQuiz(quiz, progress)
    const isAptitudeQuiz = quiz === aptitudeQuiz
    return (
      <>
        <p className="qs-section-label">{quiz.title}</p>
        <h1 className="qs-page-title" ref={heading} tabIndex={-1}>{isAptitudeQuiz ? 'Wynik kwestionariusza' : 'Quiz ukończony.'}</h1>
        {isAptitudeQuiz ? <ScoreChart scores={scoreAptitudeQuiz(progress.answers)} title="Wynik według kategorii" /> : (
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
        <AnswerReview result={result} />
        <div className="qs-actions">
          <a className="qs-button qs-button--ghost" href="#quizy">Wróć do quizów</a>
          <button type="button" className="qs-button qs-button--primary" ref={restartButton} onClick={() => setConfirmRestart(true)}>Jeszcze raz</button>
        </div>
        <SaveNotice status={saveStatus} onRetry={retrySave} canRestart={false} isCloud={isCloud} />
        {confirmRestart && <ResetConfirmation onConfirm={restart} onCancel={cancelRestart} pending={restartPending} />}
      </>
    )
  }

  return (
    <>
      <div className="qs-question__meta">
        <p>{quiz.title}</p>
        <p className="qs-question__count" aria-label={`Pytanie ${progress.questionIndex + 1} z ${questions.length}`}>
          {progress.questionIndex + 1} / {questions.length}
        </p>
      </div>
      <h1 className="qs-question__title" id="question-title" ref={heading} tabIndex={-1}>{question.text}</h1>
      <p className="qs-question__hint" id="question-hint">
        {question.correctOptionId !== null && `${question.skill ? question.skill + ' · ' : ''}${question.points} pkt. `}
        Wybierz jedną odpowiedź.
      </p>
      <form onSubmit={(event) => { event.preventDefault(); setProgress(advanceQuiz) }}>
        <fieldset className="qs-options" disabled={confirmRestart} aria-labelledby="question-title" aria-describedby="question-hint">
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
          <button type="button" className="qs-button qs-button--ghost" disabled={confirmRestart || progress.questionIndex === 0}
            onClick={() => setProgress((previous) => ({ ...previous, questionIndex: previous.questionIndex - 1 }))}>Wstecz</button>
          <button type="submit" className="qs-button qs-button--primary" disabled={confirmRestart || selected === undefined}>
            {progress.questionIndex === questions.length - 1 ? 'Zakończ' : 'Dalej'}
          </button>
        </div>
      </form>
      <SaveNotice status={saveStatus} onRetry={retrySave} onRestart={() => setConfirmRestart(true)}
        canRestart={answered > 0} restartRef={restartButton} isCloud={isCloud} />
      {confirmRestart && <ResetConfirmation onConfirm={restart} onCancel={cancelRestart} pending={restartPending} />}
    </>
  )
}
