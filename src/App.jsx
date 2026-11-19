import { useEffect, useState, useSyncExternalStore } from 'react'
import AccountPage from './components/AccountPage.jsx'
import ActiveQuiz from './components/ActiveQuiz.jsx'
import PageShell from './components/PageShell.jsx'
import QuizCatalog from './components/QuizCatalog.jsx'
import { loadQuizCatalog } from './data/quiz-source.js'
import { useAccountAttempts } from './firebase/useAccountAttempts.js'
import { useFirebaseAccount } from './firebase/useFirebaseAccount.js'
import { quizSaveKey } from './lib/quiz-model.js'
import { readQuizRoute } from './lib/quiz-routing.js'
import './App.css'

const subscribeRoute = (listener) => {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}
const currentHash = () => window.location.hash
const serverHash = () => ''

function QuizViews({ route, quiz, catalog, account, onRetry }) {
  const attempts = useAccountAttempts(account)
  const missing = route.kind === 'missing' || (route.kind === 'quiz' && catalog.status === 'ready' && !quiz)

  if (missing) {
    return (
      <>
        <h1 className="qs-page-title">Nie znaleziono quizu.</h1>
        <div className="qs-actions"><a href="#quizy">Wróć do quizów</a></div>
      </>
    )
  }

  if (account.status === 'loading' || (account.user && attempts.status === 'loading')) {
    return <p role="status">Wczytywanie postępu…</p>
  }
  if (account.user && attempts.status === 'error') {
    return (
      <>
        <h1 className="qs-page-title">Nie udało się wczytać postępu.</h1>
        <div className="qs-actions">
          <button className="qs-button" onClick={attempts.retry}>Spróbuj ponownie</button>
        </div>
      </>
    )
  }

  if (quiz) {
    return (
      <ActiveQuiz
        key={quizSaveKey(quiz)} quiz={quiz} uid={account.user?.uid}
        database={attempts.database} records={attempts.records}
      />
    )
  }

  return <QuizCatalog catalog={catalog} records={attempts.records} onRetry={onRetry} />
}

export default function App() {
  const hash = useSyncExternalStore(subscribeRoute, currentHash, serverHash)
  const route = readQuizRoute(hash)
  const account = useFirebaseAccount()
  const [catalog, setCatalog] = useState({ status: 'loading', quizzes: [] })
  const [requestNumber, setRequestNumber] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    loadQuizCatalog({ url: import.meta.env.VITE_QUIZ_DATA_URL, signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setCatalog(result) })
      .catch(() => {
        if (!controller.signal.aborted) setCatalog({ status: 'error', quizzes: [] })
      })
    return () => controller.abort()
  }, [requestNumber])

  const quiz = route.kind === 'quiz' ? catalog.quizzes.find((item) => item.id === route.id) : null
  const isAccountPage = route.kind === 'account'

  useEffect(() => {
    document.title = quiz ? `${quiz.title} · QuizSzkolny` : isAccountPage ? 'Konto · QuizSzkolny' : 'QuizSzkolny'
  }, [quiz, isAccountPage])

  const retry = () => {
    setCatalog({ status: 'loading', quizzes: [] })
    setRequestNumber((previous) => previous + 1)
  }

  return (
    <PageShell showBack={route.kind !== 'catalog'} signedIn={Boolean(account.user)}>
      {isAccountPage
        ? <AccountPage account={account} />
        : <QuizViews key={account.user?.uid ?? 'guest'} route={route} quiz={quiz} catalog={catalog} account={account} onRetry={retry} />}
    </PageShell>
  )
}
