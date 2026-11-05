# Release: Ringzeit Dev → Ringzeit

Diese Anleitung bringt den abgenommenen Stand von **Ringzeit Dev** in die stabile App **Ringzeit**
(`dnsmaur1992/ringzeit`, `dnsmaur1992.github.io/ringzeit/`). Die Nutzer behalten Link, Home-Bildschirm-Symbol und alle
Daten. Den Hintergrund und den Rückweg beschreibt [abloesung.md](abloesung.md) (Weg 1).

## 1. Was das Release-Paket enthält

Das Paket entsteht mit `python3 tools/release.py <leerer Ordner>` aus dem Dev-Repo. Es ist eine Kopie des Dev-Stands mit
diesen Änderungen:

| Bereich | Dev | Release |
|---|---|---|
| App-Kennung, Name (`src/app/06-storage.js`) | `ringzeit-dev`, „Ringzeit Dev“ | `ringzeit`, „Ringzeit“ |
| Datenspeicher | `ringzeit-dev.v1` | `ringzeit.v1` – **die vorhandenen Nutzerdaten** |
| Cache des Service Workers | `ringzeit-dev-<Version>` | `ringzeit-<Version>`; beim Aufräumen bleibt der Cache von Ringzeit Dev stehen |
| Sicherungen | `"app": "ringzeit-dev"` | `"app": "ringzeit"` – Sicherungen der alten App lassen sich laden |
| Titel, Ladebild, Manifest, Installationsseite mit QR-Code, README | „Ringzeit Dev“, Entwicklungsversion | „Ringzeit“, ohne Entwicklungshinweis |
| Tests | Schlüssel von Dev | Schlüssel der stabilen App; der Isolationstest bleibt im Dev-Repo |

Jede Ersetzung muss genau passen, sonst bricht das Werkzeug ab. Zum Schluss sucht es nach übrig gebliebenen
Dev-Kennungen, baut die App und kopiert `index.html`, `sw.js` und `manifest.webmanifest` in die Wurzel.

„Was ist neu“ (Zähler `NEWS_V` 7) beschreibt Boxen, Taekwondo, die Schwerpunkte je Sportart und das neue Profil. Jeder
bisherige Nutzer sieht es nach dem Update genau einmal.

## 2. Vor dem Upload (Rückweg sichern)

1. **Daten:** In der stabilen App auf dem iPhone eine Sicherung speichern und gut aufheben.
2. **Code:** Auf GitHub im Repo `ringzeit` **Code → Download ZIP** wählen. Diese Datei ist der alte Stand.

## 3. Upload ins stabile Repo

1. Die ZIP `ringzeit-release-….zip` auf dem Rechner entpacken.
2. Auf GitHub im Repo **`dnsmaur1992/ringzeit`** (nicht `ringzeit-dev`!) **Add file → Upload files** wählen.
3. **Den Inhalt** des entpackten Ordners hineinziehen, also die Ordner `src`, `docs`, `tests`, `tools` und alle Dateien
   der obersten Ebene, nicht den Ordner selbst. GitHub behält die Unterordner bei.
4. Unten „Commit changes“. Vorhandene Dateien werden überschrieben.
5. **Alte Dateien löschen.** Auf GitHub: Datei öffnen → **⋯ → Delete file** → Commit.
   - `src/ringzeit.html`: die frühere Ein-Datei-Quelle, die der neue Build nicht mehr nutzt.
   - In `docs/` die Bilder ohne Verweis: `heute.jpg`, `banner.jpg`, `bandagieren.jpg`, `coach.jpg`, `rundentimer.jpg`, `test.jpg`.
   - `docs/todo-bedienung-akku.md` gibt es nur im stabilen Repo. Die Datei stört nicht und kann bleiben.

## 4. Prüfen nach dem Upload

1. 1–2 Minuten warten, bis GitHub Pages fertig ist.
2. Die installierte App „Ringzeit“ öffnen, schließen (aus dem App-Umschalter wischen) und noch einmal öffnen.
3. Erwartet:
   - „Was ist neu“ erscheint einmal.
   - Unter Profil → App & Daten steht die neue App-Version (die aus dem Release-Paket).
   - Profil, Gürtel, Verlauf, Turniere und die geplanten Einheiten sind da.
4. Profil → Über mich: Hauptsport Kickboxen, die eigene Disziplin, der eigene Gürtel.
5. Ringzeit Dev öffnen: Sie hat weiter ihre eigenen Daten und funktioniert auch offline.

## 5. Wenn etwas nicht stimmt

- **Code zurück:** Die ZIP aus Schritt 2.2 wieder hochladen und `src/ringzeit.html` damit zurückholen. Beim nächsten
  Online-Start übernimmt die alte Version.
- **Daten zurück:** Die neue Version speichert unter `ringzeit.v1` im Format v2. Nach einem Rückweg die Sicherung aus
  Schritt 2.1 laden.

## 6. Ergebnis der Prüfung vor diesem Release (04.11.2026)

Alle Prüfungen liefen im **Release-Stand selbst** (Kennung `ringzeit`):

| Prüfung | Ergebnis |
|---|---|
| Testsuite (`node --test …`) | 234 bestanden |
| Kickbox-Baseline | identisch |
| Gesamtprüfung (`tests/final-check.mjs`) | 648 Einheiten ohne Befund, H1–H9 erfüllt |
| Browser (`tests/final-browser.cjs`) | 11 Seiten je Sport und Sprache bei 390 px, Inbetriebnahme, Offline-Start; Cache nur `ringzeit-…` |
| Isolation (aus dem Dev-Repo, neue stabile App gegen Ringzeit Dev) | 12 bestanden; ein Update der stabilen App lässt den Cache von Ringzeit Dev jetzt **stehen** (die alte stabile App löscht ihn) |
| **Altdaten-Test 2** mit der echten Sicherung des Betreibers: alte stabile App mit den Daten, dann Update auf den Release unter derselben Adresse | siehe unten |

Ergebnis des Altdaten-Tests 2 (Browser):
- Die neue Version läuft unter derselben Adresse. Der alte Cache ist entfernt, der neue aktiv.
- Es erscheint keine Einrichtung und keine Tour. „Was ist neu“ kommt genau einmal.
- Das Profil ist vollständig übernommen (33 von 33 Feldern unverändert), Hauptsport ohne Angabe ist Kickboxen.
- Verlauf, Einheiten, Turniere, Tests und Verschiebungen sind vollständig.
- Die Wochenbelastung stimmt mit dem ersten Test überein: 576 / 360.
- Alte Übungsnummern sind jetzt Text-IDs.
- Alle 11 Seiten laufen ohne Fehler.
- Die Daten von Ringzeit Dev auf derselben Adresse bleiben unberührt.
- Die Sicherung der alten App lässt sich auf einem frischen Gerät nach der Rückfrage laden.

Die Sicherung des Betreibers liegt nicht im Repo.

## 7. Release 2 (05.11.2026)

Inhalt: Entspannen (Atemübungen und Meditationen mit Stimme), Stimmenauswahl, Kalender mit Wochen-Blättern.
„Was ist neu“ hat `NEWS_V` 8. Upload wie in Abschnitt 3, aber **nur die geänderten Dateien** (siehe Paket). Es muss
nichts gelöscht werden. Geprüft: 237 Tests, Baseline, Gesamtprüfung, Browser, Isolation und ein Update vom
Prod-Stand `40b42d9` auf Release 2 mit der echten Sicherung (16/16).

## 8. Release 3 (05.11.2026)

Inhalt: Winter Arc (Oktober bis Januar, Gewohnheiten nach Wahl, Wochenziel Trainings), geführte 10-Minuten-Mobility mit
der Dosierung des Trainings, Pausieren für Entspannen und Mobility und die gemeinsame Timer-Steuerung (Korrektur nach der
externen Codeprüfung). „Was ist neu“ hat `NEWS_V` 9. Upload wie in Abschnitt 3, aber **nur die geänderten Dateien**
(siehe Paket). Es muss nichts gelöscht werden. Geprüft im Release-Stand: Testsuite, Baseline, Gesamtprüfung, Browser,
Isolation und ein Update vom Prod-Stand (Release 2) auf Release 3 mit der echten Sicherung.
