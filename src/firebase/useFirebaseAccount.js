import { useEffect, useState } from 'react'

const configured = Boolean(import.meta.env.VITE_FIREBASE_CONFIG?.trim())
const useEmulators = import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULATORS === 'true'

let clientPromise
function loadClient() {
  clientPromise ??= import('./client.js').then(({ createFirebaseClient }) => {
    const config = configured
      ? JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG)
      : { apiKey: 'demo-quizszkolny', projectId: 'demo-quizszkolny' }
    return createFirebaseClient(config, useEmulators)
  })
  return clientPromise
}

export function useFirebaseAccount() {
  const [account, setAccount] = useState({
    status: configured || useEmulators ? 'loading' : 'unavailable',
    client: null,
    user: null,
  })

  useEffect(() => {
    if (!configured && !useEmulators) return
    let active = true
    let unsubscribe
    const showFailure = () => {
      if (active) setAccount({ status: 'error', client: null, user: null })
    }
    loadClient().then((client) => {
      if (!active) return
      unsubscribe = client.observeUser((user) => {
        if (active) setAccount({ status: 'ready', client, user })
      }).catch(showFailure)
    }).catch(showFailure)

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  return account
}
