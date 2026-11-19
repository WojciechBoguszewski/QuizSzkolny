# Jak pokazać QuizSzkolny

## Przebieg prezentacji

1. Otwórzcie [QuizSzkolny](https://wojciechboguszewski.github.io/QuizSzkolny/) i wybierzcie **Matematykę**. Quiz ma sześć pytań. Pokażcie, że obok pytania widać umiejętność i liczbę punktów.
2. Podajcie np. odpowiedzi **18**, **5**, **20 cm²**, **240 zł**, **−2**, **12 cm**. Wynik będzie **4 z 9 pkt**. Pokażcie na wykresie, że procenty dały **3 z 3 pkt**, równania **0 z 3 pkt**, a geometria **1 z 3 pkt**.
3. Rozwińcie **Przejrzyj odpowiedzi**, żeby pokazać wyjaśnienie błędu w równaniu.
4. Pokażcie zapis po odświeżeniu. Jeśli konfigurujecie konto do prezentacji, użyjcie własnego konta pokazowego i pokażcie kontynuację po ponownym zalogowaniu.

## Co powiedzieć

> Stronę zrobiliśmy w React. Każde pytanie ma tekst, odpowiedzi, klucz, umiejętność i wagę. Po zakończeniu program porównuje odpowiedzi z kluczem. Za poprawną odpowiedź dodaje wagę do odpowiadającej jej umiejętności. Na wykresie widać, ile punktów zdobyliśmy i ile było do zdobycia w każdym obszarze.
>
> Firebase Authentication obsługuje konta. Cloud Firestore przechowuje odpowiedzi i postęp pod identyfikatorem zalogowanej osoby. Reguły bazy sprawdzają ten identyfikator przed odczytem i zapisem. Pliki strony publikuje automatycznie GitHub Actions na GitHub Pages.

## Jeśli padnie pytanie o naprawę

Poprzedni ekran nie wczytywał pytań z repozytorium. Podłączyliśmy je do formularza,
dodaliśmy trzy quizy przedmiotowe i oddzieliliśmy punktację od wyglądu strony.
W kwestionariuszu uzdolnień sumujemy odpowiedzi według jego własnej skali.
