export default function PageShell({ children, showBack = false }) {
  return (
    <div className="qs-app">
      <a className="qs-skip-link" href="#main" onClick={(event) => {
        event.preventDefault()
        document.getElementById('main')?.focus()
      }}>Przejdź do treści</a>
      <div className="qs-shell">
        <header className="qs-header">
          <a className="qs-brand" href="#quizy">QuizSzkolny</a>
          {showBack && <a className="qs-header-link" href="#quizy">Quizy</a>}
        </header>
        <main className="qs-main" id="main" tabIndex={-1}>{children}</main>
      </div>
    </div>
  )
}
