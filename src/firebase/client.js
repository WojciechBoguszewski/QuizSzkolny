import { initializeApp } from 'firebase/app'
import {
  connectAuthEmulator, createUserWithEmailAndPassword, getAuth, onAuthStateChanged,
  sendPasswordResetEmail, signInWithEmailAndPassword, signOut,
} from 'firebase/auth'

export function createFirebaseClient(config, useEmulators) {
  const app = initializeApp(config)
  const auth = getAuth(app)
  if (useEmulators) connectAuthEmulator(auth, 'http://127.0.0.1:9099')

  let attemptClient
  return {
    observeUser: (resolve, reject) => onAuthStateChanged(auth, resolve, reject),
    register: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    sendResetLink: (email) => sendPasswordResetEmail(auth, email),
    logout: () => signOut(auth),
    attempts: () => {
      attemptClient ??= import('./attempts.js').then(({ createAttemptsClient }) => createAttemptsClient(app, useEmulators))
      return attemptClient
    },
  }
}
