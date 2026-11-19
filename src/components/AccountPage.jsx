import { useState } from 'react'

const authMessages = {
  'auth/invalid-credential': 'Sprawdź adres e-mail i hasło.',
  'auth/user-disabled': 'To konto jest wyłączone.',
  'auth/email-already-in-use': 'Użyj innego adresu lub zaloguj się na istniejące konto.',
  'auth/weak-password': 'Wybierz mocniejsze hasło.',
  'auth/invalid-email': 'Podaj poprawny adres e-mail.',
  'auth/too-many-requests': 'Spróbuj ponownie za kilka minut.',
  'auth/network-request-failed': 'Sprawdź połączenie z internetem i spróbuj ponownie.',
}

const titles = {
  login: 'Zaloguj się',
  register: 'Załóż konto',
  reset: 'Zresetuj hasło',
}

export default function AccountPage({ account }) {
  const { status, client, user } = account
  const [mode, setMode] = useState('login')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function changeMode(next) {
    setMode(next)
    setError('')
    setMessage('')
  }

  async function submit(event) {
    event.preventDefault()
    if (pending) return
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email')).trim()
    const password = data.get('password')
    setPending(true)
    setError('')
    setMessage('')
    try {
      if (mode === 'register') await client.register(email, password)
      if (mode === 'login') await client.login(email, password)
      if (mode === 'reset') {
        await client.sendResetLink(email)
        setMessage('Jeśli konto istnieje, otrzymasz e-mail z linkiem do zmiany hasła.')
      }
    } catch (failure) {
      setError(authMessages[failure.code] ?? 'Operacja się nie powiodła. Spróbuj ponownie.')
    } finally {
      setPending(false)
    }
  }

  async function logout() {
    setPending(true)
    setError('')
    try {
      await client.logout()
      changeMode('login')
    } catch {
      setError('Nie udało się wylogować. Spróbuj ponownie.')
    } finally {
      setPending(false)
    }
  }

  if (status !== 'ready') {
    return (
      <>
        <h1 className="qs-page-title">Konto</h1>
        <p className="qs-page-intro" role="status">
          {status === 'loading' ? 'Wczytywanie konta…' : 'Logowanie jest chwilowo niedostępne. Quizy działają w trybie gościa.'}
        </p>
        <div className="qs-actions"><a href="#quizy">Wróć do quizów</a></div>
      </>
    )
  }

  if (user) {
    return (
      <>
        <h1 className="qs-page-title">Twoje konto</h1>
        <p className="qs-page-intro">Zalogowano jako {user.email}.</p>
        {error && <p className="qs-feedback" data-state="error" role="alert">{error}</p>}
        <div className="qs-actions">
          <a href="#quizy">Wróć do quizów</a>
          <button type="button" className="qs-button" disabled={pending} onClick={logout}>Wyloguj się</button>
        </div>
      </>
    )
  }

  return (
    <>
      <h1 className="qs-page-title">{titles[mode]}</h1>
      {mode !== 'reset' && <p className="qs-page-intro">Konto pozwala wznawiać quizy na różnych urządzeniach.</p>}
      <form className="qs-account-form" onSubmit={submit}>
        <label>
          Adres e-mail
          <input name="email" type="email" autoComplete="email" required />
        </label>
        {mode !== 'reset' && (
          <label>
            Hasło
            <input key={mode} name="password" type="password" minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required />
          </label>
        )}
        {error && <p className="qs-feedback" data-state="error" role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <button type="submit" className="qs-button qs-button--primary" disabled={pending}>
          {pending ? 'Proszę czekać…' : mode === 'reset' ? 'Wyślij link' : titles[mode]}
        </button>
      </form>
      <div className="qs-account-links">
        {mode !== 'login' && <button type="button" className="qs-text-button" disabled={pending} onClick={() => changeMode('login')}>Zaloguj się</button>}
        {mode === 'login' && <button type="button" className="qs-text-button" disabled={pending} onClick={() => changeMode('register')}>Załóż konto</button>}
        {mode === 'login' && <button type="button" className="qs-text-button" disabled={pending} onClick={() => changeMode('reset')}>Nie pamiętam hasła</button>}
      </div>
    </>
  )
}
