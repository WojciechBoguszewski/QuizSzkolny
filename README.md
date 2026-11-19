# QuizSzkolny

Quizy szkolne z matematyki, informatyki i języka polskiego oraz kwestionariusz uzdolnień.
Pytania przedmiotowe mają przypisane umiejętności i wagi. Na końcu aplikacja pokazuje
sumę punktów, wykres słupkowy oraz podgląd odpowiedzi z wyjaśnieniami.

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

Quizy przedmiotowe są w `src/data/subject-quizzes.js`. Opcjonalne zewnętrzne źródło
wskazuje `VITE_QUIZ_DATA_URL`. [Format katalogu](docs/DATA_FORMAT.md)

Kwestionariusz wykorzystuje punktację skali IZiU z rozdziału 7.1.1 publikacji
[„Zdolny, ale jak?”](https://repozytorium.uwb.edu.pl/jspui/handle/11320/3449).
