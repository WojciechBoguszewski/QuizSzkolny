function question(id, skill, points, text, choices, correct, explanation) {
  const options = choices.map((label, index) => ({
    id: String(index + 1),
    text: label,
  }))
  return { id, skill, points, text, options, correctOptionId: String(correct), explanation }
}

export const subjectQuizzes = [
  {
    id: 'matematyka',
    title: 'Matematyka',
    description: 'Procenty, równania i geometria.',
    questions: [
      question('m1', 'Procenty', 1, 'Ile wynosi 15% ze 120?',
        ['12', '18', '20', '24'], 2, '15% ze 120 to 0,15 × 120 = 18.'),
      question('m2', 'Równania', 1, 'Ile wynosi x w równaniu 3x − 5 = 16?',
        ['5', '6', '7', '9'], 3, 'Po dodaniu 5 do obu stron otrzymujemy 3x = 21, więc x = 7.'),
      question('m3', 'Geometria', 1, 'Jakie pole ma trójkąt o podstawie 8 cm i wysokości 5 cm?',
        ['13 cm²', '20 cm²', '26 cm²', '40 cm²'], 2, 'Pole trójkąta to połowa iloczynu podstawy i wysokości.'),
      question('m4', 'Procenty', 2, 'Cena 250 zł najpierw wzrosła o 20%, a potem spadła o 20%. Ile wynosi teraz?',
        ['230 zł', '240 zł', '250 zł', '260 zł'], 2, 'Po podwyżce cena to 300 zł. Obniżka o 20% od 300 zł daje 240 zł.'),
      question('m5', 'Równania', 2, 'Ile wynosi x w równaniu 2(x − 3) = x + 4?',
        ['−2', '2', '7', '10'], 4, 'Po rozpisaniu nawiasu 2x − 6 = x + 4. Stąd x = 10.'),
      question('m6', 'Geometria', 2, 'Prostokąt ma boki 6 cm i 8 cm. Ile wynosi jego przekątna?',
        ['10 cm', '12 cm', '14 cm', '48 cm'], 1, 'Z twierdzenia Pitagorasa: d² = 6² + 8² = 100, więc d = 10 cm.'),
    ],
  },
  {
    id: 'informatyka',
    title: 'Informatyka',
    description: 'Algorytmy, liczby binarne i arkusze kalkulacyjne.',
    questions: [
      question('i1', 'Algorytmy', 1, 'Która instrukcja służy do powtórzenia tej samej czynności kilka razy?',
        ['Pętla', 'Komentarz', 'Przypisanie', 'Zwrócenie wyniku'], 1, 'Pętla powtarza blok instrukcji określoną liczbę razy lub do spełnienia warunku.'),
      question('i2', 'Liczby binarne', 1, 'Jaką liczbę dziesiętną oznacza zapis binarny 101?',
        ['3', '4', '5', '6'], 3, '101 w systemie dwójkowym to 4 + 0 + 1 = 5.'),
      question('i3', 'Arkusze kalkulacyjne', 1, 'Która formuła dodaje wartości z komórek A1 i A2?',
        ['A1:A2', '=A1+A2', '=A1*A2', '=A1-A2'], 2, 'Znak = rozpoczyna formułę, a znak + dodaje wartości z dwóch komórek.'),
      question('i4', 'Algorytmy', 2, 'Zaczynasz od 1 i trzy razy z rzędu podwajasz wynik. Jaki wynik otrzymasz?',
        ['4', '6', '8', '16'], 3, 'Kolejne wyniki to 2, 4 i 8.'),
      question('i5', 'Liczby binarne', 2, 'Który zapis binarny oznacza 13?',
        ['1001', '1011', '1101', '1110'], 3, '13 = 8 + 4 + 1, co daje zapis 1101.'),
      question('i6', 'Arkusze kalkulacyjne', 2, 'Który adres zachowa i kolumnę, i wiersz po skopiowaniu formuły?',
        ['A1', '$A1', 'A$1', '$A$1'], 4, 'Dwa znaki $ blokują zarówno kolumnę A, jak i wiersz 1.'),
    ],
  },
  {
    id: 'jezyk-polski',
    title: 'Język polski',
    description: 'Części mowy, ortografia i środki stylistyczne.',
    questions: [
      question('p1', 'Części mowy', 1, 'Który wyraz jest przymiotnikiem?',
        ['biegać', 'szybki', 'szybko', 'szybkość'], 2, 'Przymiotnik „szybki” odpowiada na pytanie „jaki?”.'),
      question('p2', 'Ortografia', 1, 'Która pisownia jest poprawna?',
        ['żeka', 'rzegka', 'rzęka', 'rzeka'], 4, 'Poprawny zapis to „rzeka”.'),
      question('p3', 'Środki stylistyczne', 1, 'Jaki środek stylistyczny występuje w wyrażeniu „biały jak śnieg”?',
        ['Porównanie', 'Powtórzenie', 'Wyliczenie', 'Uosobienie'], 1, 'Słowo „jak” wprowadza porównanie do śniegu.'),
      question('p4', 'Części mowy', 2, 'Jaką częścią mowy jest „między” w zdaniu „Rower stoi między drzewami”?',
        ['Przysłówkiem', 'Spójnikiem', 'Przyimkiem', 'Rzeczownikiem'], 3, 'Przyimek „między” tworzy z rzeczownikiem wyrażenie „między drzewami”.'),
      question('p5', 'Ortografia', 2, 'Który zapis jest poprawny w zdaniu „To było ___ zadanie”?',
        ['nie łatwe', 'niełatwe', 'nie-łatwe', 'nie ładtwe'], 2, 'Partykułę „nie” z przymiotnikiem w stopniu równym zapisujemy tu łącznie.'),
      question('p6', 'Środki stylistyczne', 2, 'Jaki środek stylistyczny występuje w zdaniu „Las szepcze do wędrowca”?',
        ['Wykrzyknienie', 'Powtórzenie', 'Porównanie', 'Uosobienie'], 4, 'Las wykonuje czynność przypisaną człowiekowi, czyli szepcze.'),
    ],
  },
]
