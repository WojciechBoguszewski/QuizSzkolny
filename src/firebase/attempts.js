import {
  collection, connectFirestoreEmulator, deleteDoc, doc, getFirestore,
  onSnapshot, setDoc,
} from 'firebase/firestore'

export function createAttemptsClient(app, useEmulators) {
  const db = getFirestore(app)
  if (useEmulators) connectFirestoreEmulator(db, '127.0.0.1', 8080)

  const attempts = (uid) => collection(db, 'users', uid, 'attempts')
  const attempt = (uid, key) => doc(attempts(uid), key)

  return {
    observe: (uid, resolve, reject) => {
      let loaded = false
      return onSnapshot(attempts(uid), { includeMetadataChanges: true }, (snapshot) => {
        if (!loaded && snapshot.metadata.fromCache) return
        loaded = true
        resolve(new Map(snapshot.docs.map((item) => [item.id, item.data().payload])))
      }, reject)
    },
    save: (uid, key, payload) => setDoc(attempt(uid, key), { payload }),
    delete: (uid, key) => deleteDoc(attempt(uid, key)),
  }
}
