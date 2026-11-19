# QuizSzkolny

Szkolny kwestionariusz uzdolnień. Zawiera 94 stwierdzenia, pięć odpowiedzi do wyboru
i podsumowanie punktów w 13 kategoriach. Odpowiedzi i bieżące pytanie zapisują się
w przeglądarce, więc próbę można dokończyć po odświeżeniu strony.

Punktacja skali IZiU pochodzi z rozdziału 7.1.1 publikacji
[„Zdolny, ale jak?”](https://repozytorium.uwb.edu.pl/jspui/handle/11320/3449).
Podsumowanie pokazuje sumy punktów w kategoriach.

## Uruchomienie

Wymagany jest Node.js 24.

```sh
npm ci
npm run dev
```

## Sprawdzenie i publikacja

```sh
npm test
npm run lint
npm run build
npm run preview
```

W ustawieniach repozytorium wybierz **Settings → Pages → Source → GitHub Actions**.
Automatyzacja **GitHub Pages** testuje i buduje projekt po zmianach na `main`,
a następnie publikuje katalog `dist/`. Można ją również uruchomić ręcznie z karty **Actions**.

## Inne źródło danych

Wbudowany kwestionariusz działa bez konfiguracji. Aby wyświetlić inny katalog, ustaw
`VITE_QUIZ_DATA_URL` w pliku `.env.local` przed uruchomieniem lub budową aplikacji.
Przy hostowaniu w podkatalogu podawaj pełny adres źródła albo ścieżkę względną
wobec strony. Format opisano w [docs/DATA_FORMAT.md](docs/DATA_FORMAT.md).
