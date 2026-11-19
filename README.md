# QuizSzkolny

Szkolny kwestionariusz uzdolnień. Start prowadzi do wersji pokazowej z 20 pytaniami
w pięciu kategoriach. Pełny kwestionariusz ma 94 stwierdzenia w 13 kategoriach.
Obie wersje pokazują wykres radarowy, liczbę punktów i listę odpowiedzi.

Gość wznawia próbę w tej samej przeglądarce. Zalogowana osoba może wrócić do niej
na innym urządzeniu dzięki Firebase Authentication i Cloud Firestore.

- [Strona projektu](https://wojciechboguszewski.github.io/QuizSzkolny/)
- [Scenariusz prezentacji](docs/PREZENTACJA.md)
- [Konfiguracja Firebase](docs/FIREBASE.md)

## Uruchomienie

Wymagany jest Node.js 24.

```sh
npm ci
npm run dev
```

Quizy działają w trybie gościa bez konfiguracji Firebase. Aby włączyć logowanie lokalnie,
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

Stwierdzenia są w `src/data/quizzes.js`, a wybór wersji pokazowej i punktacja
w `src/data/aptitude-quiz.js`. Wersja pokazowa korzysta z czterech stwierdzeń na kategorię
i zapisuje własną próbę. Opcjonalne zewnętrzne źródło wskazuje `VITE_QUIZ_DATA_URL`. [Format katalogu](docs/DATA_FORMAT.md)

Kwestionariusz wykorzystuje punktację skali IZiU z rozdziału 7.1.1 publikacji
[„Zdolny, ale jak?”](https://repozytorium.uwb.edu.pl/jspui/handle/11320/3449).
