import { useEffect, useState } from 'react'

export function useAccountAttempts(account) {
  const { client, user } = account
  const uid = user?.uid
  const [attempts, setAttempts] = useState({ status: 'loading', records: null })
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!uid) return
    let active = true
    let unsubscribe
    function showFailure() {
      if (active) setAttempts({ status: 'error', records: null })
    }
    client.attempts().then((database) => {
      if (!active) return
      unsubscribe = database.observe(uid, (records) => {
        if (active) setAttempts({ status: 'ready', database, records })
      }, showFailure)
    }).catch(showFailure)
    return () => {
      active = false
      unsubscribe?.()
    }
  }, [client, uid, retryCount])

  function retry() {
    setAttempts({ status: 'loading', records: null })
    setRetryCount((count) => count + 1)
  }

  return { ...attempts, retry }
}
