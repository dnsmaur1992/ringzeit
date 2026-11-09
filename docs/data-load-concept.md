> **Aktueller Nachtrag 08.11.2026:** Abschnitt 4.6 ersetzt die frühere Fitnesssperre (E7). Frühere Tabellen und Akzeptanzfälle dokumentieren die damalige Entscheidung.

# Ringzeit Dev – Daten- und Belastungskonzept (Teil 3-Q)

Status: **Konzept, abgenommen am 03.11.2026** (Entscheidungen zu Abschnitt 1 und 7 eingearbeitet). 3-U ist umgesetzt, siehe Abschnitt 9. Umsetzung: Historie, Belastung und Auswahl in **3-U**, stabile
Übungs-IDs und strukturierte Dosierung in **3-D** – jeweils nur nach Sichtung dieses Dokuments und eigenem Auftrag.
Grundlage: Gesamtauftrag 6A/6B, Antworten des Betreibers vom 03.11.2026, Code-Stand `main` @ `54d7ed2`.

---

## 1. Entscheidungen aus 3-Q (Betreiber, 03.11.2026)

| Nr. | Thema | Entscheidung |
|---|---|---|
| E1 | Sportart je Einheit | Jede eigene **und** jede Vereinseinheit trainiert standardmäßig den **Hauptsport aus der Inbetriebnahme**. Für eine einzelne Einheit kann die Sportart umgestellt werden; das gilt nur für diese Einheit. Ein späterer Hauptsportwechsel betrifft nur künftige Einheiten ohne eigene Umstellung. |
| E2 | Wochenstruktur bei anderer Sportart | Tage und Art je Tag (Technik, Kraft, Kondition, Sparring, Mobility) bleiben. Nur der Inhalt kommt aus der gewählten Sportart; Kraft, Kondition und Mobility sind gemeinsame Bausteine mit sportpassenden Beispielen. |
| E3 | Turniere und Prüfungen | Bekommen eine Sportart (bei Taekwondo auch Style). Turniere **jeder** Sportart steuern die Belastungsphasen (Aufbau, Entlastung, Erholung). Format und spezifische Vorbereitung aus der Sportart des Turniers. Gürtelprüfungen wirken nur auf ihre Sportart. |
| E4 | Sonstige Aktivitäten | **Keine** eigene Eintragsart. Stattdessen bei Kondition/Draußen eine dritte Wahl **„Freier Lauf“**: kein geführter Timer, danach Minuten, Strecke (km) und Anstrengung eintragen; zählt als eigene Konditionseinheit. Strecke nur Anzeige/Vergleich (Tempo), Belastung = Minuten × Anstrengung. |
| E5 | Fehlende Dauer/Anstrengung | **Pflichtangabe.** Nichts ist vorausgewählt, auch nicht beim Vereinstraining (heute „Gemischt“ + Anstrengung 7 vorbelegt). Es gibt keine Schätzwerte in der Belastung. |
| E6 | Woche und Planaktualisierung | Nicht Begonnenes verfällt; jede Woche startet mit der **festen Vorlage** (Trainingstage und Art je Tag), unabhängig von Änderungen der Vorwoche. Tatsächliche Ergebnisse beeinflussen **Umfang und Intensität** – bei neu erzeugten Einheiten und bei noch nicht begonnenen Einheiten der laufenden Woche –, **nicht die Trainingstage**. |
| E7 | Level und Fitnesstest | **Mittelweg:** Der Fitnesstest löst das Level weiterhin aus; dabei zählt der Testteil „Technik“ (Selbsteinschätzung) **je Sportart**. Level getrennt je Sportart. Kraft, Schnelligkeit, Ausdauer, Beweglichkeit gemeinsam. **Wettkampfklasse frei wählbar** im Rahmen von Alter/Regeln; die Fitnesssperre für Full Contact/K1 entfällt. |

Bestätigt (Sichtung 03.11.2026): Die **bestehenden Schutzregeln**, die heute
die Art eines Tages tauschen (Sparring → Technik nach KO-Sperre, nach Vereins-Sparring am Vortag, in einer als stressig
markierten Woche, im Ramadan), bleiben erhalten. Sie ändern nicht den Trainingstag, nur die Art an diesem Tag.

## 2. Ist-Stand (Befunde, nur Lesen)

| Befund | Fundstelle | Folge für das Konzept |
|---|---|---|
| Log-Einträge haben kein Sportfeld; `src` = `own`/`club`; eigene Einheit mit `type`, `minutes`, `rpe`, `perf`, `rounds`, `completed`, `tHi`. | `app/13-training-flow.js` `saveTrainingSession`, `app/21-sheet.js` `clubsave` | Feld `sport` (+ `style`) ergänzen; fehlend = `kickboxing`. |
| Vereinseintrag: Art `X` und Anstrengung 7 vorausgewählt, Dauer vorbelegt. | `app/38-events.js` (`clublog`), `app/21-sheet.js` | E5: keine Vorauswahl, Pflichtfelder. |
| Belastung = Minuten × Anstrengung (Session-RPE) je Woche; Entlastungswoche bei geplantem 5. Woche, zu harten Einheiten (RPE ≥ Ziel + 2) oder Wochensprung > 30 % gegenüber den 3 Vorwochen (bei > 600 Einheiten). | `app/08-plan.js` `computeLoad`, `weekLoad` | Bleibt das Kernmodell; nur explizite Eingaben statt `S`. |
| Keine Körperbereiche; Nachbarschaft nur über „harter Tag oder Verein am Vortag/Folgetag“. | `hardNear`, `suggestOn` | Einfaches Bereichsmodell (Abschnitt 4.3). |
| Löschen eines Eintrags berechnet weder Cache noch offene Einheiten neu; Bearbeiten gibt es nicht. | `app/38-events.js` (`ds.del`) | Korrektur + Löschen mit Neuberechnung (4.5). |
| Level-Auswahl ist auf `maxLevel()` aus dem letzten vollständigen Fitnesstest begrenzt; FC/K1 bei Level 0 gesperrt. | `app/07-fitness-test.js`, `app/15-player.js` | E7. |
| Fitnesstest: `raw {str, spd, end, flx, tec}`; Fälligkeit nach 42 Tagen. | `app/07-fitness-test.js` | `tec` je Sportart; übrige gemeinsam, 42 Tage gültig. |
| Turniere/Prüfungen: `profile.comps [{id, kind: comp|grade, date, result}]`, ohne Sportart. | `compPhase`, `phaseInfo` | Feld `sport` (+ `style`, `disc`). |
| Rückimport ersetzt den gesamten Stand (`hydrate`) – keine Doppelzählung durch Import möglich. | `app/23-backup-summary.js` | Bleibt so; zusätzlich Wiederaufnahme-Stand verwerfen. |
| Übungs-ID = Zeilenposition im Katalog; Dosierung als Text-Tabellen + separate Timerlogik. | `catalog/exercises.js`, `app/33-dose.js`, `app/15-player.js` `exerciseTiming` | 3-D (Abschnitt 6, 7). |

## 3. Datenschema (Zielstand nach 3-U/3-D)

Grundsatz: **ein** Speicherstand, **eine** Historie. Neue Felder sind optional; ein fehlendes Feld bedeutet den heutigen
Kickbox-Stand. Kein Altimport, aber eigene Dev-Sicherungen bleiben ladbar (`hydrate` ergänzt Standardwerte).

```text
State {
  v: 2                                   // Schema-Version (fehlt = 1)
  profile: Profile, sessions: {date → Session}, log: LogEntry[], tests: FitnessTest[],
  weights, ov, cov, pauses, ko           // unverändert
}

Profile {
  sport: "kickboxing" | "boxing" | "taekwondo"          // Hauptsport aus der Inbetriebnahme (fehlt = kickboxing)
  style?: "wt" | "itf"                                   // nur taekwondo
  days, minutes, club {days, minutes}, comps, limits, birthYear, sex, lang …   // gemeinsam, wie heute
  sports: {                                              // alles Sportbezogene getrennt je Sport/Style
    kickboxing: { level, disc, focus, belt, gp },        // heutige Felder wandern hierher (lesend weiter kompatibel)
    boxing:     { level, class? },                       // Klassen erst nach 4a-Q
    taekwondo:  { wt: { level, grade? }, itf: { level, grade? } }   // Gradfelder ohne Farben/Programme bis Teil 5
  }
}

Session {                                // geplante/begonnene Einheit eines Tages (wie heute) plus:
  id: "s…"                               // stabil, für die Verknüpfung mit dem Log-Eintrag
  sport, style?                          // E1: aus Profil, für diese Einheit umstellbar
  run?: "guided" | "free"                // E4: freier Lauf
}

LogEntry {                               // die einzige Belastungsquelle
  id: "e…", date, src: "own" | "club"
  sport, style?                          // fehlt = kickboxing
  type                                   // own: T/P/C/K/S/M …; club: "V" + ck (T/P/K/S/X)
  minutes, rpe                           // Pflicht (E5); Altdaten ohne Wert → "unvollständig", nicht geschätzt
  sid?                                   // own: Session-ID → höchstens ein Eintrag pro Einheit
  km?                                    // nur freier Lauf
  perf?, rounds?, completed?, openExercises?, tHi?, note   // wie heute
  edited?: ISO-Zeitstempel               // nach Korrektur
}

Comp { id, kind: "comp" | "grade", date, sport, style?, disc?, result? }   // fehlt sport = kickboxing

FitnessTest {
  id, date, method: "rz-1"               // Prüfverfahren (heutiger Test); andere Verfahren werden nicht verglichen
  raw: { str, spd, end, flx }            // gemeinsam (Liegestütze, Sprint/Schnelligkeit, 2,4 km, Beweglichkeit)
  tec?: { sport, style?, value }         // Technik-Selbsteinschätzung nur für diese Sportart
  scores, total, complete                // wie heute, Bewertung nach Norm des Verfahrens
}
```

Stabile Übungs-IDs (3-D, Form wie `architecture.md` 6.3): Kennung als Text (`"str.plank"`, `"str.neck_iso_hold"` …) mit
einer **festen Abbildung** der heutigen Zeilenpositionen (`legacyIndex`). Gespeicherte `perf[].id` und Sessions mit Zahlen-IDs
werden beim Laden über diese Tabelle gelesen; neue Daten speichern die Text-ID. Anzeigenamen (DE/EN, später
koreanische Umschrift) hängen nur an der Kennung. Dosierung, Skizzen, Tipps und Auswahlregeln verwenden ausschließlich
die Kennung, nie den deutschen Namen.

## 4. Belastungsvertrag (`core/history.js`, Umsetzung 3-U)

Alle Funktionen bekommen ihre Eingaben explizit: `{ log, sessions, profile, date }` – kein Zugriff auf `S`/`ui`/DOM.
Alle Module (Kickboxen, Boxen, Taekwondo) lesen dieselben Funktionen; es gibt kein Belastungskonto je Sportart.

### 4.1 Einheit und Woche

- `entryLoad(e)` = `minutes × rpe` (Session-RPE, Quelle: `rules-sources.md` T1). Fehlt einer der Werte (nur Altdaten),
  zählt der Eintrag **nicht** und die Erklärung nennt „n Einträge ohne Angaben“.
- Abgebrochene Einheit: zählt mit der **tatsächlich angegebenen** Dauer (wie heute: Abschlussdialog verlangt bestätigte Dauer).
- Vorschau, geplante, ausgelassene oder verfallene Einheiten: **kein** Log-Eintrag → keine Belastung.
- `weekLoad(mon)` = Summe der Einträge Mo–So (eigene + Verein, alle Sportarten).
- Entlastung der Folgewoche – **bestehende Regeln unverändert**, jetzt sportübergreifend:
  geplante 5. Woche · ≥ 2 Einheiten mit RPE ≥ Ziel + 2 bzw. Mittel > Ziel + 1 · Vorwoche > 600 und > 1,3 × Mittel der
  3 Wochen davor (mit ≥ 2 belegten Wochen). Hinweis zur Grenze: Das Verhältnis akut/chronisch ist als Verletzungsprognose
  umstritten (T2); es dient hier nur als einfacher, erklärbarer Auslöser für „etwas leichter“, nicht als Risikoaussage.

### 4.2 Laufende Woche (E6)

- Vorlage: `profile.days` + Wochenmuster des Hauptsports → Art je Tag. Verschiebungen/Zusatztage (`ov`, `cov`) gelten nur
  für ihr Datum. Nicht begonnene Einheiten vergangener Tage verfallen (kein Eintrag, keine Belastung).
- **Projektion** für die vorausschauende Verteilung: `done` (Einträge bis heute) + `planned` (verbleibende Tage der Woche:
  geplante Minuten × Mitte des Ziel-RPE; Vereinstage mit geplanten Minuten × 6 als *Planwert*, nie als Eintrag).
- Liegt die Projektion über 1,3 × chronischem Mittel (gleiche Bedingungen wie oben), werden die **noch nicht begonnenen**
  eigenen Einheiten der laufenden Woche mit der vorhandenen Entlastungsstufe gebaut (Ziel-RPE −1,5, weniger Umfang).
  Trainingstage und Art bleiben (E6).

### 4.3 Überschneidungen – einfaches Bereichsmodell

Fünf Bereiche: **Beine/Tritte**, **Schultern/Arme/Schläge**, **Rumpf**, **Ausdauer/Intervalle**, **Beweglichkeit**.
Jeder Eintrag verteilt seine Belastung mit Anteilen (Summe 1) auf die Bereiche; keine Muskel- oder Erholungszeiten.

| Quelle | Anteile |
|---|---|
| Übung aus dem Katalog | aus vorhandenen Daten: Meidecodes `k`/`a` → Beine, `s`/`w` → Schultern/Arme, `b` → Rumpf; Kategorie `cond` → Ausdauer, `mob`/`cool` → Beweglichkeit; mehrere Codes teilen gleichmäßig. Nach 3-D direkt als Feld `regions` je Übung. |
| Runden mit Kombinationen | Tritt-/Schlaganteil der Kombination (`kickShare`) → Beine bzw. Schultern/Arme; Sparring zusätzlich 0,2 Ausdauer. |
| Eigene Einheit gesamt | Mittel der Übungsanteile, gewichtet mit der geplanten Dauer je Block. |
| Vereinseinheit (ohne Inhalt) | nach Art: Technik 0,4/0,4/0,2 (Beine/Arme/Rumpf) · Sparring 0,35/0,35/0,1 + 0,2 Ausdauer · Kondition 0,2/0,1/0,1 + 0,6 Ausdauer · Kraft 0,35/0,35/0,3 · Gemischt 0,3/0,3/0,1 + 0,3 Ausdauer. Boxen: Beinanteil auf 0,15 gesenkt, Rest Arme. |
| Freier Lauf | 0,3 Beine, 0,7 Ausdauer. |

Eine einzige Regel nutzt die Bereiche: War **gestern** ein Eintrag mit RPE ≥ 7 und Bereichsanteil ≥ 0,4 (z. B. hartes
Vereins-Sparring → Beine), wählt die Planung heute für diesen Bereich die leichtere Variante (weniger Sprung-/Trittvolumen
bzw. weniger Schlagvolumen am Sack, Kraftübungen zuerst für die anderen Bereiche). Erklärung in einem Satz, z. B.
„Gestern viel Beinarbeit (Verein, hart) – heute weniger Sprünge und Tritte.“

### 4.4 Sportwechsel

- Kein Erholungsreset: Ein Sportwechsel (Hauptsport oder einzelne Einheit) liest dieselbe Historie.
- Kein Technik-/Gürtel-Übertrag: Level, Grad, Disziplin/Klasse, Technikprogression gelten nur für ihren Sport/Style.
- Allgemeine Kraft-/Ausdauerwerte (`perf` gleicher Übungs-ID, gemeinsamer Fitnesstest) werden sportübergreifend genutzt.
- Begonnene und abgeschlossene Einheiten werden nie umgedeutet (ihre `sport`-Angabe bleibt).

### 4.5 Korrektur, Löschung, Doppelzählung

- Einträge sind **bearbeitbar** (Dauer, Anstrengung, Art, Sportart, Notiz) und löschbar.
- Nach Anlegen/Ändern/Löschen: Belastungs-Cache verwerfen, die **noch nicht begonnenen** Einheiten von heute bis Sonntag
  neu bauen (nur Umfang/Intensität), kurzer Hinweis nur, wenn sich dadurch etwas ändert.
- Eigene Einheit: höchstens ein Eintrag pro Session (`sid`), wie heute pro Datum über `doneOn`.
- Rückimport einer eigenen Sicherung ersetzt den Stand vollständig (wie heute) → keine doppelten Einträge; der
  Wiederaufnahme-Stand wird dabei verworfen.

### 4.6 Technikniveau und körperliche Dosierung (ersetzt E7, 08.11.2026)

- Technikniveau wird manuell je Sportart/Style nach Vereinserfahrung gewählt (Grundlagen, Geübt, Erfahren).
- Speicherung: `profile.techLevels` mit `kickboxing`, `boxing`, `taekwondo:wt`, `taekwondo:itf`.
  `profile.level` bleibt aus Kompatibilitätsgründen der technische Wert des Hauptsports.
- Der jüngste vollständige körperliche rz-1-Test (vier gültige Scores 1–5: str/spd/end/flx) liefert die
  Dosierungsstufe: Summe ≥ 16 und Minimum ≥ 3 → 2; ≥ 12 und ≥ 2 → 1; sonst 0. Das sind eigene
  Planungsgrenzen, keine medizinischen Normen. Technik-Scores ändern diese Stufe nicht.
- Unvollständige/andersartige Tests ersetzen einen vollständigen vergleichbaren Test nicht. Der jüngste
  vergleichbare Test bleibt wirksam; nach 42 Tagen erinnert die App wie bisher an einen neuen Test,
  sie stuft Erfahrung oder Belastbarkeit nicht allein wegen verstrichener Zeit automatisch ab.
- Altes Profil: gewähltes Niveau bleibt für den Hauptsport erhalten; `fitnessBase` friert einmalig die
  bisherige physische Grundeinstellung ein. Neue Profile ohne Test starten physisch bei Stufe 0.
- Fitness steuert Ziel-RPE, bisher levelabhängige Rundenzahl in der Vorbereitung, Kraftumfang/-sätze,
  Konditionsintervalle, Haltezeiten und die körperliche Progressionssignatur. Technik steuert bekannte
  Inhalte/Kombinationskomplexität. Verbandsformate und Alters-/Grad-/Einschränkungsregeln bleiben bestehen.
- Gebaute Einheiten und ihre Blöcke speichern `fitnessLevel`, Einheiten zusätzlich `techniqueLevel`.
  Darauf beruhende Texte und Timer ändern sich nach einem neuen Test nicht mitten in der Einheit.
- Änderungen an Erfahrung oder körperlicher Dosierungsstufe verwerfen nur noch nicht begonnene
  zukünftige/heutige Einheiten; Verlauf, begonnene Einheiten, Gürtel und Turnierziele bleiben erhalten.
- Historische `levelFor`-Vergleiche bleiben im Kern als Referenz für alte Tests, werden von der App nicht verwendet.


## 5. Akzeptanzfälle für 3-U (prüfbar, mit festen Daten)

1. Hartes Vereins-Sparring (90 min, RPE 9) am Montag, Hauptsport Kickboxen; Dienstag ist eine Boxeinheit (E1) →
   Dienstag wird leichter gebaut (Bereich Beine/Arme) und die Erklärung nennt den Verein. Kein Erholungsreset.
2. Abgebrochene Einheit mit bestätigten 30 von 75 min, RPE 6 → Belastung 180; die geplanten 75 min zählen nicht.
3. Vorschau geöffnet, nicht begonnen; Tag vorbei → kein Eintrag, Wochenbelastung unverändert, nächste Woche = Vorlage.
4. Vereinseintrag ohne Anstrengung → Speichern nicht möglich (E5); nichts vorausgewählt.
5. Eintrag nachträglich von RPE 9 auf 5 korrigiert → offene Einheiten bis Sonntag neu, Entlastung entfällt ggf.;
   begonnene/abgeschlossene Einheiten unverändert.
6. Eintrag gelöscht → Wochenbelastung sinkt, Neuberechnung wie in 5.
7. Wochenprojektion > 1,3 × chronisch → nur unbegonnene Einheiten leichter, Tage/Art gleich.
8. Turnier im Boxen in 3 Wochen bei Hauptsport Kickboxen → Belastungsphase „peak“ für alle Einheiten (E3), Format/Inhalt
   der Boxvorbereitung erst mit Boxmodul; Kickbox-Gürtelprüfung bleibt ohne Wirkung auf Boxen.
9. Fitnesstest Kickboxen vor 20 Tagen; erste Boxeinheit → nur Technikteil Boxen nötig; Kickbox-Level überträgt sich nicht.
10. FC bei Level 0, 25 Jahre → wählbar; 14 Jahre → gesperrt (Altersgrenze).
11. Eigene Dev-Sicherung exportieren, Eintrag ändern, Sicherung zurückladen → genau der alte Stand, keine Duplikate.
12. Freier Lauf 40 min, 7,5 km, RPE 6 → Belastung 240, Tempo 5:20 /km angezeigt; Strecke ohne Belastungswirkung.
13. Vergleichsbasis Kickboxen: Profile ohne Verein/ohne Sportwechsel bleiben bis auf dokumentierte Änderungen gleich
    (E5 Vereins-Vorbelegung, E7 Level-/FC-Freigabe, Bereichsregel nach hartem Vortag).

## 6. Dosierungsvertrag (Umsetzung 3-D)

Eine Übung im Plan trägt eine strukturierte **prescription**; daraus werden **Text**, **Timerphasen** und
**Zeitschätzung** abgeleitet. Istwerte (`perf`) bleiben getrennt.

Felder wie in `architecture.md` 6.3, präzisiert:

```text
Prescription {
  sets?                                  // Sätze (aus Block oder Ziel); fehlt = Zeitblock
  reps?: n | [lo, hi] | "max"            // Wiederholungen → kein Timer, keine erfundene Ausführungszeit
  workSec?: n | [lo, hi]                 // Arbeits-/Haltezeit; Bereich = Auswahl im Timer (heute „choices“)
  restSec?                               // Satzpause (heute 60 s)
  intervals?: { n, on, off }             // z. B. 4 × 15 s / 15 s innerhalb eines Satzes
  sides: "none" | "side" | "leg" | "hand" | "direction", parts?: n   // Nacken: direction, parts 4
  changeoverSec?                         // Wechsel zwischen Seiten/Richtungen (heute 5 s)
  laps?                                  // Zirkeldurchgänge
  timeboxSec?                            // Aufwärm-/Mobility-Zeitfenster („ca. 3 Min.“)
  tempo?: "slow3", load?: "own", distanceM?, note?
}
doseText(p, lang) · timerPhases(p, choice) · estimateSec(p) = Summe der Phasen bzw. Zeitfenster; reine
Wiederholungen ohne Zeitschätzung (die Blockdauer bleibt maßgeblich).
```

Regeln: Anzeigename und Kennung sind unabhängig; Umbenennen ändert keine Dosierung. Text und Phasen stammen aus derselben
prescription, deshalb gibt es keine zweite Zahlenquelle. Vorhandene Scheduler/Audio/Wachhalten bleiben; Timerarten
(Runden, Übung, Satzkette) bekommen Adapter, keinen Neubau.

## 7. Heutige Abweichungen Text ↔ Timer und Entscheidungen (umsetzen in 3-D)

Ermittelt mit den echten Funktionen (`buildSession`, `doseTxt`/`targetText`/`hardTxt`, `exerciseTiming`) über
12 Vergleichsprofile × 14 Einheitsarten × 25 Seeds (511 verschiedene Kombinationen). Entscheidungen: Sichtung 03.11.2026.

| Nr. | Übung (Block) | Text sagt | Timer macht | Entscheidung für 3-D |
|---|---|---|---|---|
| A1 | Härtung Fauststütz, Full Contact (`fPlank`+h) | 3 × 30–45 s | 3 × 20 s (Wahl 20/30) | Timer folgt Text: Wahl 30/45 |
| A2 | Härtung Faustklopfen, Full Contact (`fTap`+h) | 3 × 45 s pro Hand | 3 × 30 s pro Hand | Timer folgt Text: 45 s |
| A3 | Härtung ohne Bandagen, Full Contact (`fBare`+h) | 3 × 20 s | 2 × 20 s | Timer folgt Text: 3 Durchgänge |
| A4 | Härtung mit Bandagen, Full Contact (`fWraps`+h) | 3 × 30 s | 2 × 30 s | Timer folgt Text: 3 Durchgänge |
| A5 | Einbeinstand mit Kick-Hold | „pro Bein 2 × 10 s“ / „Ziel: 3 × 30 s pro Bein“ | je Satz 2 × je Bein (4 Phasen) | **Ein Satz = erst links, dann rechts** (2 Phasen + Wechsel). „3 × 30 s pro Bein“ = 3 Sätze. Text nennt die Reihenfolge. |
| A6 | Isometrische Nackenkräftigung mit Ziel | „Ziel: 3 × 30 s“ / „4 × 45 s“ | je Satz 4 Richtungen × 30/45 s | **Progression bleibt.** Text ergänzt „je Richtung“ und nennt die vier Handpositionen; **Skizze** zeigt die vier Richtungen nacheinander (Stirn, Hinterkopf, links, rechts) statt nur einer Handposition. |
| A7 | Kick-Halten (Mobility) | „je Seite 5 × 3–5 s · insgesamt ca. 3–4 Min.“ | 10 × 3 s mit 3 s Pause (≈ 1 Min.) | **Timer auf ca. 4 Min.** (Durchgänge je Seite wiederholen, bis das Zeitfenster gefüllt ist); Text wird aus dem Timer abgeleitet. |
| A8 | Mobility-Block, Kopfzeile | „je 60–90 s, ruhig atmen“ | Übungen laufen 3–4 Min. (Zeitfenster), Halteübungen 60–90 s | Kopfzeile „je Übung ca. 3–4 Min., Halteübungen 60–90 s“ |
| A9 | Taube / Froschdehnung / Tiefe Hocke (Mobility) | „insgesamt ca. 3–4 Min.“ | 1 × 60 s bzw. 60 s je Seite | Gesamtzeit aus dem Timer anzeigen |
| A10 | Kraft „explosiv 3–5“ bzw. „4 × 5–8“ mit Körpergewichtsübungen | Kopfzeile 3–5 explosiv | Übung „3 × 12–15 Wdh., langsam (3 s ab)“ | **Wenn explosiv, dann explosiv; wenn langsam, dann langsam.** Ausführungsart kommt aus dem Block; ohne Gewichte werden in explosiven Blöcken explosive Varianten mit 3–5 Wdh. verwendet, „langsam (3 s ab)“ nur in langsamen Blöcken. |
| A11 | Seil-Intervalle | „2 Min. im Wechsel“ | eine durchgehende 2-Min.-Phase | Wechsel als Phasen im Timer |
| A12 | Bergsprints/Steigerungsläufe im 3×-Block | „4 Sprints“ / „2 × 80 m“ | kein Timer; Block sagt 3 × | **Satzzahl gilt:** 3 × 4 Sprints bzw. 3 × (2 × 80 m); Text nennt beides („3 Sätze à 4 Sprints“). |

Nicht als Abweichung gewertet: Wiederholungsübungen ohne Timer (gewollt), Aufwärmen als Zeitfenster mit
Wiederholungshinweis, Ziel-Texte aus der Kraftprogression mit passendem Timer, die Nackenübung ohne Ziel (4 × 10 s).
Hinweis zu A6: In 2-B wurden Name und Texte angepasst; in 3-D zeigt die Skizze alle vier Richtungen (Stirn, Hinterkopf, links, rechts).

## 8. Nicht Teil von 3-Q/3-U

- Boxregeln, Taekwondo-Grade/Farben/Prüfungsprogramme (4a-Q, 5): hier nur leere Felder.
- Neue Belastungsregeln über das Beschriebene hinaus; medizinische Erholungszeiten.
- Änderung der bestehenden Kickbox-Periodisierung, Kombinationsauswahl oder Abwehrregel (7A).

## 9. Umsetzung 3-U (03.11.2026) – Abweichungen vom Konzept

- **E5 geändert (Betreiber, 03.11.2026):** Vorauswahlen und die vorbelegte Dauer bleiben wie bisher (Vereinstraining „Gemischt“ und Anstrengung 7, eigene Einheit mit geplanter Dauer und Rückfrage beim frühen Beenden). Akzeptanzfall 4 entfällt. Neu eingetragene **Freie Läufe** haben keine Vorauswahl (Dauer und Anstrengung Pflicht).
- **Schwelle der Bereichsregel:** 0,35 statt 0,4. Mit 0,4 würde hartes Vereins-Sparring (Beine 0,35 / Arme 0,35) die Regel nie auslösen – das widersprach Akzeptanzfall 1. Gilt: RPE ≥ 7 gestern und Bereichsanteil ≥ 0,35 → Beine, Schultern/Arme, Rumpf oder Ausdauer. „Leichter“ = Zielanstrengung −1 und Übungen mit Anteil in dem Bereich werden hinten angestellt; Einzeiler in „Warum diese Einheit?“. Mobility bleibt unberührt.
- **Eigene Einheiten:** Bereichsanteile aus den Übungen (ohne Aufwärmen, Cool-down, Mobility, Abhärtung), mindestens 3 Übungen; sonst Tabelle nach Einheitsart. Nach 3-D direkt als Feld je Übung.
- **Sportwahl:** Zeile „Sportart“ unter „Einheit anpassen“, im Vereins-Sheet, beim Freien Lauf und beim Bearbeiten; Hauptsport im Profil (Training → Mehr). Sichtbar sind nur fertige Sportarten, zurzeit nur Kickboxen. Keine interne Testansicht (Betreiber: Dev-App, nicht nötig); die Akzeptanzfälle laufen als automatische Tests. Die Frage nach dem Hauptsport in der Inbetriebnahme kommt, sobald eine zweite Sportart sichtbar ist.
- **Level je Sport:** `levelFor` (Kern) ist fertig und getestet; neue Tests speichern `techBy` (Sport → Technikwert), alte Tests ohne `techBy` gelten als Kickboxen. Ein reiner Technik-Test für eine neue Sportart hat noch keine Oberfläche (erst mit der zweiten Sportart).
- **Turniere/Prüfungen:** neue Einträge speichern `sport`; Turniere jeder Sportart steuern die Phasen, Turnierformat nur, wenn die Sportart ein Modul hat; Gürtelprüfungen wirken nur auf ihre Sportart. Eine Auswahl der Sportart beim Eintragen gibt es (Zeile über der Art), ebenfalls nur mit fertigen Sportarten.
- **Vergleichsbasis:** Baseline unverändert bis auf die dokumentierten Felder `sport` und `id` je Einheit (zufällige ID wird beim Vergleich ausgeblendet; `sport` muss `kickboxing` sein).
- **Wochenprojektion:** erwartete Woche = Einträge bis heute + geplante Einheiten bis Sonntag (eigene: geplante Minuten × Basis-Anstrengung, Verein: Minuten × 6); über 1,3 × Mittel der drei Vorwochen und > 600 → Entlastungsstufe nur für noch nicht begonnene Einheiten (`why: "proj"`).

## 10. Umsetzung 3-D (03.11.2026)

**Stabile Übungs-IDs.** `catalog/ids.js` führt 88 Text-IDs der Form `<Kategorie>.<englischer Name>` (z. B. `str.plank`, `mob.kick_holds`); die Reihenfolge
der Liste ist die alte Zeilennummer (`legacyIndex`). `EX[id]` liefert die Übung, `EX[alteNummer]` bleibt lesbar. Alle namensbasierten Tabellen
(Dosierung, Skizzen, Tipps, Blocklisten, Kraft-Grundübungen, Aufwärm-/Mobility-Listen) sind auf IDs umgestellt – Umbenennen ändert keine Dosierung mehr.
`hydrate` schreibt alte Zahlen-IDs in gespeicherten Einheiten und im Verlauf (`perf[].id`) auf Text-IDs um (zweimaliges Laden ändert nichts);
Härtungs-IDs (`fPlank`, `neck` …) waren schon Text und bleiben.

**Dosierung.** `core/prescription.js` hält je zeitbehafteter Übung eine strukturierte Verordnung (`RX`): Halten (`hold`), Intervalle (`iv`),
Wechsel (`alt`), Halten je Seite mit Zeitfenster (`holds`), Sätze (`sets`, `sidedsets`), Richtungen (`dirs`), Griffkraft (`grip`). Daraus
entstehen `rxText` (Dosierungstext, de/en), `rxPlan` (Timerphasen mit Rolle und Zählern; die App macht daraus die Beschriftung) und
`rxSeconds`/`rxMinutes` (Zeitschätzung). `DOSE_FIX` wird für diese Übungen aus `RX` erzeugt; die Härtungstexte tragen Platzhalter
(`{rx}`, `{n}`, `{s}`, `{r}`), die `hardTxt` aus derselben Verordnung füllt. Die Full-Contact-Stufe steht als Unterschied in `RX_HARD`.
Wiederholungsübungen ohne Zeit behalten ihre Texttabelle (`DOSE_TXT`); die Blockdauer bleibt für sie maßgeblich.

**Entscheidungen A1–A12 – umgesetzt:** A1 Fauststütz+h Wahl 30/45 · A2 Faustklopfen+h 45 s pro Hand · A3/A4 Härtung ohne Bandagen/mit Bandagen+h 3 Durchgänge ·
A5 Einbeinstand: Kraftsatz = erst links, dann rechts (Text nennt die Reihenfolge; „3 × … pro Bein“ = 3 Sätze) · A6 Nackenübung: Text nennt „je Richtung“
und die vier Handpositionen, Timer-Beschriftung mit Richtung, Skizze mit vier Richtungen · A7 Kick-Halten: Durchgänge wiederholen sich, bis ca. 4–4½ Min.
gefüllt sind (je nach gewählten 3 oder 5 s: 275 bzw. 265 s); Text „ca. 4–5 Min.“ stammt aus dem Timer · A8 Kopfzeile Mobility „je Übung ca. 3–4 Min., Halteübungen 60–90 s“ ·
A9 Taube „insgesamt ca. 2–3 Min.“, Froschdehnung/Tiefe Hocke „ca. 1–2 Min.“ aus dem Timer · A10 s. u. · A11 Seil-/Rudergerät-/Laufband-Intervalle:
„2 Min. im Wechsel (30 s zügig / 30 s locker)“ = 4 Phasen · A12 „3 × 4 Läufe à 20 m“, „3 × 4 Sprints“, „3 × (2 × 80 m)“ im Satzblock (im Zirkel bleibt es bei einer Runde).

**A10 (Entscheidung „Vorschlag“).** Sätze mit „explosiv“ (Turnier-Vorbereitung ohne Block-Schwerpunkt Kraft, Taper) wählen ohne Gewichte (kein Hantel-/Kettlebell-/Langhantel-Zubehör, kein Studio)
nur Schnellkraftübungen (Kategorie `pow`; bei Knie-/Sprunggelenkbeschwerden greift die bisherige Kraft-Ersatzauswahl), mit „3–5 Wdh.“ aus der Kopfzeile statt der fest
eingebauten 5. „langsam (3 s ab)“ steht nur noch in Blöcken mit schweren Wiederholungszahlen (≤ 8), nie in explosiven. Mit Gewichten bleibt alles wie bisher.

**A13 (neu, beim Ableiten gefunden).** Schienbein-Checks (Full Contact): Text 3 × 30 s, Timer 2 × 30 s – Timer folgt dem Text (3 Durchgänge).

**Vergleichsbasis.** Neu aufgezeichnet (`node tests/baseline.mjs --write`); Abweichungen gegenüber dem Stand 3-U ausschließlich: A11 (Text und 4 Phasen Seil-Intervalle,
Dosistext Rudergerät/Laufband), A12 („3 × 4 Läufe à 20 m“), A7 (Kick-Halten Text und 87 statt 21 Phasen), A9 (Gesamtzeit), A6 (Nackentext). Die Einheiten selbst (Übungswahl, Blöcke) sind
unverändert; die Vergleichsdatei führt die Übungen weiter unter der alten Zeilennummer (`legacyIndex`), damit nur echte Änderungen auffallen.


## Nachtrag 09.11.2026 – Einmalige Abschlussbewertung

Ersetzt den früheren Zusatzreiz nach zwei leichten Einheiten; Verhalten siehe `trainingslogik.md`.
`session.effortDose` und der entsprechende Verlaufssnapshot speichern Version, Vergleichsbereich,
Faktor, Eignung, Ausgangsquelle und die angewandte Runden-/Satzpause. `log.effortControl` speichert
Version, Emoji-Klasse und `hold`/`change`. Die tatsächliche RPE bleibt die einzige Anstrengungsbewertung.
Der jüngste passende Snapshot begründet die nächste Anpassung, kein wiederholtes Aufsummieren beim
Neuladen. Alte Daten bleiben lesbar; `fast`, `difficulty` und frühere Übungsbewertungen werden nicht neu erzeugt.
Die Lastsignatur berücksichtigt die neuen Felder; unbegonnene Pläne werden nach Änderungen invalidiert.
Begonnene Pläne behalten ihren Snapshot, Timer verwenden dessen Satz-/Zirkelpause.
