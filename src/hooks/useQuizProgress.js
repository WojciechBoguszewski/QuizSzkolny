import { useSyncExternalStore } from 'react'

/** Create the store outside render or with useMemo; see docs/INTEGRATION.md. */
export function useQuizProgress(store) {
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  )

  return {
    ...snapshot,
    setProgress: store.setProgress,
    retrySave: store.retrySave,
    resetProgress: store.resetProgress,
  }
}
