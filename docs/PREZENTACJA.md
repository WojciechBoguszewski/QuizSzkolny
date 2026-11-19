# Jak pokazać QuizSzkolny

## Co pokazać na ekranie

1. Otwórzcie [QuizSzkolny](https://wojciechboguszewski.github.io/QuizSzkolny/) i pokażcie ekran startowy. Kwestionariusz ma 94 stwierdzenia.
2. Aby zmieścić pokaz w kilku minutach, wcześniej odpowiedzcie na 93 pytania na koncie pokazowym. Podczas prezentacji zalogujcie się, kliknijcie **Kontynuuj**, odświeżcie stronę i pokażcie, że wciąż jesteście na pytaniu 94.
3. Zaznaczcie ostatnią odpowiedź i kliknijcie **Zakończ**. Na wykresie każda oś to inna kategoria. Przykładowo 21 z 28 punktów to 75% osi. Dokładne wyniki są pod wykresem.
4. Przy nagłówku kliknijcie **Zrób jeszcze raz** i anulujcie potwierdzenie. W ten sposób pokażecie reset, zachowując wynik do dalszej prezentacji.

## Co powiedzieć

> Interfejs działa w React i jest opublikowany na GitHub Pages. Pytania są w repozytorium. Przeglądarka sumuje odpowiedzi w każdej kategorii i przelicza je na procent możliwych punktów. Na wykresie każda kategoria ma swoją oś.
>
> Firebase ma tu dwie role. Firebase Authentication loguje użytkownika i nadaje mu identyfikator konta, czyli UID. Cloud Firestore zapisuje odpowiedzi i numer pytania pod tym identyfikatorem. Reguły bazy sprawdzają, czy zalogowana osoba jest właścicielem zapisu. Dzięki temu można dokończyć quiz po ponownym zalogowaniu, także na innym urządzeniu. U gościa postęp zostaje w bieżącej przeglądarce.

## Gdzie zajrzeć, jeśli nauczycielka zapyta o kod

- [Repozytorium](https://github.com/WojciechBoguszewski/QuizSzkolny) zawiera interfejs, pytania, przeliczanie punktów i reguły dostępu. GitHub Actions buduje stronę i publikuje ją na GitHub Pages.
- W [panelu Firebase](https://console.firebase.google.com/project/quizszkolny-wb/overview) sekcja **Authentication** pokazuje konta testowe, a **Firestore Database** pozwala zobaczyć zapis próby w `users → UID → attempts`. Po odpowiedzi zmienia się zapis próby. Wykres powstaje z odpowiedzi zapisanych w tym dokumencie.

[Przewodnik po kodzie i Firebase](PRZEWODNIK.md)
