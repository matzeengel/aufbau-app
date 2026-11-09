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
  - Einkauf hat zwei Modi: „Planen“ (pro Gericht Anzahl mit Plus und Minus, immer 7 Tage pro Mahlzeit, `changeCount()` und `arrange()` verteilen auf die Tage: Mittag in Blöcken fürs Vorkochen, sonst im Wechsel, Shakshuka nur sonntags) und „Im Laden“ (große Liste zum Abhaken, Erledigte ausblenden, Einkauf abschließen). Plan A/B gibt es nicht mehr.
- Gerichte pimpen: Toppings (`TOPS`) pro Gericht im Rezeptfenster, gespeichert in `top[rid]`. Sie zählen in Makros, Vorschlag und Einkaufsliste.
- Extras unter Heute kommen über „Essen hinzufügen“ (Sheet mit Scannen, Suchen, Meine Produkte, Schnell eintragen, manuell).
- Pro Mahlzeit gibt es mindestens 3 Optionen (`SLOTOPTS`), die alle grob zum Tagesziel passen:
  - Frühstück: Haferflocken mit Mandelmus, Overnight Oats mit Skyr, Rührei mit Vollkornbrot.
  - Mittag (vorgekocht): Chili, Curry, Reis Bowl, Airfryer Kartoffel Hähnchen.
  - Vor dem Training: Skyr Bowl, Vollkornbrot mit Hüttenkäse und Banane, Whey Shake mit Reiswaffeln.
  - Abendessen: Bolognese, Reispfanne, Gnocchi Pfanne, Shakshuka (nur sonntags).
- Einkauf bei Kaufland. Die Liste ist nach dem Laufweg sortiert: Obst und Gemüse zuerst, Tiefkühl zuletzt. Vorrat steht ganz unten.
- Mikrowelle zum Aufwärmen gibt es zuhause und im Office.

## Technik

- Eine Datei: `index.html` mit Stammdaten (`I` Artikel, `R` Rezepte mit Makros pro Portion, `TOPS`, `SLOTOPTS`), State, Views (Heute, Kochen, Einkauf, Analyse) und Sheets (Rezept, Auswahl, Hinzufügen).
- Tab Kochen: nächstes Meal Prep (Sonntag oder Mittwoch) mit Gesamtmengen und Ablauf zum Abhaken (`cook[datum+S|W]`), „Für morgen vorbereiten“, Wochenübersicht (Tag antippen springt zu Heute), alle Rezepte. Kalorienstufe und Trainingszeit stehen unter Analyse, Einstellungen.
- Dieselbe Datei läuft auch als Claude Artifact. `IN_CLAUDE` erkennt das:
  - In Claude: Sync über die db-Capability, Fotoscan der Nährwerttabelle über `sample`, keine Kamera und kein externer Abruf.
  - Auf GitHub Pages: Live-Barcode-Scanner (ZXing in `vendor/`), Open Food Facts für Produktdaten, nur localStorage.
- localStorage-Key `aufbau-plan-v1`. Wichtige Felder:
  - `menu = {f,m,b,a}` mit je 7 Rezept-IDs (Wochenplan pro Wochentag), `dayMenu[YYYY-MM-DD] = {slot: rid}` für Änderungen nur an einem Tag
  - `pick = {f,m,b,a}` Gerichte der Woche (wird aus den Anzahlen abgeleitet)
  - `top = {rid: [toppingIds]}` Toppings je Gericht
  - `step`, `train`
  - `log[YYYY-MM-DD] = {e:{slot:{r,m}}, x:[{n,k,p,c,f}]}` (gegessene Mahlzeit mit Rezept und Makros zum Zeitpunkt des Abhakens)
  - `weights[date]`, `wtime[date]`
  - `products[ean]`
  - `journal[]` (automatisches Tagebuch mit Zeitstempel)
  - `prices`, `vorrat`, `extras`, `shop`, `cook`
  - pro Tag zusätzlich in `log[datum]`: `w` (Wasser in ml), `s` ({k: Kreatin, d: Vitamin D}), `t` (Training erledigt), `rest` (true/false überschreibt Trainingstage)
  - `tdays` Trainingstage (0 = Montag), `rem` Erinnerungen {id: {on, t}}, `rv` ausgeblendete Wochenrückblicke
- Datenversion `v:3`. Beim Umstieg von älteren Versionen wird der alte Stand einmal unter `aufbau-plan-v1-sicherung` gesichert. Änderungen am Datenmodell immer abwärtskompatibel machen, nie Felder löschen, die Matzes Einträge enthalten.
- Tagesziel ist fix: 2.800 kcal plus 150 je Kalorienstufe, 160 g Protein. Der Vorschlag auf Heute sucht die beste Kombination der offenen frischen Mahlzeiten (Mittag bleibt fest, weil vorgekocht).
- Scanner auf GitHub Pages: `vendor/barcode-detector.js` (zxing-cpp als WebAssembly, `vendor/zxing_reader.wasm`), Live-Bild mit Drehsperre. Produktsuche per Name über Open Food Facts.
- Daten zwischen Claude-Version und GitHub-Version übertragen: Analyse, dann Backup kopieren und einfügen.
- Ruhetage: Ziel 200 kcal und 50 g Kohlenhydrate niedriger (`goal(k,d)`).
- Timer: Zeiten wie „15 Minuten“ in Rezept- und Kochschritten werden zu Timer-Buttons (`timerize`). Timer oben als Pille, Ton per WebAudio, Bildschirm bleibt an (Wake Lock). Läuft nur zuverlässig bei offener App.
- Erinnerungen (`REM`): Kalender-Export als .ics und Push. Push: Die App erzeugt VAPID-Schlüssel im Browser (localStorage `aufbau-push`), abonniert Push und erzeugt einen Code. Matze legt ihn als Repository-Secret `PUSH_CONFIG` an. `.github/workflows/push.yml` läuft alle 10 Minuten und schickt fällige Erinnerungen mit `push/send.mjs` (web-push). Claude darf keine Secrets setzen, das macht Matze selbst.
- Design: Apple-Stil mit Systemschrift, iOS-Farben, Ringen, gruppierten Listen und schwebender Glas-Tab-Leiste. Farben stehen als CSS-Variablen in `:root` mit Dunkelmodus.

## Links

- App (GitHub Pages): https://matzeengel.github.io/aufbau-app/
- Claude-Version: https://claude.ai/artifact/9T7uTg8tuszt7cquG7bxWw
- Ernährungsplan als Dokument: https://claude.ai/artifact/5q9Hmw8zv5eZbNrcKWA2bK

## Ideen für später

Noch nicht entschieden, Matze wählt aus:

- Wasser-Tracker (Ziel 3 bis 3,5 l)
- Haken für Kreatin und Vitamin D
- Bauchumfang wöchentlich
- Eigene Rezepte anlegen und bearbeiten
- Sync mit dem Laptop (zum Beispiel Supabase)
- Fitbit und Apple Health (nur mit nativer iOS-App möglich)
