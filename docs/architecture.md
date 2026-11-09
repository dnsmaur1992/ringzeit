> **Nachtrag 08.11.2026 – Technik/Fitness getrennt:** `core/history.js` liefert `fitnessFor` aus den vier
> körperlichen Testwerten. `app/07-fitness-test.js` liefert technische Erfahrung je Sport/Style und
> eine unabhängige Dosierungsstufe. Profil/Onboarding verwenden einen gemeinsamen Drei-Stufen-Selektor.
> Dosierung ist je gebauter Einheit/Block eingefroren. Details: `data-load-concept.md`, Abschnitt 4.6.

# Ringzeit Dev – Architektur

Stand: Schritt 2 umgesetzt (wartet auf Abnahme), 03.11.2026. Konzept (Abschnitte 3–8) in Schritt 1 abgenommen.
Zeilenangaben in Abschnitt 2 und 5 beziehen sich auf die frühere Einzeldatei `src/ringzeit.html` @ `b8b6443`;
seit Schritt 2 liegt der Code in `src/` (Abschnitt 4).

## 1. Isolation stabile App ↔ Dev-App (Schritt 0, abgenommen)

| | Stabile App | Entwicklungsapp |
|---|---|---|
| Repository | `dnsmaur1992/ringzeit` (nur lesend) | `dnsmaur1992/ringzeit-dev` |
| Adresse | `https://dnsmaur1992.github.io/ringzeit/` | `https://dnsmaur1992.github.io/ringzeit-dev/` |
| Origin | `https://dnsmaur1992.github.io` | **dieselbe** Origin |
| localStorage | `ringzeit.v1` | `ringzeit-dev.v1` |
| Cache Storage | `ringzeit-<build>` | `ringzeit-dev-<build>` |
| Service Worker | Scope `/ringzeit/` | Scope `/ringzeit-dev/` |
| Manifest | Name „Ringzeit“ | `id`/`start_url`/`scope` `./`, Name „Ringzeit Dev“ |
| Sicherung | `app: "ringzeit"` | `app: "ringzeit-dev"`; stabile Sicherungen werden abgelehnt |
| Cloud (Claude-Host) | optional | aus (`CLOUD_SYNC = false`) |

Kein `sessionStorage`, IndexedDB oder Cookies im Code. Kennungen stehen nur in `APP_ID`/`APP_NAME` (Abschnitt „Storage“);
`tools/build_pwa.py` liest sie. „Neu starten“ entfernt nur `ringzeit-dev.v1`; der Dev-Service-Worker löscht nur
`ringzeit-dev-…`-Caches. **Grenze (bis zum Release):** Ein Update der *alten* stabilen App löscht alle fremden Caches,
auch den Dev-Cache (Dev-Daten bleiben). Der Service Worker des Releases (`tools/build_pwa.py`) schont `ringzeit-dev-…`.

## 2. Ausgangslage vor dem Umbau (historisch, Stand Schritt 1)

Befunde der Codeprüfung vor dem Umbau (Gesamtauftrag Abschnitt 9). Sie sind inzwischen behoben (Dosierung aus einer
Vorgabe in `core/prescription.js`, Belastung je Sport in `core/history.js`, ein `fmt`, Text-IDs, FC/K1 nur nach Alter) und
stehen hier nur zur Nachvollziehbarkeit. Damals am Code nachgeprüft:

- Ein Inline-Script (Zeile 4635–23437), keine Module, keine Klassen. Globaler Zustand `S` (8396) und `ui` (8407);
  Planlogik liest `S.profile` direkt (z. B. `sessMin`, `ageGroup`, `waFormat`-Aufruf in `compPhase` 8974).
- `buildSession` (10062) bündelt Auswahl, Belastung (`weekLoad`), Periodisierung (`phaseInfo`), Alters-/Disziplinregeln, Texte.
- Übungskatalog `X` (7438): 88 Einträge (warm 7, cond 19, str 34, mob 16, cool 6, pow 5, pre 1); `EX.id` = Arrayposition (8359).
  Abhärtungsübungen nutzen bereits stabile Text-IDs (`fWraps`, `neck`, `checks` …). Logs speichern Übungs-IDs in `perf`.
- Dosierung doppelt: Text aus `DOSE_FIX`/`DOSE_MIN`/`DOSE_SIDE`/`DOSE_LEG` + `doseTxt` (20959–21057), Timerphasen aus
  `exerciseTiming` (13385) mit eigenen Tabellen. Beide schlüsseln über **deutsche Namen**. Beispiel „Speed-Runden“:
  Text `4 × (10 s / 20 s locker)` (21005) und Timer `[4, 10, 20]` (13487) stimmen derzeit überein – Driftrisiko, kein Fehler.
- Belastung: `computeLoad` (9057) nutzt Minuten × RPE aus allen Logeinträgen (eigene **und** Verein), Entlastung bei
  Planwoche 5, RPE-Überschreitung oder Lastsprung > 30 %. Sportneutral, aber Logs tragen kein Sportfeld.
- Zufall: `rnd`/`shuffle` (8462) und weitere Stellen nutzen `Math.random` direkt (26 Aufrufe).
- `fmt` (12373) und `fmtS` (20059) sind identisch.
- Fitness-Freischaltung für Full Contact/K1 (`discLock`, 5638/6744) – widerspricht Gesamtauftrag 6A, Änderung erst in 3-U.
- `docs/trainingslogik.md` ist leer (bestätigt).

## 3. Leitlinien

- Bestehende Bausteine auslagern, nicht neu schreiben. Keine Frameworks, keine neuen Laufzeitabhängigkeiten.
- Explizite Eingaben statt verstecktem Zugriff auf `S`/`ui` – schrittweise, an den Stellen, die angefasst werden.
- Daten als Objekte (Sport, Regelprofil, Übung, Dosierung), Berechnungen als kleine Funktionen; Fabrikfunktion nur
  für Dienste mit Lebenszyklus (Speicher, Timer). Keine Vererbungshierarchie für Sportarten.
- Eine HTML-Datei für die Auslieferung bleibt (Offline-Cache, Pages-Unterpfad und Service Worker unverändert).

## 4. Struktur (umgesetzt in Schritt 2; „später“ = noch nicht vorhanden)

```
src/
  index.html                 Markup + CSS; die Zeile /*@@APP@@*/ im <script> ersetzt der Build durch das Script
  modules.js                 Einstieg der gemeinsamen Module → Bundle mit dem globalen Namen RZ
  core/                      ES-Module ohne Zugriff auf S/ui/DOM, direkt mit node --test testbar
    format.js                pad, fmtTime (früher fmt und fmtS – identisch, jetzt eine Funktion)
    dates.js                 iso, parse (mit Cache), monday, addDays, today, daysBetween, wd
    random.js                rnd, shuffle (lesen Math.random beim Aufruf → mit Seed reproduzierbar)
    storage.js               createStore({ key, storage, getState, compact, onFull, cloud, applyCloud, cloudDocs, onCloudLost })
    index.js                 sammelt core/
    history.js               Belastung (Minuten × Anstrengung), Entlastungsauslöser, Wochenprojektion, Bereichsmodell (Taekwondo je Stil: tkdRegions, 7b), Level je Sport – nur explizite Eingaben (3-U)
    prescription.js          strukturierte Dosierung (RX): Text, Timerphasen und Zeitschätzung aus denselben Zahlen; Härtungsstufen RX_HARD (3-D)
  catalog/
    ids.js                   stabile Text-IDs der 88 Übungen (`<Kategorie>.<Name>`), Zuordnung alter Zeilennummer ↔ ID (3-D)
    exercises.js             Übungskatalog (88 Zeilen) → EX, AV; `EX[id]` per Text-ID (und weiter per alter Zeilennummer lesbar)
  sports/
    index.js                 Register: SPORTS, sportFor(id) (ohne/unbekannt → kickboxing), visibleSports(), previewSports()
    kickboxing/index.js      SportDefinition: id, visible, rules, dayPattern (früher PATTERN), techniques
    kickboxing/rules.js      RULE_PROFILE (WAKO): DISCIPLINES, waFormat, STD_FORMAT; Fassung noch nicht belegt
    kickboxing/techniques.js TECH, KICKS, STRIKE, RISKY, ADV, COMBOS, EXTRA, KICK_ONLY, HAND_ONLY, THEMES
    boxing/                  SportDefinition (visible, seit 4b), rules.js (DBV: Altersklassen, Formate, K.o.-Sperre, WKB-Link), techniques.js (Kombinationen, Konter, Themen), tasks.js (Aufgabensparring) (4a-U)
    taekwondo/               SportDefinition (visible; WT und ITF-D: T/S/P/K/C/M; dayPattern = ITF, dayPatternWt = WT mit Mobility statt Kondition ab 4 Tagen, 7b), grades.js (Style, Kup/Dan/Poom, Gürtelfarben, Wartezeiten, Formnamen, Prüfungsteile) (6a), techniques.js (Techniken mit koreanischem Namen, Freischaltung, Kombis, Konter, Rundentexte, Aufgaben) (6b), rules.js (WT-/ITF-D-Altersklassen, Formate, K.o.-Sperre) (6b/6c), itf.js (ITF-D: Techniken mit eigenen Namen, Freischaltung, Hand-Fuß-Kombis, Konter, Matsogi-/Hosinsul-Aufgaben) (6c, Sammelexport als `ITFT`), all.js (Sammelexport als `TKDT`)
  app/                       übriger App-Code als geordnete Teile in gemeinsamem Scope (Reihenfolge = Dateiname)
    00-imports.js            die einzige Stelle, die Namen aus RZ übernimmt
    36-tkd-grade.js          Taekwondo-Gürtelbereich: Grad je Style, Prüfungen, Verlauf, Übersicht, `outfitFor` (Dobok/Gürtel der Figuren) (6a)
    01-overview-i18n.js … 39-boot.js   (neu in 2-B: 38b-resume.js, Wiederaufnahme) Schnitt entlang der bisherigen Abschnittsköpfe (03/04 sind nach catalog/ bzw.
                             sports/ umgezogen; die Nummern der übrigen Teile blieben, um Verwechslungen zu vermeiden)
tools/build_pwa.py           esbuild bündelt src/modules.js (IIFE, global RZ), hängt app/*.js an, setzt beides in
                             index.html ein → build/ringzeit.html (lesbar, von allen Tests genutzt) → pwa/ (komprimiert)
package.json                 nur Werkzeug: esbuild 0.24.2 (`npm install`)
```

`planContext(ds)` (in `app/08-plan.js`) liefert `{ profile, sport, history, date, today, rng }`. Die Turnierphase
(`compPhase`) und die Tagesverteilung (`dayTypes`) holen Format und Wochenmuster jetzt über die Sportdefinition statt
über feste Kickboxwerte; Profile ohne `sport` gelten als Kickboxen.

**Naht zwischen neuem Kern und Bestandscode:** Die Module werden mit esbuild als ein IIFE-Bundle mit genau einem
globalen Namen `RZ` gebaut. `src/app/00-imports.js` holt daraus *explizit* die genutzten Namen
(`const { fmtTime, createStore, sportFor } = RZ;`). So bleibt der Bestandscode lauffähig, die Tests behalten ihren
Zugriff auf `S`, `buildSession` usw., und jede Abhängigkeit vom Kern steht an einer Stelle. Der Bestandscode in
`app/` schrumpft mit jedem Teil; Kernmodule importieren nie aus `app/` – `tests/core.test.mjs` prüft, dass
`core/`, `catalog/` und `sports/` weder `S`, `ui`, `t()`, `render()` noch DOM/`window`/`localStorage` verwenden.

Alternative (nicht empfohlen): alles sofort als ES-Module – erfordert Import-Listen für rund 590 gemeinsam genutzte Namen der obersten Ebene (davon ~450 Funktionen) auf einmal
und ein neues Test-Harness; zu großer Sprung für eine reine Extraktion.

## 5. Übernahmeliste

| Baustein (Zeile) | Übernahme | Wann |
|---|---|---|
| `store` + `migrate`/`slimSessions`/`hydrate` (8481) | wird `createStore`, Kennung/Cloud von außen; Migrationen bleiben | 2 |
| `X`/`EX`, `okEx`, `pickEx` (7438, 9096) | Daten nach `catalog/exercises.js`, Auswahl unverändert; stabile Text-IDs (`catalog/ids.js`), Altdaten werden in `hydrate` (`migrateExIds`) umgeschrieben | 2 / 3-D ✓ |
| `TECH`/`COMBOS`/`EXTRA` (7236), `RT` (9220), `waFormat` (8953) | nach `sports/kickboxing/`; Regeln bekommen Alter/Disziplin als Parameter | 2 |
| `scheduleTimers`/`syncTimers`/`pauseOtherTimer` (19372), Audio, Wake Lock | bleiben in `app/`, unverändert; gemeinsamer Timervertrag erst bei Bedarf (2-B Wiederaufnahme) | – |
| `playerSteps`/`stepDone`/`setsHtml` (12887, 12274) | bleiben, werden von neuen Sportarten mitgenutzt | – |
| `figure`/`FIGS` (10651), `skFigure`/`SKETCH` (14887) | bleiben; Kleidung als Parameter in 4b/6a | 4b / 6a |
| `L`/`t()`, `summaryData` (4653, 18857) | bleiben; sportbezogene Texte später je Sportmodul | 4b ff. |
| `weekLoad`/`computeLoad` (9051) | Regeln jetzt in `core/history.js` (`deloadFor`, `projectWeek`); `app/08-plan.js` sammelt nur die Eingaben und ruft `changeLog()` bei Änderungen | 3-U ✓ |
| `fmt`/`fmtS` | zu einer Funktion in `core/format.js` | 2 |

Stand nach Schritt 2: erledigt sind `store` → `createStore`, Katalog, Techniken/Kombis, `waFormat`/`STD_FORMAT`,
Wochenmuster und `fmt`/`fmtS`. `RT` (Rundentypen-Texte) bleibt bis 4a im Plan-Teil, weil es mit den Rundenbausteinen
in `08-plan.js` verwoben ist; `okEx`/`pickEx` bleiben dort, weil sie Profilgrenzen lesen.

## 6. Verträge

### 6.1 Diensteingaben
Planfunktionen bekommen einen **PlanContext** statt globaler Lesezugriffe:
`{ profile, sport, history, date, today, equipment, rng }`. Ein Adapter `planContext(ds)` in `app/` baut ihn aus `S`.
In Schritt 2 nutzen ihn nur die verschobenen Kickboxregeln; weitere Funktionen folgen, wenn sie in 3-U/4a ohnehin
angepasst werden. UI und Speicher werden außen angebunden (`render`, `store.save` bleiben in `app/`).

### 6.2 Sport- und Regeldaten
```
SportDefinition  { id: "kickboxing"|"boxing"|"taekwondo", styles?: ["wt","itf"], disciplines: [DisciplineDef],
                   sessionTypes, equipment, techniques, drills, attire, guides, sources, visible: bool }
DisciplineDef    { id: "lc"|"kl"|"fc"|"k1"|…, ruleProfile, minAge? }
RuleProfile      { publisher, title, version, validFrom, scope, format(age, ageClass) → {r,w,b,cls}|null,
                   allowedTechniques, ageClasses }
```
Fachliche Erfahrung/Grade bleiben je Sport bzw. Style im Profil (`profile.sports[sport] = { level, discipline, grades }`),
Belastung und vergleichbare Fitnesstests gemeinsam (konkretes Schema: `docs/data-load-concept.md` Abschnitt 3).

### 6.3 Übungen, stabile IDs und Dosierung (Umsetzung 3-D)
```
ExerciseDefinition { id: "str.pushup" (stabil, nie Anzeige), legacyIndex?: 12, cat, name: {de,en,ko?}, desc,
                     equip, locs, avoid, minLevel, sides: "none"|"side"|"leg" }
Prescription       { sets?, reps?|[lo,hi], workSec?|[lo,hi], restSec?, betweenSec?, sides, changeoverSec?,
                     intervals?: {n, on, off}, laps?, holdSec?, distanceM?, note? }
```
- Bestehende Daten: numerische IDs (Arrayposition) werden beim Laden über `legacyIndex` abgebildet; Text-IDs
  (`fWraps` …) bleiben. Neue Daten speichern nur stabile IDs. Kein Neunummerieren.
- Aus einer `Prescription` werden **abgeleitet**: `doseText(p, lang)`, `timerPhases(p, choice)`, `estimateSec(p)`.
  Reine Wiederholungen bekommen keine erfundene Ausführungszeit; die Schätzung kennzeichnet einen Pauschalwert.
- Plan (Prescription, Ziel) und Ist (`perf`, `rpe`, Minuten) bleiben getrennt.
- Schlüssel ist die ID, nie der Anzeigename – Umbenennen/Übersetzen (auch koreanisch) ändert keine Dosierung.

### 6.4 Historie und Belastung (Umsetzung 3-Q/3-U)
Ein gemeinsames Log für alle Sportarten; jede absolvierte Einheit genau einmal. **Konkretisiert in 3-Q:
`docs/data-load-concept.md`** (Schema, Belastungs- und Bereichsmodell, Wochenvorlage, Korrektur/Löschung, Fitnesstest
und Level je Sportart, Dosierungsvertrag, Abweichungsliste, Akzeptanzfälle). Kurzfassung:
`LogEntry { id, date, src: "own"|"club", sport, style?, type, minutes, rpe, sid?, km?, perf?, … }` – keine Eintragsart
„sonstige Aktivität“ (Entscheidung E4, stattdessen „Freier Lauf“). Belastung = Minuten × RPE (Session-RPE) über alle
Quellen und Sportarten; Dauer und Anstrengung sind Pflicht (E5), Altdaten ohne Wert zählen nicht und werden benannt.
Einträge ohne `sport` gelten als Kickboxen (betrifft nur eigene Dev-Daten).

## 7. Umfang Schritt 2

Allen gemeinsam: **keine** Änderung an Training, Dosierung, Bedienung oder Texten; Vergleichsbasis muss identisch bleiben.

Umsetzung als **ein Umbau mit einer Abnahme** (Entscheidung 03.11.2026); die drei Teile sind interne Zwischenstände,
nach jedem laufen Bestandstests, Vergleichsbasis und Isolationstest. Fällt ein Zwischenstand durch, wird dort korrigiert.

| Zwischenstand | Inhalt | Prüfung |
|---|---|---|
| **2.1 Aufteilung und Build** | `ringzeit.html` → `src/index.html` + `src/app/*.js` entlang der Abschnitte; Build setzt zusammen, erzeugt `build/ringzeit.html` (lesbar) und `pwa/` | zusammengesetztes Script **byte-gleich** zum alten; alle Tests laufen auf `build/ringzeit.html`; Baseline identisch; Isolationstest |
| **2.2 Kerndienste** | `core/format`, `dates`, `random`, `storage` als Module + `RZ`-Naht; `fmt`/`fmtS` zusammen; `store` über `createStore` | neue Modultests (Node); 105 Bestandstests; Baseline identisch; Sicherung/Reset im Isolationstest |
| **2.3 Kickboxmodul** | `catalog/exercises.js`, `sports/kickboxing/*` (Techniken, Kombis, Formate, Regeln) + `planContext`; Sportregister mit nur Kickboxen sichtbar | Baseline identisch (alle 24 Profilläufe × 9 Einheiten + 2 Abläufe); Bestandstests; manuelles Kickboxtraining komplett |

Nicht in 2: stabile IDs/Dosierung (3-D), Belastungsmodell (3-U), Timer-Zustandsmaschine, UI-Vereinheitlichung,
Entfernen der Fitnesssperre, Bedienkorrekturen (2-B).

Ergebnis (03.11.2026): 2.1 zusammengesetztes HTML byte-gleich zur früheren `src/ringzeit.html`, komprimierte App bis
auf den Versionsstempel byte-gleich; 2.2 und 2.3 je mit 105/105 Bestandstests, neuen Modultests, identischer
Vergleichsbasis und bestandenem Isolationstest. Details: `implementation-status.md`.

## 8. Vergleichsbasis

`node tests/baseline.mjs` führt die echten Funktionen (`buildSession`, `weekPlan`, `planOn`, `clubOn`, `weekLoad`,
`phaseInfo`, `doseTxt`, `exerciseTiming`) und den echten Klick-Handler der App mit festem Datum (Mo 02.11.2026, 09:00),
virtueller Uhr, festem Zufall (mulberry32, Seed je Fall) und synthetischen Profilen aus und vergleicht mit
`tests/baseline/kickboxing.json`. Ton, Bildschirm-Wachhaltung und Zeichnen werden dabei nur protokolliert.

- **Profile (12):** LC Level 0 Erwachsen · LC Level 1 mit Vereinstagen · KL Jugend · FC Level 2 mit Turnier am
  28.11. (Peak-Phase) · K1 Level 2 mit Knieeinschränkung · LC Kinder (45 Min.) · KL Masters englisch, 4 Tage · LC mit
  Mobilitäts-Schwerpunktblock · KL mit Schulter- und Rückeneinschränkung · LC „wenig Zeit“ (30 Min.) · KL Level 2 an
  5 Tagen · LC mit Gürtelprüfung am 20.11. Jedes Profil ohne und mit Historie (2 Wochen eigene + Vereinseinheiten,
  löst Entlastung aus).
- **Je Profillauf:** Planung über 14 Tage, Belastung/Phase für 3 Wochen, 9 Einheiten am 04.11. (Technik Halle/zu Hause,
  Partner, gemischt, Kondition Halle/Lauf draußen, Kraft Halle/Studio, Mobilität) inkl. Dosierungstext und Timerphasen
  je Übung.
- **Zweckfremde Bedienung während des Trainings (2 Abläufe):**
  - *Technik:* Aufwärm-Timer starten → mit ✕ schließen → Heute, Profil → freier Rundentimer starten/schließen →
    Einheit wieder öffnen, fortsetzen → zur Runde springen, Runde starten → Übersicht öffnen und zurück → schließen,
    Verlauf öffnen, 45 s warten → zurück, Runde fortsetzen.
  - *Kraft:* Satzpause starten → schließen, 25 s auf Heute → zurück → vor- und zurückblättern → 90 s warten.
  - Festgehalten wird an jedem Punkt: Ansicht, Schritt, Rundentimer (Phase, Runde, läuft, Restzeit), Übungstimer,
    freier Timer, erledigte/offene Übungen, Eingaben, Logeinträge sowie die Folge von Glocke/Piepton/Wachhaltung.
  - Ist-Verhalten heute (nicht bewertet): Schließen/Navigieren pausiert laufende Timer ohne Zeitverlust, nichts wird
    automatisch abgehakt oder verbucht; Vor-/Zurückblättern verwirft eine pausierte Satzpause.
- **Empfindlichkeit geprüft:** Eine geänderte Dosierungszahl, eine geänderte Rundenregel und ein Timer, der beim
  Schließen weiterläuft, werden als Abweichung gemeldet.
- Nicht enthalten: Neuladen/Beenden der App während des Trainings – das ist Wiederaufnahme und gehört zu 2-B.
- Regel: Schritt 2 muss identisch bleiben. Bewusste Änderungen ab 2-B/3-U: Abweichung erklären, in
  `implementation-status.md` dokumentieren, dann mit `--write` neu aufnehmen.

## 9. Maßgebliche Dateien, Build und Tests

| Datei | Rolle |
|---|---|
| `src/` | Quelle (Abschnitt 4); Kennungen `APP_ID`/`APP_NAME` in `src/app/06-storage.js` |
| `tools/build_pwa.py` | Build: `build/ringzeit.html` (lesbar), `pwa/index.html` (komprimiert), `pwa/sw.js`, `pwa/manifest.webmanifest`; `--readable` baut nur die lesbare Fassung |
| `index.html`, `sw.js`, `manifest.webmanifest` | generiert, veröffentlicht (Kopie aus `pwa/`) – nicht von Hand ändern |
| `installieren.html` | Installationsseite, QR-Code auf die Dev-Adresse |
| `docs/data-load-concept.md` | Daten-/Belastungskonzept (3-Q): Schema, Belastungsvertrag, Dosierungsvertrag, Abweichungen, Akzeptanzfälle |
| `docs/rules-sources.md` | Regel- und Trainingsquellen (Herausgeber, Fassung, Geltungsbereich) |
| `docs/boxing-concept.md` | Boxen (4a-Q): DBV-Regelmatrix, Trainingskonzept, Aufgabensparring, Beispielprofile, Vorschlag 4a-U |
| `docs/taekwondo-concept.md` | Taekwondo (5): WT/DTU- und ITF-D-Regelmatrix, Kup-Modell je Style (Formen nur als Name), Terminologie mit Umschalter, Vergleichsmatrix, Beispielprofile, offene Dokument-/Trainerfragen, Vorschlag 6a–6d |
| `docs/final-check.md` | Gesamtprüfung (7a/7b): Belege getrennt nach automatisch, Gerät, fachlich; Befunde und Korrekturen |
| `docs/geraete-checkliste.md` | Geräte-Checkliste für die Gesamtabnahme (iPhone, installierte App) |
| `docs/trainer-pruefliste.md` | offene fachliche Punkte zum Abhaken (Regelwerke, Trainingsinhalte, Ratgeber) |
| `docs/abloesung.md` | Ablösung der stabilen App: Wege, Schritte, Rückweg, Ergebnis Altdaten-Test |
| `docs/release.md` | Release für die stabile App: was `tools/release.py` ändert, Upload-Anleitung, Prüfergebnis |
| `tools/release.py` | erzeugt aus dem Dev-Stand die Dateien für das stabile Repo (Kennung `ringzeit`) und baut sie |
| `docs/komponenten.md` | Komponenten und Zusammenspiel: Diagramme zu Build, Schichten, App-Teilen, Datenfluss und Speicher; „Wo ändere ich was?“ |
| `tests/app-source.mjs` | baut vor jedem Testlauf `build/ringzeit.html` frisch (`--readable`) und liefert es |
| `tests/training.test.mjs` | gebautes App-Script in Node-VM (Logik, Ereignisse, Speicherung, Wiederaufnahme, Ansagen, Historie/Belastung, Sportfeld, Freier Lauf, Bearbeiten/Löschen) – aktuelle Anzahl in `docs/implementation-status.md` |
| `tests/core.test.mjs` | Module direkt (Format, Datum, Zufall, Speicher, Modulgrenzen, Historie/Belastung/Bereiche/Level) |
| `tests/baseline.mjs` + `tests/baseline/kickboxing.json` | Vergleichsbasis Kickboxen |
| `tests/isolation.e2e.mjs` | Browserprüfung stabile App ↔ Dev-App (Playwright/Chromium) |
| `tests/final-check.mjs` | Gesamtprüfung (7a): jede Einheit von 12 Profilen × 3 Level × 6 Typen × 3 Orten im geführten Training bis zum Abschluss, Einzelprüfungen H1–H9; Laufzeit einige Minuten, `quick` = ein Ort |
| `tests/final-browser.cjs` | Gesamtprüfung (7a) im Browser am ausgelieferten Stand: Ansichten 390 px je Sport/Stil/Sprache, Offline/Cache, Inbetriebnahme frisches Profil |

```bash
npm install                     # einmalig; esbuild nach node_modules/
node --test tests/training.test.mjs tests/core.test.mjs
node tests/baseline.mjs
python3 tools/build_pwa.py && cp pwa/index.html pwa/sw.js pwa/manifest.webmanifest .
node tests/isolation.e2e.mjs <Ordner der stabilen App>
node tests/final-check.mjs        # Gesamtprüfung (einige Minuten)
node tests/final-browser.cjs      # Browserprüfung am ausgelieferten Stand
```

Baseline-Stand vor Schritt 0: Commit `914ed7d`, inhaltsgleich mit der stabilen App `ff7a7d8`; 105/105 Tests; Build mit
esbuild 0.24.2 bis auf den Versionsstempel byte-identisch zum veröffentlichten `index.html`.

## 10. Wiederaufnahme nach Neuladen/Beenden (2-B)

- **Eigener Speicherschlüssel** `ringzeit-dev.resume.v1` (Präfix der Dev-App, nicht Teil der Sicherung, wird mit „Neu starten“ gelöscht). Inhalt: Zeitstempel, Datum der Einheit, Position im Ablauf (Block/Schritt), Übungstimer und Rundentimer – **immer mit `running: false`** und der verbleibenden Zeit.
- **Gespeichert wird laufend** (`app/38b-resume.js`): bei jedem Taktgeber-Durchlauf (höchstens alle 2 s, mit nachlaufendem Schreiben), bei jedem Schrittwechsel/Phasenende, beim Verbergen der Seite und bei `pagehide`. Ein Stand mitten im Nachholen (Uhr hinkt) wird nicht geschrieben; es bleibt der letzte gute Stand.
- **Beim Start** (nach dem Ladebild, vor Neuigkeiten/Tour) fragt ein Dialog „Training fortsetzen?“ mit Datum, Uhrzeit und Schritt. Bis zur Antwort schreibt die App nichts (sonst würde der Stand gelöscht). „Fortsetzen“ stellt Position und Timer **pausiert** her; „Nicht fortsetzen“ löscht nur den Stand (Plan, Haken und die normale Schaltfläche „Training fortsetzen“ bleiben).
- **Nicht angeboten** (Stand wird still gelöscht, ggf. Hinweis): Einheit gelöscht, neu aufgebaut (Startzeit/Typ/Blockzahl anders) oder schon abgeschlossen.
- **Abgrenzung:** Bildschirmsperre/Appwechsel (Seite lebt weiter) bleibt unverändert – der Taktgeber holt die Zeit nach. Die Wiederaufnahme betrifft nur Neuladen, Schließen und Beenden durch das System; die in der Zwischenzeit vergangene Zeit wird nie als Runde, Haken oder Belastung verbucht.
