# Firebase

Firebase Authentication obsługuje rejestrację, logowanie, wylogowanie i zmianę hasła przez
link wysyłany e-mailem. Cloud Firestore zapisuje bieżącą lub ostatnią ukończoną próbę
dla każdej wersji quizu pod ścieżką `users/{uid}/attempts/{klucz}`.
W dokumencie jest zapis odpowiedzi, numer bieżącego pytania i stan ukończenia.
Wynik jest obliczany z tych odpowiedzi i klucza quizu. Reguły Firestore ograniczają
dostęp do właściciela konta. Produkcyjna baza Standard działa w regionie `nam5`.

## Połączenie z projektem

1. Dodaj aplikację internetową w Firebase i skopiuj jej konfigurację SDK.
2. Utwórz domyślną bazę Cloud Firestore (Standard, tryb produkcyjny).
3. W katalogu repozytorium uruchom poniższe polecenie z identyfikatorem projektu Firebase.

   ```sh
   firebase deploy --only auth,firestore:rules --project ID_PROJEKTU
   ```

4. Dodaj domenę GitHub Pages w **Authentication → Settings → Authorized domains**.
5. Wpisz konfigurację SDK jako jednowierszowy JSON do `VITE_FIREBASE_CONFIG` w `.env.local`.
   Dla GitHub Pages umieść ten sam JSON w zmiennej repozytorium `FIREBASE_WEB_CONFIG`
   i uruchom automatyzację GitHub Pages.

## Tryb lokalny

Uruchom emulatory Auth i Firestore z Firebase CLI i ustaw `VITE_FIREBASE_EMULATORS=true`
w `.env.local`. W drugim terminalu uruchom `npm run dev`.

```sh
firebase emulators:start --only auth,firestore --project demo-quizszkolny
```

Próby rozpoczęte jako gość zapisują się w przeglądarce i można do nich wrócić po
wylogowaniu. Próby po zalogowaniu zapisują się na danym koncie. Równoległe zmiany tej
samej próby na dwóch urządzeniach rozstrzyga ostatni zapis w Firestore.
