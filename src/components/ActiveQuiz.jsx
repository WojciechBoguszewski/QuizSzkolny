import { useState } from 'react'
import { useQuizProgress } from '../hooks/useQuizProgress.js'
import { createQuizStore, quizSaveKey } from '../lib/quiz-model.js'
import QuizSession from './QuizSession.jsx'

export default function ActiveQuiz({ quiz, uid, database, records }) {
  const saveKey = quizSaveKey(quiz)
  const [cloudStatus, setCloudStatus] = useState(null)

  const [store] = useState(() => {
    if (!uid) return createQuizStore(quiz)
    let writeNumber = 0
    const storage = {
      getItem: () => records.get(saveKey) ?? null,
      setItem: (_, payload) => {
        const operation = ++writeNumber
        setCloudStatus('saving')
        const finish = (status) => {
          if (operation === writeNumber) setCloudStatus(status)
        }
        database.save(uid, saveKey, payload).then(
          () => finish('saved'),
          () => finish('unavailable'),
        )
      },
      removeItem: () => {},
    }
    return createQuizStore(quiz, { storage })
  })
  const attempt = useQuizProgress(store)

  async function resetProgress() {
    if (uid) {
      try {
        await database.delete(uid, saveKey)
      } catch {
        return false
      }
      setCloudStatus(null)
    }
    return attempt.resetProgress()
  }

  return (
    <QuizSession quiz={quiz} attempt={{
      ...attempt,
      resetProgress,
      saveStatus: cloudStatus ?? attempt.saveStatus,
    }} isCloud={Boolean(uid)} />
  )
}
