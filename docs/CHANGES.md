# Zmiany projektu

Poniżej opis prac nad wcześniejszą wersją, sprzed podłączenia kwestionariusza.

## Strona i wygląd

| Before | After |
| --- | --- |
| `App.jsx` uruchamiał licznik i ekran startowy Vite. | Uruchamia rzeczywistą aplikację: katalog, quiz, wynik i nieprawidłowy odnośnik. |
| Zatwierdzony styl istniał wyłącznie w podglądzie HTML. | Ten sam styl działa w React we wszystkich widokach: kolumna do 600 px, ciepłe tło, Georgia dla pytań i płaskie wiersze odpowiedzi. |
| Globalne CSS startera ustawiały wyśrodkowany ekran, szeroką ramkę i własny tryb ciemny. | `index.css` zawiera niewielki reset; `App.css` importuje wspólny arkusz `styles/quiz.css`. |
| Brak komponentów właściwej strony. | `PageShell.jsx`, `QuizCatalog.jsx` i `QuizSession.jsx` dzielą nagłówek, wybór quizu i przebieg próby. |
| Brak listy quizów. | Lista pokazuje tytuł, przedmiot, liczbę pytań i właściwą akcję: Rozpocznij, Kontynuuj lub Zobacz wynik. |
| Przyciski w podglądzie były tylko wzorcem wyglądu. | Radio, Wstecz / Dalej, zakończenie, wznowienie i powrót do katalogu obsługują rzeczywisty stan aplikacji. |
| Brak informacji o wyniku. | Wynik, rozwijany przegląd odpowiedzi, poprawna odpowiedź i dostarczone wyjaśnienia po zakończeniu. Pytania bez klucza nie otrzymują oceny. |
| Brak kompletnej obsługi niedostępnych danych. | Osobne stany ładowania, pustej listy, braku konfiguracji, błędu z ponowieniem oraz nieznanego quizu. |
| Angielski tytuł startera i domyślna ikona. | Polski język dokumentu, nazwa i opis QuizSzkolny, tytuł aktywnego quizu i prosta ikona Q. |

## Odpowiedzi i zapis

| Before | After |
| --- | --- |
| Moduł zapisu był przygotowany do podłączenia. | Komponent quizu korzysta bezpośrednio z `useQuizProgress` i `createQuizStore`. |
| Brak trwałych odpowiedzi we właściwej aplikacji. | Odpowiedzi, numer pytania, kolejność i ukończenie są zapisywane synchronicznie w `localStorage`. |
| Odświeżenie startera zerowało jego stan. | Odświeżenie aplikacji odtwarza próbę i pokazuje zapisany wynik po ukończeniu. |
| Brak rozróżnienia zapisów. | Każdy quiz i jego `revision` mają osobny klucz. Zmiana kolejności tych samych pytań w źródle nie zmienia kolejności zapisanej próby. |
| Brak walidacji danych próby. | Walidacja indeksu, identyfikatorów, opcji, kolejności i kompletności ukończonej próby. |
| Brak obsługi błędów zapisu w UI. | Komunikat błędu, Ponów zapis i zachowanie próby w pamięci. Nie ma fałszywego potwierdzenia udanego zapisu. |
| Niezgodne dane mogły powodować utratę kontekstu. | Niezgodny lub uszkodzony zapis jest chroniony; użytkownik wybiera świadomy reset. Przywrócenie właściwego źródła pozwala odzyskać poprzednią próbę. |
| Brak resetu właściwego quizu. | Zacznij od nowa / Jeszcze raz z potwierdzeniem i anulowaniem. Reset usuwa wyłącznie bieżący zapis; błąd nie udaje powodzenia. |

## Źródło, dostępność i sprawdzenie

| Before | After |
| --- | --- |
| Brak połączenia interfejsu ze źródłem. | `data/quiz-source.js` pobiera źródło z `VITE_QUIZ_DATA_URL`; `.env.example` i `docs/DATA_FORMAT.md` opisują kontrakt. Nie utworzono bazy pytań. |
| Brak ochrony przed nieprawidłowym katalogiem. | `quiz-model.js` sprawdza dane, unikalność ID i klucze. HTTP 401/403/404/500, błędny JSON i błędny model nie zamieniają się w pustą listę. |
| Brak obsługi zmiany widoku i przerwanego wczytywania. | Trasy przez hash i anulowanie nieaktualnych żądań przez `AbortController`. |
| Brak obsługi klawiatury we właściwym quizie. | Natywne radio, `fieldset` / `legend`, widoczny fokus, fokus pytania po zmianie i działający odnośnik pomijający nagłówek. |
| Brak ustalonego zachowania przy ograniczeniu ruchu i wymuszonych kolorach. | Wspólny CSS obsługuje `prefers-reduced-motion` i `forced-colors`. |
| Zasoby budowane od katalogu głównego domeny. | Względne ścieżki Vite i trasy hash ułatwiają hosting statyczny w podkatalogu. |
| Sprawdzony był niezależny moduł zapisu. | `npm test`: 33 testy magazynu, modelu, źródła i tras. `npm run build` buduje właściwą stronę. |
| Testowano wyłącznie makietę i osobny komponent zapisu. | Sprawdzono właściwą aplikację w przeglądarce: odświeżenie, wznowienie, wynik, przegląd, reset, ochronę zapisu, błąd źródła i ponowienie, pustą listę, nieprawidłową trasę oraz 320–1280 px. |
| README opisywał starter. | README i dokumenty integracji opisują gotowy frontend i pojedynczy punkt podłączenia bazy. |

## Zakres weryfikacji

Przebieg quizu sprawdzono na danych kontrolnych z `work/` poza repozytorium. Nie są
bazą pytań i nie wchodzą do paczki ani budowy produkcyjnej. Bez źródła aplikacja pokazuje
stan niedostępnych quizów. Nie potwierdzono integracji z rzeczywistą bazą, ponieważ jej
kod nie był jeszcze obecny w repozytorium. Nie wykonywano testu na fizycznym telefonie
ani publikacji na serwerze; zmiany są lokalne.
