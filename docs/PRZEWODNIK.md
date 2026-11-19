# QuizSzkolny. Przewodnik dla dwojga autorów

## Zacznijcie tutaj

Otwórzcie katalog `quizszkolny` w VSCodium. Po lewej stronie, w **Explorerze**, są pliki projektu. Na Macu można wcisnąć **⌘P**, wpisać np. `QuizSession.jsx` i wybrać plik. **⌘⇧V** otwiera podgląd tego przewodnika.

Jeśli kolega potrzebuje własnej kopii, niech wejdzie do [repozytorium QuizSzkolny](https://github.com/WojciechBoguszewski/QuizSzkolny) i wybierze **Code → Download ZIP**. Po rozpakowaniu otwiera cały folder przez **File → Open Folder**. Do samej prezentacji wystarczy [gotowa strona](https://wojciechboguszewski.github.io/QuizSzkolny/).

### Co jest gdzie

| Miejsce | Co tam znajdziecie |
| --- | --- |
| **GitHub** | Kod, 94 stwierdzenia, sposób liczenia punktów i plik z regułami dostępu do bazy. |
| **GitHub Pages** | Opublikowaną stronę, którą otwiera się w przeglądarce. |
| **Firebase Authentication** | Konta użytkowników, sposób logowania i identyfikator każdego konta, czyli UID. |
| **Cloud Firestore** | Zapisane odpowiedzi i postęp zalogowanych użytkowników. Baza jest w projekcie Firebase `quizszkolny-wb`. |
| **Przeglądarka gościa** | Postęp bez logowania, zapisany w pamięci tej przeglądarki (`localStorage`). |

## Jak znaleźć swoją próbę w Firebase

1. Na [stronie QuizSzkolny](https://wojciechboguszewski.github.io/QuizSzkolny/) wejdźcie w **Zaloguj się**. Użyjcie konta pokazowego albo załóżcie je przez **Załóż konto**. Wróćcie na start i zaznaczcie jedną odpowiedź. Poczekajcie na komunikat **Postęp zapisany na koncie**.
2. W przeglądarce otwórzcie [projekt QuizSzkolny w Firebase](https://console.firebase.google.com/project/quizszkolny-wb/overview) na koncie Google, które ma dostęp do projektu. Konto Google do panelu i konto pokazowe w aplikacji pełnią różne role.
3. Wejdźcie w [Authentication → Users](https://console.firebase.google.com/project/quizszkolny-wb/authentication/users). Znajdźcie adres e-mail konta pokazowego i skopiujcie jego **User UID**. W zakładce **Sign-in method** widać sposób logowania **Email/Password**.
4. Wejdźcie w [Firestore Database → Data](https://console.firebase.google.com/project/quizszkolny-wb/firestore/databases/-default-/data). Otwórzcie `users`, wybierzcie pozycję z tym samym UID, potem `attempts` i dokument `quizszkolny:progress:uzdolnienia:1`.
5. Po prawej stronie dokument zawiera pole **payload**. W środku jest tekst w formacie JSON z odpowiedziami i numerem bieżącego pytania. Wróćcie do aplikacji, kliknijcie **Dalej** i sprawdźcie, czy `questionIndex` wzrósł o 1.

```text
Firestore Database → Data
└── users
    └── UID skopiowany z Authentication
        └── attempts
            └── quizszkolny:progress:uzdolnienia:1
                └── payload
```

Pozycja z UID może być zapisana kursywą. Pod nią jest kolekcja `attempts`, nawet jeśli sama pozycja nie zawiera pól. Jeśli panel jest pusty, sprawdźcie, czy zaznaczyliście odpowiedź **po zalogowaniu** i czy patrzycie na projekt `quizszkolny-wb`. [Jak Firebase pokazuje kolekcje i dokumenty](https://firebase.google.com/docs/firestore/using-console#view_data)

### Jak czytać pole `payload`

| Pole w JSON-ie | Co oznacza |
| --- | --- |
| `version` | Wersja formatu zapisu. |
| `savedAt` | Moment zapisu wyrażony w milisekundach. |
| `progress.questionIndex` | Bieżąca pozycja. Aplikacja liczy ją od zera, więc `1` oznacza drugie pytanie. |
| `progress.questionOrder` | Identyfikatory stwierdzeń w kolejności wyświetlania. |
| `progress.answers` | Odpowiedzi według ID stwierdzeń. Zapis `"1": "3"` oznacza **Raczej tak** dla stwierdzenia o ID 1. |
| `progress.finished` | `true` oznacza ukończoną próbę. Po jej otwarciu aplikacja pokazuje wynik. |

Wynik wykresu jest przeliczany w przeglądarce z zapisanych odpowiedzi. Polecenie **Zrób jeszcze raz** otwiera potwierdzenie. Dopiero potwierdzenie usuwa zapis tej próby. Konto pozostaje dostępne.

## Jak czytać kod, plik po pliku

Otwierajcie pliki w kolejności z tabel. W pierwszym czytaniu wystarczy znaleźć nazwę wskazaną w opisie.

### Od adresu strony do pytania

| Plik | Co w nim obejrzeć |
| --- | --- |
| [`index.html`](../index.html) | Wejście strony. Znajdźcie `id="root"`, czyli miejsce dla aplikacji React. |
| [`src/main.jsx`](../src/main.jsx) | `createRoot` wstawia komponent `App` do tego miejsca. |
| [`src/App.jsx`](../src/App.jsx) | `QuizViews` pokazuje start lub pytanie. `App` przełącza też ekran konta. |
| [`src/lib/quiz-routing.js`](../src/lib/quiz-routing.js) | `readQuizRoute` czyta fragment adresu. `#konto` otwiera konto, `#quiz/uzdolnienia` otwiera kwestionariusz. |
| [`src/components/PageShell.jsx`](../src/components/PageShell.jsx) | Wspólny nagłówek, link na start i link do konta. |
| [`src/components/QuizCatalog.jsx`](../src/components/QuizCatalog.jsx) | `QuizHome` pokazuje tytuł, liczbę pytań oraz **Rozpocznij**, **Kontynuuj** albo **Zobacz wynik**. |
| [`src/data/quiz-source.js`](../src/data/quiz-source.js) | `loadQuizCatalog` domyślnie wybiera jeden wbudowany kwestionariusz. |
| [`src/data/quizzes.js`](../src/data/quizzes.js) | Tu jest lista 94 stwierdzeń. Każde ma `id`, tekst, kategorię i flagę `isReversed`. |

### Od kliknięcia do wykresu

| Plik | Co w nim obejrzeć |
| --- | --- |
| [`src/components/QuizSession.jsx`](../src/components/QuizSession.jsx) | `onChange` zapamiętuje wybór. **Dalej** przechodzi do kolejnego pytania. Tutaj są ekran wyniku, przegląd odpowiedzi i potwierdzenie resetu. |
| [`src/lib/quiz-model.js`](../src/lib/quiz-model.js) | `createQuizStore` sprawdza, czy zapis pasuje do pytań. `advanceQuiz` pilnuje, by udzielić odpowiedzi przed przejściem dalej. |
| [`src/lib/quiz-progress.js`](../src/lib/quiz-progress.js) | Próba jest tu zamieniana na JSON, odczytywana i czyszczona po resecie. |
| [`src/hooks/useQuizProgress.js`](../src/hooks/useQuizProgress.js) | Łączy magazyn próby z Reactem, więc po zmianie odpowiedzi widok reaguje na nowy stan. |
| [`src/data/aptitude-quiz.js`](../src/data/aptitude-quiz.js) | `scoreAptitudeQuiz` sumuje od 0 do 4 punktów za stwierdzenie w danej kategorii. Przy `isReversed: true` odejmuje wartość odpowiedzi od 4. |
| [`src/components/ScoreChart.jsx`](../src/components/ScoreChart.jsx) | `RadarPlot` zamienia stosunek punktów do maksimum na odległość od środka. Przykład obliczenia to 21 z 28 punktów, czyli 75% osi. |
| [`src/index.css`](../src/index.css), [`src/App.css`](../src/App.css) i [`src/styles/quiz.css`](../src/styles/quiz.css) | Podstawowy wygląd i import stylów. W `quiz.css` są kolory, układ pytań, nagłówek wyniku i wygląd radaru. |

### Od zalogowania do zapisu w bazie

| Plik | Co w nim obejrzeć |
| --- | --- |
| [`src/components/AccountPage.jsx`](../src/components/AccountPage.jsx) | Formularz wysyła e-mail i hasło do Firebase Authentication. Są tu też wylogowanie, rejestracja i prośba o link do zmiany hasła. |
| [`src/firebase/useFirebaseAccount.js`](../src/firebase/useFirebaseAccount.js) | Odczytuje konfigurację projektu i śledzi, kto jest zalogowany. |
| [`src/firebase/client.js`](../src/firebase/client.js) | Uruchamia bibliotekę Firebase i wywołuje funkcje logowania. |
| [`src/firebase/useAccountAttempts.js`](../src/firebase/useAccountAttempts.js) | Po zalogowaniu pobiera i śledzi próby dla UID danego konta. |
| [`src/components/ActiveQuiz.jsx`](../src/components/ActiveQuiz.jsx) | Wybiera sposób zapisu. Gość używa pamięci przeglądarki, konto korzysta z Firestore. |
| [`src/firebase/attempts.js`](../src/firebase/attempts.js) | Buduje ścieżkę `users/UID/attempts/ID_próby`. `setDoc` zapisuje, `onSnapshot` odczytuje, a `deleteDoc` usuwa próbę przy resecie. |
| [`firestore.rules`](../firestore.rules) | `isOwner` porównuje UID zalogowanej osoby z UID w ścieżce. W panelu reguły widać w **Firestore Database → Rules**. |
| [`firebase.json`](../firebase.json) | Ustawienia dla Firebase CLI. Wskazują plik reguł, sposób logowania i porty emulatorów. |

## Jak uruchomić i zmienić jedną rzecz

1. Zainstalujcie [Node.js 24](https://nodejs.org/en/download), jeśli polecenie `node -v` nie działa. W VSCodium wybierzcie **Terminal → New Terminal** i upewnijcie się, że otwarty jest katalog projektu.
2. Wpiszcie `npm ci`, potem `npm run dev`. Otwórzcie adres wypisany przez Vite.
3. W [`src/data/quizzes.js`](../src/data/quizzes.js) znajdźcie pierwsze stwierdzenie i poprawcie jego treść. Przy drobnej korekcie zachowajcie `id` oraz kategorię, żeby zapisane odpowiedzi dalej pasowały do stwierdzenia. Zapiszcie plik i sprawdźcie zmianę w przeglądarce.
4. Przed wysłaniem zmian uruchomcie `npm test`, `npm run lint` i `npm run build`. Po wysłaniu zmian na `main` sprawdźcie w repozytorium kartę **Actions** i zadanie **GitHub Pages**.

| Plik | Co wspiera lokalne uruchomienie lub publikację |
| --- | --- |
| [`package.json`](../package.json) i [`package-lock.json`](../package-lock.json) | Polecenia npm i wersje bibliotek. `npm ci` instaluje wersje zapisane w pliku lock. |
| [`vite.config.js`](../vite.config.js) | Ustawienia Vite i względne adresy plików potrzebne na GitHub Pages. |
| [`eslint.config.js`](../eslint.config.js) | Zasady sprawdzania kodu poleceniem `npm run lint`. |
| [`src/data/quiz-source.test.mjs`](../src/data/quiz-source.test.mjs), [`src/lib/quiz-model.test.mjs`](../src/lib/quiz-model.test.mjs) i [`src/lib/quiz-progress.test.mjs`](../src/lib/quiz-progress.test.mjs) | Testy zakresu pytań, punktacji, nawigacji i zapisywania postępu. |
| [`.env.example`](../.env.example) i [`.gitignore`](../.gitignore) | Wzór lokalnej konfiguracji i lista plików, które zostają poza GitHubem, w tym `.env.local`. |
| [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) | Buduje stronę, uruchamia testy i publikuje katalog `dist`. Zmienna repozytorium `FIREBASE_WEB_CONFIG` trafia do zbudowanej strony. |

### Gdzie skopiować konfigurację Firebase

W panelu projektu wybierzcie **koło zębate → Project settings → General → Your apps → QuizSzkolny → SDK setup and configuration**. Konfiguracja zawiera m.in. `projectId`, `authDomain` i `apiKey`. Lokalnie wpisuje się ją jako jednowierszowy JSON do `VITE_FIREBASE_CONFIG` w pliku `.env.local`. Publiczna wersja ma już konfigurację w GitHub Actions. Dostęp do zapisów określają reguły Firestore i zalogowane konto. [Dokładna konfiguracja Firebase](FIREBASE.md)

## Krótka wersja na prezentację

> GitHub Pages wyświetla stronę napisaną w React. Pytania są w repozytorium, a przeglądarka liczy punkty i rysuje wykres. Firebase Authentication rozpoznaje konto po UID. Pod tym UID Firestore przechowuje odpowiedzi i postęp, więc po ponownym zalogowaniu da się wrócić do tej samej próby.

[Scenariusz pokazu krok po kroku](PREZENTACJA.md)
