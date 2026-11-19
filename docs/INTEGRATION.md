# Integracja strony i bazy

Frontend jest już podłączony do stylów, nawigacji i zapisu postępu. Główna strona `/`
uruchamia aplikację. `docs/interface-preview.html` jest wyłącznie statycznym wzorcem wyglądu.

## Źródło danych

Domyślnie działa wbudowany katalog quizów i kwestionariusz. Aby zastąpić go zewnętrznym katalogiem:

1. Autor bazy dostarcza dane w formacie z `DATA_FORMAT.md`.
2. Ustaw `VITE_QUIZ_DATA_URL` w `.env.local` na adres pliku lub endpointu.
3. Uruchom ponownie `npm run dev`; dla produkcji wykonaj `npm run build` z tym ustawieniem.

Jeżeli baza wymaga innego klienta lub mapowania, zmień `src/data/quiz-source.js`.
Funkcja `loadQuizCatalog({ url, signal })` ma zwracać `{ status: 'ready', quizzes }`
z danymi zwalidowanymi przez `parseQuizCatalog`. Sygnalizuj błędy wyjątkiem i respektuj
`AbortSignal`. Prawidłowe puste dane mają stan `ready` z pustą tablicą.
Wbudowane stwierdzenia są w `src/data/quizzes.js`, a ich przeliczenie w `src/data/aptitude-quiz.js`.

## Widoki

- `QuizCatalog.jsx` pokazuje listę, wznowienie, ukończoną próbę oraz stany ładowania, braku danych i błędu.
- `QuizSession.jsx` obsługuje odpowiedzi, Wstecz / Dalej, zakończenie, wynik i przegląd wyjaśnień.
- `PageShell.jsx` zapewnia wspólny nagłówek, jedną kolumnę i odnośnik pomijający nawigację.
- Trasy mają postać `#quizy` i `#quiz/<zakodowane-id>`. Odświeżenie nie wymaga przekierowań serwera.

`App.css` importuje wspólny arkusz `styles/quiz.css`. Integrację Firebase opisano w [FIREBASE.md](FIREBASE.md).

## Zapis

`createQuizStore(quiz)` tworzy magazyn próby o kluczu:

```text
quizszkolny:progress:<zakodowane-id-quizu>:<zakodowana-revision>
```

Stan zawiera `questionIndex`, `questionOrder`, `answers` i `finished`.
Odpowiedzi mają postać `{ [questionId]: optionId }`.
Kolejność pytań i bieżący indeks są odtwarzane razem z odpowiedziami. Wynik jest wyliczany
z zapisanych odpowiedzi i dostarczonego klucza; ukończona próba pozostaje ukończona po odświeżeniu.

Zapis jest synchroniczny. Nie zależy od efektu React po renderowaniu.
Inicjalizacja tylko odczytuje dane. Formularz korzysta bezpośrednio z `useQuizProgress(store)`;
nie ma drugiej kopii próby w `useState`.

| Status | Zachowanie strony |
| --- | --- |
| `ready` | Brak zapisu; strona nie pokazuje komunikatu „zapisano”. |
| `saved` | Komunikat potwierdzający zapis w tej przeglądarce. |
| `unavailable` | Próba działa w pamięci; wyraźny błąd i przycisk Ponów zapis. |
| `invalid` / `incompatible` | Poprzedni zapis jest chroniony. Interakcja wymaga świadomego rozpoczęcia od nowa. |

Reset wymaga wyboru **Zacznij od nowa** albo **Zrób jeszcze raz** i potwierdzenia w oknie nad stroną.
Anulowanie zachowuje próbę. Nieudane usunięcie nie udaje udanego resetu i nie odblokowuje
chronionego zapisu. Usuwany jest tylko klucz bieżącego quizu i wersji.

Zapis gościa dotyczy tej przeglądarki i tego samego adresu strony. Czyszczenie danych witryny
usuwa postęp. Po zalogowaniu aplikacja używa osobnego zapisu w Firestore pod identyfikatorem konta.

## Sprawdzenie

```sh
npm test
npm run build
npm run preview
```

Testy obejmują zapis, walidację źródła i próby, izolację quizów i wersji, zachowanie
kolejności, wynik bez klucza, błędy HTTP i anulowanie żądania. Przebieg przeglądarkowy
sprawdzono na osobnych danych kontrolnych: odpowiedź, odświeżenie, kolejne pytanie,
wznowienie z listy, wynik, przegląd odpowiedzi, anulowanie resetu i reset.
Sprawdzono też niezgodne dane bez utraty wcześniejszej próby, ponowienie po błędzie źródła,
pustą listę oraz szerokości 320–1280 px. To testy przeglądarkowe, bez testu fizycznego telefonu.
