# Aufbau App

Persönliche Ernährungs- und Fortschritts-App für Matze. Nur er nutzt sie, primär auf dem iPhone als Web-App vom Home-Bildschirm. Ziel ist sauberer Muskelaufbau: Einkaufen, Kochen und Kalorienzählen sollen so einfach wie möglich sein.

## Wie wir zusammenarbeiten

- Antworten auf Deutsch, kurz und natürlich. Keine Gedankenstriche oder Bindestriche als Stilmittel, auch nicht in Texten der App.
- Änderungen direkt in `index.html` umsetzen, mit Playwright auf 390 px Breite (hell und dunkel) prüfen, dann committen und auf `main` pushen. GitHub Pages veröffentlicht automatisch.
- Bei jeder Änderung an App-Dateien `VERSION` in `sw.js` erhöhen, sonst sieht das iPhone die alte Version aus dem Cache.
- Keine Daten von Matze ins Repository schreiben. Seine Daten liegen nur im Browser (localStorage) auf dem iPhone.

## Ziele und Regeln (Stand November 2026)

- Mann, 25, 1,76 m, ca. 71 kg, Bürojob, Training 5 bis 6 Mal pro Woche abends (Kraft plus Cardio), meist 18:30.
- Ziel: 2.800 kcal, 155 bis 165 g Protein, ca. 375 g Kohlenhydrate, ca. 75 g Fett. 4 Mahlzeiten.
- Zunahme: Ziel +0,2 bis 0,35 kg pro Woche, täglich morgens wiegen.
  - Zwei Wochen in Folge unter 0,2 kg: eine Stufe hoch (+150 kcal, mehr Reis, Nudeln oder Haferflocken).
  - Über 0,5 kg pro Woche: eine Stufe runter.
  - Protein bleibt fix.
- Kalorienstufen in der App: Basis, +150 (Abendessen), +300 (auch Frühstück), +450 (auch Meal Prep).
- Kreatin und Vitamin D3 nimmt er bereits.

## Essen

- Mag: Skyr Bowl (Skyr, TK Blaubeeren, Cashews, Cranberries, Banane), Mandelmus statt Erdnussbutter, Cashews statt Mandeln.
- Mag nicht: Vollkornnudeln, Wraps, Lachs. Rezepte einfach halten: nur Pfanne, Airfryer und Topf für Reis und Nudeln.
- Shakshuka nur sonntags.
- Meal Prep: Mittag wird vorgekocht (Sonntag 4 Portionen für Mo bis Do, Mittwoch 3 Portionen für Fr bis So), abends frisch.
  - Plan A: Chili und Curry.
  - Plan B: Reis Bowl und Airfryer Kartoffel Hähnchen.
- Einkauf bei Kaufland. Die Liste ist nach dem Laufweg sortiert: Obst und Gemüse zuerst, Tiefkühl zuletzt. Vorrat steht ganz unten.
- Mikrowelle zum Aufwärmen gibt es zuhause und im Office.

## Technik

- Eine Datei: `index.html` mit Stammdaten (`I` Artikel, `R` Rezepte mit Makros pro Portion, `PLANS`, `DINNERS`), State, Views (Heute, Woche, Einkauf, Analyse) und Rezept-Sheet.
- Dieselbe Datei läuft auch als Claude Artifact. `IN_CLAUDE` erkennt das:
  - In Claude: Sync über die db-Capability, Fotoscan der Nährwerttabelle über `sample`, keine Kamera und kein externer Abruf.
  - Auf GitHub Pages: Live-Barcode-Scanner (ZXing in `vendor/`), Open Food Facts für Produktdaten, nur localStorage.
- localStorage-Key `aufbau-plan-v1`. Wichtige Felder:
  - `plan`, `dinner[7]`, `step`, `train`
  - `log[YYYY-MM-DD] = {e:{f,m,b,a}, x:[{n,k,p,c,f}]}`
  - `weights[date]`, `wtime[date]`
  - `products[ean]`
  - `journal[]` (automatisches Tagebuch mit Zeitstempel)
  - `prices`, `vorrat`, `extras`, `shop`
- Daten zwischen Claude-Version und GitHub-Version übertragen: Analyse, dann Backup kopieren und einfügen.
- Design: Apple-Stil mit Systemschrift, iOS-Farben, Ringen, gruppierten Listen und schwebender Glas-Tab-Leiste. Farben stehen als CSS-Variablen in `:root` mit Dunkelmodus.

## Links

- App (GitHub Pages): https://matzeengel.github.io/aufbau-app/
- Claude-Version: https://claude.ai/artifact/9T7uTg8tuszt7cquG7bxWw
- Ernährungsplan als Dokument: https://claude.ai/artifact/5q9Hmw8zv5eZbNrcKWA2bK

## Ideen für später

Noch nicht entschieden, Matze wählt aus:

- Wasser-Tracker (Ziel 3 bis 3,5 l)
- Haken für Kreatin und Vitamin D
- Mahlzeit spontan tauschen
- Bauchumfang wöchentlich
- Eigene Rezepte anlegen und bearbeiten
- Sync mit dem Laptop (zum Beispiel Supabase)
- Fitbit und Apple Health (nur mit nativer iOS-App möglich)
