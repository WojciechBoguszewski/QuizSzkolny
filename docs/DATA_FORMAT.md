# Kontrakt źródła quizów

Ten format dotyczy opcjonalnego katalogu JSON z adresu `VITE_QUIZ_DATA_URL`.
Przy pustym ustawieniu aplikacja używa wbudowanego kwestionariusza.

Oczekiwana odpowiedź:

```json
{
  "quizzes": [
    {
      "id": "stabilny-identyfikator-quizu",
      "revision": "1",
      "title": "Tytuł quizu",
      "subject": "Przedmiot",
      "description": "Opcjonalny opis",
      "questions": [
        {
          "id": "stabilny-identyfikator-pytania",
          "text": "Treść pytania",
          "options": [
            { "id": "a", "text": "Treść pierwszej odpowiedzi" },
            { "id": "b", "text": "Treść drugiej odpowiedzi" }
          ],
          "correctOptionId": "b",
          "explanation": "Opcjonalne wyjaśnienie po zakończeniu"
        }
      ]
    }
  ]
}
```

To opis formatu, nie plik danych używany przez stronę.

| Pole | Zasady |
| --- | --- |
| `quizzes` | Tablica; pusta tablica jest poprawnym pustym katalogiem. |
| `id` | Niepusty tekst. Quizy mają unikalne ID w katalogu, pytania w quizie, opcje w pytaniu. |
| `revision` | Opcjonalny niepusty tekst, domyślnie `"1"`. Nowa wersja otrzymuje osobny zapis próby. |
| `title`, `text` | Niepusty tekst. Wyświetlany jako tekst; HTML nie jest wykonywany. |
| `subject`, `description`, `explanation` | Opcjonalne teksty; mogą być puste. |
| `questions` | Co najmniej jedno pytanie. |
| `options` | Co najmniej dwie opcje. |
| `correctOptionId` | Opcjonalne ID istniejącej opcji. Brak lub `null` oznacza pytanie bez oceniania. |

Wynik liczy poprawne odpowiedzi tylko dla pytań z kluczem. Gdy kluczy nie ma,
strona pokazuje liczbę udzielonych odpowiedzi i nie przypisuje im poprawności.
Wyjaśnienia i klucz są prezentowane po zakończeniu próby.

Zachowuj stabilne identyfikatory przy poprawianiu treści. Jeżeli zmieniasz znaczenie
pytań lub odpowiedzi, zwiększ `revision`. Zapisana kolejność pytań pozostaje taka sama
również wtedy, gdy źródło zmieni kolejność tych samych identyfikatorów.
Zmiana zestawu ID w tej samej wersji blokuje przywrócenie niezgodnej próby; strona
zachowuje wcześniejszy zapis i pozwala świadomie rozpocząć od nowa.

Źródło może działać pod tym samym adresem co strona. Przy osobnej domenie serwer
źródła musi pozwolić stronie na odczyt przez CORS. Adapter używa domyślnego uwierzytelniania
same-origin; własny klient bazy można podłączyć w `src/data/quiz-source.js`.
Błędy HTTP, błędny JSON i niezgodny format wywołują komunikat błędu z ponowieniem,
a nie pustą listę quizów.
