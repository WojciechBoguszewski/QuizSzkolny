# QuizSzkolny

Działający frontend React w zaakceptowanym minimalistycznym stylu: jedna kolumna,
ciepła biel, szeryfowe pytania i odpowiedzi oddzielone liniami.

Strona zawiera listę quizów, rozwiązywanie pytań, powrót do zapisanej próby, wynik,
przegląd odpowiedzi i świadomy reset. Postęp zapisuje się od razu przy zmianie odpowiedzi
lub pytania i jest odtwarzany po odświeżeniu, także po ukończeniu quizu.

## Uruchomienie

```sh
npm ci
npm run dev
```

Bez skonfigurowanego źródła aplikacja pokazuje, że quizy nie są jeszcze dostępne.
Repozytorium nie zawiera własnej bazy pytań. Dane dostarcza osobny moduł.

## Podłączenie bazy

Skopiuj `.env.example` do `.env.local` i ustaw publiczny adres źródła JSON:

```text
VITE_QUIZ_DATA_URL=/quizzes.json
```

To może być plik przygotowany przez autora bazy w `public/` lub endpoint HTTP.
Po zmianie ustawienia uruchom serwer ponownie. Przy budowie produkcyjnej ustawienie
jest odczytywane w trakcie `npm run build`.

Format danych opisano w [docs/DATA_FORMAT.md](docs/DATA_FORMAT.md).
Jeśli baza ma inne API, zmień wyłącznie adapter `src/data/quiz-source.js`, aby zwracał
opisany model. Widoki nie zależą od technologii bazy.

## Sprawdzenie i budowa

```sh
npm test
npm run build
npm run preview
```

Budowa tworzy `dist/`. Względne ścieżki zasobów i nawigacja przez hash obsługują
hosting statyczny także w podkatalogu.

## Najważniejsze pliki

| Plik | Odpowiedzialność |
| --- | --- |
| `src/App.jsx` | Wczytanie katalogu i wybór widoku |
| `src/components/QuizCatalog.jsx` | Lista, wznowienie próby i stany danych |
| `src/components/QuizSession.jsx` | Pytanie, wynik, przegląd odpowiedzi i reset |
| `src/data/quiz-source.js` | Adapter źródła pytań |
| `src/lib/quiz-model.js` | Walidacja danych, kolejności, próby i wynik |
| `src/lib/quiz-progress.js` | Synchroniczny zapis i odczyt `localStorage` |
| `src/styles/quiz.css` | Wspólny styl wszystkich widoków |

Szczegóły połączenia z bazą i ograniczenia zapisu: [docs/INTEGRATION.md](docs/INTEGRATION.md).
Pełna lista zmian: [docs/CHANGES.md](docs/CHANGES.md).
`docs/interface-preview.html` pozostaje statycznym wzorcem zatwierdzonego wyglądu.
