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


## 9. Release 4 (09.11.2026)

**Diese Schritte gelten für das aktuelle Änderungspaket.** Basis Prod `e23d121`, übernommen aus
Dev `3385b8b`. Es enthält nur neue oder geänderte Dateien gegenüber diesem Prod-Stand.
Keine Dateien löschen und keinen Dev-Datenspeicher in die Prod-App übernehmen.

### Inhalt

- Technikniveau je Sport/Stil unabhängig von körperlicher Fitness. Bestehende Profile behalten ohne neuen
  Fitnesstest ihre körperliche Ausgangsstufe; neue Profile starten zurückhaltend.
- Pflichtbewertung mit fünf Emojis am Ende statt separater Rückfragen an Übungen und zusätzlicher
  Dreierbewertung. Sehr locker +10 %, Locker +5 %; Fordernd optional +5 %;
  Hart optional −5 %, Am Limit optional −10 %, ansonsten beibehalten.
- Impulse betreffen die nächste eigene Einheit derselben Sportart/Stil/Disziplin und Gattung,
  zunächst über Pausen, insgesamt Faktor 0,8–1,2. Erholung und Schutzregeln bleiben vorrangig.
- Einmaliger Update-Hinweis (`NEWS_V` 10) in DE/EN.
- Beim ersten Start werden alte unbegonnene Planvorschauen unter Beibehaltung von Sport/Stil,
  Gattung, Dauer, Ort und Ausrüstung neu erzeugt. Begonnene, erledigte und fortsetzbare Einheiten bleiben bestehen.

### Upload

1. In der bisherigen **Ringzeit** eine Sicherung exportieren. Den bisherigen Code als GitHub-ZIP aufheben.
2. Das Paket `NUR-PROD_ringzeit_Release-4_2026-11-09.zip` entpacken.
3. Im Repository **dnsmaur1992/ringzeit** alle enthaltenen Dateien mit ihren vorhandenen Unterordnern hochladen.
   Insbesondere Root-`index.html` und `sw.js`, Quelle `src`, Tests und Dokumentation gemeinsam ersetzen.
4. Nichts löschen. Keine Installation und kein erneutes Einrichten erforderlich.
5. Pages-Veröffentlichung abwarten, App online schließen/neu öffnen; bei altem Stand noch einmal öffnen.

### Nachkontrolle

- Die App heißt Ringzeit und zeigt die neue Version und einmal den neuen Hinweis.
- Eigenes Profil, Verlauf, Gürtel, Turniere und Tests sind erhalten; begonnene Einheit ist fortsetzbar.
- Im neuen Training keine Schweregrad-Fragen pro Übung. Abschluss ohne Emoji/RPE nicht möglich.
- Locker/Sehr locker zeigt den automatischen Impuls. Fordernd/Hart/Am Limit zeigt die angebotene Wahl.
- Bei Kraft stimmt die angezeigte Satzpause mit dem Timer überein.
- Dev-App hat unverändert ihre eigenen Daten. Nach einem Online-Start optional offline öffnen prüfen.

Details: `einheiten-progression-test.md`, `technik-fitness-test.md`, `release-4-pruefung.md`.

### Prüfung vor Erstellung des Pakets

261 Tests bestanden; Kickbox-Baseline 24 Profile × 9 Einheiten plus 2 Abläufe identisch zum neuen Sollstand.
648 vollständige Trainingsabläufe ohne Befund plus H1–H9, darunter 216 Text-/Timer-Vergleiche.
Update von synthetischen Zuständen aus dem echten vorherigen Prod-Code für Kickboxen, Boxen, WT und ITF
geprüft: Profil, Verlauf, Einstellungen, begonnene Vorgaben, Reload und getrennte Speicher erhalten.
Service-Worker-Cachetrennung in einer simulierten Aktivierung geprüft; fertiger Produktionsbuild erstellt.
**Keine neue echte Browser-/iPhone-/Android-Abnahme.** Frühere Browserergebnisse in diesem Dokument
beziehen sich auf frühere Releases. Nichts wurde automatisch hochgeladen oder veröffentlicht.

### Rückweg

Falls nötig den vorher gesicherten Code wieder hochladen. Den Service-Worker-Cachebezeichner dabei auf
einen neuen eindeutigen Wert setzen, damit auch das Zurückspielen zuverlässig als Update erkannt wird.
Nur falls Nutzerdaten zurückgesetzt werden sollen, die vor dem Update exportierte Ringzeit-Sicherung laden.


## 10. Korrektur zu Release 4: Winter-Arc-Mobility (09.11.2026)

Basis Prod `f0048fd`. Paket `NUR-PROD_ringzeit_Winterarc-Mobility_2026-11-09.zip` enthält nur geänderte/neue
Dateien. Upload in **dnsmaur1992/ringzeit** mit denselben Pfaden, nichts löschen. Root-`index.html` und
`sw.js` mitnehmen. Datenformat, Datenspeicher und Update-Hinweis-Zähler bleiben erhalten.

Enthält Übungsskizzen im Winter-Arc-Mobility-Player, eine langsame Skizze für Zeitlupen-Kicks,
korrekte Restzeitanzeige während Pause/Fortsetzen sowie die Reparatur der kleinen Skizze in der
Arbeitsphase des Rundentimers. Ablauf und Dosierungen bleiben gleich.

Prüfung: 264 Tests und Baseline bestanden, Ablaufmatrix 216 Einheiten plus H1–H9 bestanden.
Keine neue echte Browser-/Geräteabnahme. Handprüfung und Details: `winterarc-mobility-test.md`.
