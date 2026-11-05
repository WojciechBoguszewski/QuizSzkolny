import { useEffect, useState, useSyncExternalStore } from 'react'
import PageShell from './components/PageShell.jsx'
import QuizCatalog from './components/QuizCatalog.jsx'
import QuizSession from './components/QuizSession.jsx'
import { loadQuizCatalog } from './data/quiz-source.js'
import { readQuizRoute } from './lib/quiz-routing.js'
import './App.css'

const subscribeRoute = (listener) => {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}
const currentHash = () => window.location.hash
const serverHash = () => ''

function App() {
  const hash = useSyncExternalStore(subscribeRoute, currentHash, serverHash)
  const route = readQuizRoute(hash)
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
  useEffect(() => {
    document.title = quiz ? `${quiz.title} · QuizSzkolny` : 'QuizSzkolny'
  }, [quiz])

  const retry = () => {
    setCatalog({ status: 'loading', quizzes: [] })
    setRequestNumber((previous) => previous + 1)
  }

  const missing = route.kind === 'missing' || (route.kind === 'quiz' && catalog.status === 'ready' && !quiz)

  return (
    <PageShell showBack={route.kind !== 'catalog'}>
      {missing ? (
        <>
          <h1 className="qs-page-title">Nie znaleziono quizu.</h1>
          <p className="qs-page-intro">Sprawdź dostępne quizy i wybierz jeden z listy.</p>
          <div className="qs-actions"><a className="qs-button qs-button--primary" href="#quizy">Wróć do quizów</a></div>
        </>
      ) : quiz ? (
        <QuizSession key={quiz.id} quiz={quiz} />
      ) : (
        <QuizCatalog catalog={catalog} onRetry={retry} />
      )}
    </PageShell>
  )
}

export default App
