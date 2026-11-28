# Release: Ringzeit Dev → Ringzeit

Diese Anleitung bringt den abgenommenen Stand von **Ringzeit Dev** in die stabile App **Ringzeit**
(`dnsmaur1992/ringzeit`, `dnsmaur1992.github.io/ringzeit/`). Die Nutzer behalten Link, Home-Bildschirm-Symbol und alle
Daten. Den Hintergrund und den Rückweg beschreibt [abloesung.md](abloesung.md) (Weg 1).

**Arbeitsregel:** Jede Änderung entsteht zuerst in Ringzeit Dev. Prod bekommt sie nur über `tools/release.py`, nie durch
direkte Änderungen im Repo `ringzeit`. Vor jedem Release prüfen, dass der Code aus `tools/release.py` und der Code in
Prod sich nur in den gewollten Änderungen unterscheiden.

**Dateien, die je Repo eigen sind** und beim Release nicht übertragen werden: `docs/technik-fitness-test.md` und
`docs/einheiten-progression-test.md` (Test-Anleitungen mit Upload-Hinweisen für das jeweilige Repo; das Werkzeug lässt sie
weg) sowie `docs/todo-bedienung-akku.md` (gibt es nur in Prod). Die Notiz oben in der README setzt das Werkzeug selbst.

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

## 11. Updates 10.–16.11.2026 (aus Ringzeit Dev über `tools/release.py`)

Jeweils nur die geänderten Dateien, Upload mit denselben Pfaden, nichts löschen. Jedes Update wurde im Release-Stand mit
Testsuite, Kickbox-Vergleich, Gesamtprüfung (648 Abläufe), Browser (13), Isolation (12) und einem Update vom jeweiligen
Prod-Stand mit der echten Sicherung geprüft. Details in [implementation-status.md](implementation-status.md).

| Datum | Inhalt | Tests |
|---|---|---|
| 10.11. | Winter Arc: Feinschliff, kompakte Karte auf „Heute“ mit aufklappbarer Woche; Dev an Prod angeglichen (Codex-Änderungen aus Release 4 übernommen) | 264 |
| 11.11. | Neue Feste mit eigener Bewegung (St. Martin, Nikolaus, Advent, Dreikönig, Pfingsten, Erntedank, 1. Mai, Tag der Deutschen Einheit, Mutter- und Weltfrauentag, Mondneujahr, Holi); Winter Arc: heute und 3 Tage davor änderbar, letzte 7 Tage sichtbar; „Was ist neu“ 11 | 266 |
| 11.11. | Atemübung im Winter Arc auch an Vortagen von Hand abhakbar | 267 |
| 12.11. | Übungen nach Platzbedarf: Hip Thrust nur Fitnessstudio; Bear Crawl, Sprints, Standweitsprung nur Halle und draußen; Kickbox-Vergleich gewollt neu aufgezeichnet | 268 |
| 13.11. | Pflege: Arbeitsregel und Release-Doku, je Repo eigene Test-Anleitungen, Test-Build mit derselben Ausblende-Regel wie die App, Bitte um dauerhaften Speicher | 269 |
| 13.11. | Übersicht für den Trainer je Kalenderwoche (Tag, Dauer, Inhalt, neue Bestleistungen), nächstes Turnier und letztes Gewicht; Fehler „keine Bestleistungen“ behoben | 270 |
| 13.11. | Vollständiges Geburtsdatum als Pflichtangabe (Abfrage beim Start für bestehende Profile), genaues Alter für Anzeige und Schutzregeln, Geburtstag als Fest | 272 |
| 14.11. | Technik-Einheiten mit automatischem Schwerpunkt (auch Beinarbeit, Verteidigung & Konter, Taekwondo-Tritte); am Ende nur bis zu 10 Min. Kraft für diese Technik, sonst mehr Technikrunden; Kickbox-Vergleich gewollt neu aufgezeichnet | 273 |
| 15.11. | Weg zur Gewichtsklasse: Wiege-Erinnerung sobald eine Klasse eingetragen ist, unter Verlauf aktuelles Gewicht, nächstes Turnier, Klasse, Rest und Tempo, Richtlinie in der Kurve, Angaben in der Trainer-Übersicht | 274 |
| 15.11. | Hilfe & Fragen: „?“ auf jeder Seite, 43 Fragen mit Suche, Fragen zur aktuellen Seite zuerst, „Hinführen“ zur Funktion | 275 |
| 15.11. | Codeprüfung Schritt 1: „Hinführen“ führt zur nächsten vorhandenen Einheit statt auf Ruhetage; Hinweis bei Pause, ohne Trainingstage oder wenn alles erledigt ist; laufendes Training und Timer bleiben | 276 |
| 15.11. | Kraftziele aus eingetragenen Sätzen, auch mit Emoji-Steuerung: Mehrleistung in 2 von 3 Einheiten zählt (schwächster Satz), ein Hebel pro Schritt, Satzpause bei Steigerung 60 s, Schutztage, 14-Tage-Abstand | 277 |
| 15.11. | Kraftziele Schritt 2: Ändert der Fitnesstest den Wiederholungsbereich, wird die letzte Leistung umgerechnet übernommen statt neu zu beginnen | 278 |
| 15.11. | Kraftziele Schritt 2 nachgeschärft: Übertrag mit denselben Sperren wie eine Steigerung, belastungserhöhender Übertrag = ein Hebel (Pause 60 s), zeitliche Reihenfolge entscheidet | 278 |
| 15.11. | Onboarding: kein „Überspringen“, Vereinstage oder „Kein festes Vereinstraining“, Disziplin/Stil ohne Vorauswahl, Beschwerden oder „Keine“; Standard-Trainingsort (freiwillig, mit Erklärung, auch im Profil) | 279 |
| 15.11. | iOS-App: untere Leiste bleibt nach dem Scrollen nicht mehr mitten im Bild (eigene Ebene, kein fester Hintergrund, Neusetzen nach dem Scrollen) | 280 |
| 16.11. | Leitsatz zum Schwerpunkt als eigene Seite zwischen Aufwärmen und Hauptteil (angezeigt und angesagt) bei jeder Einheit mit Technik; Ansagen sprechen Abkürzungen aus (Sekunden, Minuten, Wiederholungen …) | 282 |
| 16.11. | Taktische Schwerpunkte: größere/kleinere Gegner, Kick mit Schlag und Schlag mit Kick kontern, gleiche/versetzte Auslage | 283 |
| 16.11. | Eine Sprachansage für alle Bereiche: ausgeschriebene Einheiten/Abkürzungen auch in Winter-Arc-Mobility, Atmen/Meditation, freiem Timer, Stimmprobe und bei Ersatzstimmen; Anzeige bleibt kurz | 289 |
| 17.11. | Federn & Antritt: 19 Drills für Stellung, Beinarbeit, Bewegungsmuster und Sprunggelenkskraft (je Sportart/Disziplin/Niveau), mit Skizze, Formtipps und Dosis; in Kraft, Kondition, Technik & Kondition und als eigener Schwerpunkt; Kommandos im Übungs- und Rundentimer (angezeigt und angesagt) | 295 |
| 17.11. | Federn & Antritt: zwei englische Texte ohne Boxwort „cross“ (Vier-Felder-Sprünge, Richtungswechsel im Taekwondo); Test prüft alle Drill-Texte je Sportart | 296 |
| 17.11. | Schritt 1 (Trainingsmatrix): Federn-Runden zählen in der Federn-&-Antritt-Bilanz (Runden + Abschlussblock gemeinsam unter der Grenze, überzählige Runden bleiben Beinarbeit), Partnerangriffe ohne Wiederholung, Rollen nur Boxen; Tests mit festen Seeds | 298 |
| 17.11. | Schritt 2: Schwerpunkte der Reihe nach (am längsten nicht gewählt, über Technik, Technik & Kondition und Sparring derselben Sportart; Beinarbeit, Verteidigung, Federn kommen jetzt dran); freiwillige Körpergröße im Profil verschiebt nur die Gegner-Schwerpunkte; nicht begonnene Einheiten einmal neu erstellt | 302 |
| 17.11. | Schritt 3: Grundabdeckung Kickboxen – je Technikeinheit eine Runde „Distanz & Ausgang“ (Eingang–Kombination–Ausgang oder Ausgang zuerst, je Disziplin) und eine Verteidigungsrunde (mit Partner: echter Angriff); kurze Einheiten und Technik & Kondition im Wechsel; Schwerpunkt deckt seine Art ab | 305 |
| 17.11. | Schritt 4: Vorbereitung auf den Schwerpunkt am Ende des Aufwärmens (2 Min., 2–3 Teile mit Timer und Ansage, „Direkt los“); nicht begonnene Einheiten einmal neu erstellt | 308 |
| 17.11. | Schritt 5–7: Federn & Antritt mit Federzeit, Landungen und Grenzen je Fitnessstufe (Zeile in der Einheit), vorsichtige automatische Steigerung je Drill; Partnerangriffe passend zum Konter-Schwerpunkt; WAKO-Regelfassung geprüft; zwei Hilfefragen | 311 |
| 18.11. | Reihenfolge im Training: Schwerpunkt als eigene Seite vor der Vorbereitung | 313 |
| 18.11. | Ratgeber: „Energiebedarf & Gewichtsklasse“ mit Lesetext je Sport und Rechner (Spanne, Ziele mit Grenzen, nichts gespeichert, unter 18 nur Lesetext); automatische Lastverteilung ab 5 Trainingstagen (Frage, Schalter, höchstens 3 harte Tage, Nachholen in der Woche); zwei Hilfefragen | 313 |
| 18.11. | Prüfauftrag 1–4: Nachholbedarf nur einmal; Federn-Anteil der Vorbereitung in der Bilanz (reserviert bei der Planung); Wortlaut der Steigerung (+1 Wdh. bzw. +1 s je Satz); Krafteinheit im Fitnessstudio (Geräte je Bewegungsmuster, Cardio + Kettlebell, kein Sprung- und Abhärtungsblock, „Anderes Gerät“, sechs neue Übungen mit Skizze) | 319 |
| 18.11. | Prüfauftrag 2: harte Nachholtage richten sich nach der aktuellen Woche (Herabstufen über 3 harten Tagen, Einträge neu/geändert/gelöscht, kein neuer Anspruch); „Gerät wechseln“ gesperrt bei jeder Eingabe (auch eine Seite), deutlicher Knopf 44 px; Leichtkontakt bleibt bei 4 Techniken nach Körpertreffer/Hochkick; Tests mit festen Seeds, Zeitüberschreitung getrennt gemeldet | 322 |
| 18.11. | Teil 36: Lastverteilung nach tatsächlicher Belastung – die letzten 3 Tage entscheiden (nur Einträge), harte Einheit bleibt beim Verschieben hart, Tagesform tauscht harte Tage (nur wenn angegeben), Kraft/Sparring/Kondition auf den harten Tagen, Fortschrittskarte im Verlauf | 326 |
| 18.11. | Lastverteilung: Schalter für Erwachsene immer im Profil (Trainingswoche), Hinweis unter 5 Tagen, Frage weiter ab 5 Tagen; Hilfe um Teil 36 ergänzt | 326 |
| 21.11. | Wenig-Zeit-Modus: geöffnete leere Einheit wird sofort gekürzt (vorher unverändert), Knopf „Wenig Zeit“ an der Einheit, Eintrag oben im Profil bis zum Ausschalten | 327 |
| 21.11. | Wenig-Zeit-Modus Teil 39: Planart automatisch (Kraft erhalten / kurze Intervalle), nur Körpergewicht + Sandsack/Klimmzugstange, kein Partner, keine Kopfkicks, Aufwärmen voll | 329 |
| 21.11. | Update auf Wunsch: „Nach Update suchen“ unter App & Daten, Hinweis „Neue Version verfügbar“ beim Zurückkehren, Service Worker holt die App-Seite am HTTP-Cache vorbei | 330 |
| 25.11. | Security: Datenprüfung bei Import und Start, Escaping, Sicherheitskopie + Rückgängig beim Laden, Content-Security-Policy, esbuild 0.25.12 | 333 |
| 25.11. | Partnerdrills in Blöcken: 3 Runden je Kombination, höchstens 3 Kombinationen, Stufen sauber → Tempo → Gegenaktion, roter Faden leicht → schwer (alle Sportarten, auch Kondition) | 335 |
| 25.11. | Teil 43: Kombinationen nach Bewegung (Seitenwechsel, Drehung, Distanz, Gewicht; alle Sportarten), Partner-Einheiten in Themenblöcken 8–12 Min. am Stück mit Stufen nach Zeit, ein Thema pro Einheit | 335 |
| 25.11. | Weniger Gegenaktionen: etwa 2 von 5 Blöcken, Konter des Partners mitten in der Kombination (Schlag oder Kick) | 335 |
| 26.11. | Kombinationen überall 4–7 Aktionen (auch Leichtkontakt), Kinder 2–3; höchstens eine Spezialtechnik je Kombination | 335 |
| 26.11. | Erster Block mind. 4 Aktionen, Ausgangsschritt bei Größer/Kleiner, 2 Sandsackrunden nach den Blöcken, Kinder max. 6 Blöcke, kurze Ansage, „Block“ im Timer; alte Kombinationslisten entfernt | 336 |
| 28.11. | Partnertraining geprüft: kein Kopfkick aus Uppercut/Knie, Konter passend zur Distanz, Abwehr passend zur Fortsetzung, Thema in jedem Block | 336 |
| 28.11. | Zwei große Kombinationen (6–8) in je zwei Blöcken aufgebaut (erst 3–5, dann ganz), kurze Kombinationen (3–5) in den übrigen Blöcken, Gegenaktion im zweiten Block | 336 |
| 28.11. | Abwehr nach Körpermechanik: keine Doppeldeckung, Slip nur außen (innen nur mit Haken über den Jab), Slip mit Cross, aktives Blocken mit Gegenseite danach; kein Körper-Jab → Körper-Cross, höchstens zwei Techniken von einer Seite | 337 |
