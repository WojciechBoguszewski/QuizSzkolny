# QuizSzkolny

Szkolny kwestionariusz uzdolnień z 94 stwierdzeniami w 13 kategoriach.
Po ukończeniu aplikacja pokazuje wykres radarowy, punkty i udzielone odpowiedzi.
Polecenie **Zrób jeszcze raz** jest obok nagłówka wyniku i otwiera okno potwierdzenia.

Gość wznawia próbę w tej samej przeglądarce. Zalogowana osoba może wrócić do niej
na innym urządzeniu dzięki Firebase Authentication i Cloud Firestore.

- [Strona projektu](https://wojciechboguszewski.github.io/QuizSzkolny/)
- [Przewodnik po kodzie i Firebase](docs/PRZEWODNIK.md)
- [Scenariusz prezentacji](docs/PREZENTACJA.md)
- [Konfiguracja Firebase](docs/FIREBASE.md)

## Uruchomienie

Wymagany jest Node.js 24.

```sh
npm ci
npm run dev
```

Kwestionariusz działa w trybie gościa bez konfiguracji Firebase. Aby włączyć logowanie lokalnie,
uzupełnij `VITE_FIREBASE_CONFIG` w pliku `.env.local` albo użyj emulatorów Firebase.

## Testy i publikacja

```sh
npm test
npm run lint
npm run build
```

GitHub Actions publikuje katalog `dist/` na GitHub Pages po zmianach na `main`.
Produkcyjna konfiguracja Firebase pochodzi ze zmiennej repozytorium `FIREBASE_WEB_CONFIG`.

## Dane i punktacja

Stwierdzenia są w `src/data/quizzes.js`, a punktacja w `src/data/aptitude-quiz.js`.
Opcjonalne zewnętrzne źródło wskazuje `VITE_QUIZ_DATA_URL`. [Format katalogu](docs/DATA_FORMAT.md)

Kwestionariusz wykorzystuje punktację skali IZiU z rozdziału 7.1.1 publikacji
[„Zdolny, ale jak?”](https://repozytorium.uwb.edu.pl/jspui/handle/11320/3449).
