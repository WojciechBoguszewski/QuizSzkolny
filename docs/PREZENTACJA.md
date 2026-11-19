# Jak pokazać QuizSzkolny

## Co pokazać na ekranie

1. Otwórzcie [QuizSzkolny](https://wojciechboguszewski.github.io/QuizSzkolny/) i wybierzcie **Rozpocznij**. Pokażcie licznik pytań i skalę odpowiedzi. Krótka wersja ma 20 stwierdzeń. Pod głównym przyciskiem jest dostępna pełna wersja z 94 stwierdzeniami.
2. Zaznaczcie odpowiedź, przejdźcie dalej i odświeżcie stronę. Pokażcie, że aplikacja wraca do tego samego miejsca.
3. Zakończcie próbę i pokażcie wykres. Każda oś odpowiada jednej kategorii. Środek oznacza 0%, a zewnętrzny okrąg 100% możliwych punktów. Przykładowo 12 z 16 punktów daje punkt na 75% osi. Pod wykresem widać dokładne wyniki.
4. Aby zmieścić pokaz w kilku minutach, możecie wcześniej przygotować próbę z 19 odpowiedziami na koncie pokazowym. Podczas prezentacji zalogujcie się, wybierzcie **Kontynuuj** i odpowiedzcie na ostatnie pytanie.

## Co powiedzieć

> Interfejs działa w React i jest opublikowany na GitHub Pages. Pytania są w repozytorium. Przeglądarka sumuje odpowiedzi w każdej kategorii i przelicza je na procent możliwych punktów. Na wykresie każda kategoria ma swoją oś.
>
> Firebase ma tu dwie role. Firebase Authentication loguje użytkownika i nadaje mu identyfikator konta, czyli UID. Cloud Firestore zapisuje odpowiedzi i numer pytania pod tym identyfikatorem. Reguły bazy sprawdzają, czy zalogowana osoba jest właścicielem zapisu. Dzięki temu można dokończyć quiz po ponownym zalogowaniu, także na innym urządzeniu. U gościa postęp zostaje w bieżącej przeglądarce.

## Gdzie zajrzeć, jeśli nauczycielka zapyta o kod

- [Repozytorium](https://github.com/WojciechBoguszewski/QuizSzkolny) zawiera interfejs, pytania, przeliczanie punktów i reguły dostępu. GitHub Actions buduje stronę i publikuje ją na GitHub Pages.
- W [panelu Firebase](https://console.firebase.google.com/project/quizszkolny-wb/overview) sekcja **Authentication** pokazuje konta testowe, a **Firestore Database** pozwala zobaczyć zapis próby w `users → UID → attempts`. Po odpowiedzi zmienia się zapis próby. Wykres powstaje z odpowiedzi zapisanych w tym dokumencie.
