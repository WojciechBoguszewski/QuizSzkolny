/**
 * A browser-local progress store. It deliberately knows nothing about questions,
 * scoring, or a database. Use a different key for each quiz (and user, if needed).
 */
export function createQuizProgressStore({
  key,
  initialProgress,
  validate,
  version = 1,
  storage: suppliedStorage,
  now = Date.now,
}) {
  if (typeof key !== 'string' || !key.trim()) {
    throw new TypeError('A non-empty quiz storage key is required.')
  }
  if (!Number.isInteger(version) || version < 1) {
    throw new TypeError('The progress version must be a positive integer.')
  }
  if (typeof validate !== 'function' || !validate(initialProgress)) {
    throw new TypeError('Provide a validator and valid initial progress.')
  }

  // Take JSON snapshots so callers cannot mutate stored progress accidentally.
  const clone = (value) => JSON.parse(JSON.stringify(value))
  const freeze = (value) => {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze)
      Object.freeze(value)
    }
    return value
  }
  const defaults = freeze(clone(initialProgress))
  if (!validate(defaults)) {
    throw new TypeError('Initial progress must be JSON serializable.')
  }
  const listeners = new Set()
  let storage
  let incompatibleVersion = false
  let snapshot = Object.freeze({
    progress: defaults,
    saveStatus: 'ready',
    savedAt: null,
    wasRestored: false,
  })
  const serverSnapshot = snapshot

  const publish = (next) => {
    snapshot = Object.freeze(next)
    listeners.forEach((listener) => listener())
  }

  // Initialization only reads. React StrictMode and a corrupt or newer save
  // must never cause the previous attempt to be overwritten on page load.
  let raw = null
  try {
    storage = suppliedStorage === undefined ? globalThis.localStorage : suppliedStorage
    if (!storage) throw new Error('Browser storage is unavailable.')
    raw = storage.getItem(key)
  } catch {
    snapshot = Object.freeze({ ...snapshot, saveStatus: 'unavailable' })
  }

  if (raw !== null) {
    try {
      const saved = JSON.parse(raw)
      if (!saved || !Number.isInteger(saved.version)) {
        throw new TypeError('Invalid progress envelope.')
      }
      if (saved.version !== version) {
        incompatibleVersion = true
        snapshot = Object.freeze({ ...snapshot, saveStatus: 'incompatible' })
      } else if (
        !Number.isFinite(saved.savedAt) || saved.savedAt < 0 || !validate(saved.progress)
      ) {
        throw new TypeError('Invalid saved progress.')
      } else {
        snapshot = Object.freeze({
          progress: freeze(clone(saved.progress)),
          saveStatus: 'saved',
          savedAt: saved.savedAt,
          wasRestored: true,
        })
      }
    } catch {
      snapshot = Object.freeze({ ...snapshot, saveStatus: 'invalid' })
    }
  }

  const persist = (progress) => {
    if (incompatibleVersion) {
      publish({ ...snapshot, progress, saveStatus: 'incompatible' })
      return false
    }

    try {
      if (!storage) {
        storage = suppliedStorage === undefined ? globalThis.localStorage : suppliedStorage
      }
      const savedAt = now()
      if (!Number.isFinite(savedAt) || savedAt < 0) {
        throw new TypeError('Invalid save timestamp.')
      }
      storage.setItem(key, JSON.stringify({ version, savedAt, progress }))
      publish({ ...snapshot, progress, saveStatus: 'saved', savedAt })
      return true
    } catch {
      publish({ ...snapshot, progress, saveStatus: 'unavailable' })
      return false
    }
  }

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => serverSnapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    /** Save the whole attempt synchronously, before React renders the next step. */
    setProgress: (valueOrUpdater) => {
      const next = typeof valueOrUpdater === 'function'
        ? valueOrUpdater(snapshot.progress)
        : valueOrUpdater
      if (!validate(next)) throw new TypeError('Invalid quiz progress.')
      const progress = freeze(clone(next))
      // Validate after serialization too: undefined, NaN and Dates change in JSON.
      if (!validate(progress)) throw new TypeError('Progress must be JSON serializable.')
      return persist(progress)
    },
    retrySave: () => persist(snapshot.progress),
    /** Call only after the user explicitly chooses to start this quiz again. */
    resetProgress: () => {
      try {
        if (!storage) {
          storage = suppliedStorage === undefined ? globalThis.localStorage : suppliedStorage
        }
        storage.removeItem(key)
        incompatibleVersion = false
        publish({ progress: defaults, saveStatus: 'ready', savedAt: null, wasRestored: false })
        return true
      } catch {
        // A failed reset must not pretend the old attempt was removed.
        publish({ ...snapshot, saveStatus: 'unavailable' })
        return false
      }
    },
  }
}
