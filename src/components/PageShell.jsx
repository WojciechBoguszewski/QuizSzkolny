export default function PageShell({ children, showBack = false, signedIn = false }) {
  return (
    <div className="qs-app">
      <a className="qs-skip-link" href="#main" onClick={(event) => {
        event.preventDefault()
        document.getElementById('main')?.focus()
      }}>Przejdź do treści</a>
      <div className="qs-shell">
        <header className="qs-header">
          <a className="qs-brand" href="#quizy">QuizSzkolny</a>
          <nav aria-label="Menu">
            {showBack && <a className="qs-header-link" href="#quizy">Quizy</a>}
            <a className="qs-header-link" href="#konto">{signedIn ? 'Konto' : 'Zaloguj się'}</a>
          </nav>
        </header>
        <main className="qs-main" id="main" tabIndex={-1}>{children}</main>
      </div>
    </div>
  )
}
