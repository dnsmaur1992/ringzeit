# Ringzeit Dev – Trainingslogik (Stand 3-U, 03.11.2026)

Kurz und nur das, was die App heute tut. Die Herleitung steht in `data-load-concept.md`, Quellen in `rules-sources.md`.

## Belastung
- Belastung eines Eintrags = **Dauer in Minuten × Anstrengung (1–10)**. Eigenes Training, Vereinstraining und Freie Läufe zählen gleich, alle Sportarten gemeinsam. Eine abgebrochene Einheit zählt mit der angegebenen Dauer.
- Geplante, ausgelassene oder verfallene Einheiten sind keine Einträge und haben keine Belastung. Jede Woche beginnt mit derselben festen Vorlage (Tage und Art).
- Die Strecke eines Freien Laufs wird nur angezeigt (Tempo), sie ändert die Belastung nicht.

## Wann die App „etwas leichter“ plant
1. Geplante Entlastungswoche (jede 5. Planwoche).
2. Die Woche davor war deutlich zu hart (mindestens zwei Einheiten klar über dem Ziel).
3. Die Vorwoche lag mehr als 30 % über dem Mittel der drei Wochen davor (und über 600).
4. Die laufende Woche wird mit dem, was schon war und noch geplant ist, mehr als 30 % über das Mittel der drei Vorwochen steigen (und über 600). Dann werden nur die noch nicht begonnenen Einheiten leichter; Trainingstage und Art bleiben.
- Nicht in Tapering, Erholungswoche und beim Wiedereinstieg nach einer Pause.
- Das Verhältnis akut/chronisch ist **keine Verletzungsprognose**, sondern nur ein einfacher Auslöser (Quelle T2).

## Der Tag danach
- Jeder Eintrag verteilt seine Belastung auf fünf Bereiche: Beine/Tritte, Schultern/Arme/Schläge, Rumpf, Ausdauer, Beweglichkeit.
- War gestern ein Eintrag mit Anstrengung ≥ 7 und mindestens 0,35 Anteil in einem Bereich, wird die Einheit heute etwas leichter (Zielanstrengung −1, Übungen für diesen Bereich später gewählt). Die App nennt den Grund in „Warum diese Einheit?“.
- Bestehende Schutzregeln (Sparring → Technik nach KO-Sperre, nach Vereins-Sparring, in stressiger Woche, im Ramadan) bleiben.

## Bearbeiten und Löschen
- Einträge lassen sich ändern (Sportart, Art, Dauer, Anstrengung, Strecke, Notiz) und löschen.
- Ändert sich dadurch der Zustand der Woche, werden die noch nicht begonnenen Einheiten bis Sonntag neu erstellt. Begonnene und abgeschlossene Einheiten bleiben unverändert.

## Level
- Technikniveau (Grundlagen/Geübt/Erfahren) wird je Sportart bzw. WT/ITF nach bereits im Verein erlernten Techniken gewählt. Es wird durch keinen Fitnesswert gesperrt. Die vier körperlichen Testbereiche steuern getrennt die Dosierung; die Technikbewertung im Test bleibt eine Verlaufsinformation. Full Contact und K1 sind nicht mehr an das Level gebunden, nur an das Mindestalter (15 Jahre).

## Dosierung und Timer
- Jede zeitbehaftete Übung hat eine strukturierte Verordnung (`core/prescription.js`). Dosierungstext, Timerphasen und Zeitangaben werden daraus abgeleitet – es gibt keine zweite Zahlenquelle.
- Halten je Seite: erst Seite 1, 5 s Wechsel, dann Seite 2. Einbeinstand mit Kick-Hold im Kraftblock: ein Satz = erst links, dann rechts („3 × 30 s pro Bein“ = 3 Sätze).
- Intervalle („3 × (20 s / 10 s)“), Wechsel (Seil, Rudergerät, Laufband: „2 Min. im Wechsel“ = 30 s zügig / 30 s locker) und Kick-Halten (Durchgänge je Seite, bis ca. 4–5 Min. gefüllt sind) laufen genau so im Timer.
- Mobility: „je Übung ca. 3–4 Min., Halteübungen 60–90 s“; Halteübungen nennen ihre Gesamtzeit aus dem Timer.
- Full-Contact-Abhärtung: harte Stufe mit eigener Zahl (z. B. Faust-Stütz 3 × 30–45 s, Knöchel-Klopfen 45 s pro Hand, Schienbein-Checks 3 Durchgänge); der Timer folgt dem Text.
- Explosive Sätze ohne Gewichte nehmen Schnellkraftübungen (3–5 Wdh.); „langsam (3 s ab)“ gibt es nur in langsamen Kraftblöcken mit schweren Wiederholungszahlen.
- Übungen haben stabile Text-IDs (`str.plank` …); gespeicherte Einheiten und der Verlauf mit alten Zahlen-IDs werden beim Laden umgeschrieben.

## Boxen

Seit 4b regulär wählbar (Hauptsport im Profil/Onboarding, Sportwahl je Einheit). Maßgeblich ist das Alter nach Kalenderjahr: DBV-Klassen U13 (10–12), U15 (13–14), U17 (15–16), U19 (17–18), Erwachsene (19 bis zum Jahr des 40. Geburtstags); ohne Geburtsjahr gelten Erwachsene. Ohne Turnier trainiert die App Runden von 3 min (Erwachsene, U19), sonst in der Rundenlänge der Klasse (U13 1 min, U15 1,5, U17 2); über 40 gilt 3 × 2 min als Trainingsstandard („kein offizielles DBV-Format“). Vor einem Turnier gilt das Format der Altersklasse (3 Runden, 1 min Pause). Regeln werden nur verlinkt (WKB-PDF).

- **Techniken:** nur Schläge, Meiden, Parieren, Seitschritt. Mehr Beinarbeit und Meiden: eigene Runden „Beinarbeit“ und „Meiden & Kontern“; Meiden hat immer eine Gegneraktion (vorgestellt oder vom Partner), keine zufälligen Blocks.
- **Partnertage:** Aufgabensparring. „Freies Touch-Sparring“ (30–40 % Schlaghärte, Partner und volle Schutzausrüstung) höchstens einmal je Einheit, ab Fortgeschritten, nie für Kinder, nie in Tapering-/Erholungswochen oder bei K.o.-Sperre; Hinweis „nur nach Absprache mit deinem Trainer und unter Aufsicht“. Kinder trainieren ohne Partnersparring.
- **Statt Abhärtung:** Block „Handgelenk & Griff“ (6 min): Handtuch auswringen und Faustschluss immer; dazu je nach Alter, Level, Einschränkung und Ausrüstung eine weitere Übung. Kinder nur Handtuch und Griff.
- **K.o.:** Sperre 30 Tage (nur Solo ohne Treffer), Hinweis auf Steigerung bei Wiederholung (§89) und Stufenplan (Anhang 5); keine automatische Stufensteuerung, keine medizinische Bewertung.


## Abschlussbewertung und nächste Einheit (09.11.2026, ersetzt die frühere Zweimal-„Zu leicht“-Schleife)

Die fünf Emojis am Abschluss sind verpflichtend. Zusätzliche Fragen pro Übung und die separate
Dreierauswahl entfallen. Die genaue RPE-Skala bleibt alternativ nutzbar (1–2, 3–4, 5–6, 7–8, 9–10).

| Bewertung | Planungsimpuls |
|---|---|
| Sehr locker | automatisch +10 % |
| Locker | automatisch +5 % |
| Fordernd | Beibehalten (Vorauswahl) oder +5 % |
| Hart | Beibehalten (Vorauswahl) oder −5 % |
| Am Limit | Beibehalten (Vorauswahl) oder −10 % |

- Ein Wechsel des Emojis setzt die Zusatzentscheidung auf Beibehalten zurück.
- Gilt getrennt nach Sport/Stil/Disziplin, Einheitstyp und körperlicher Ausgangsstufe; Ort und
  Ausrüstung müssen nicht identisch sein. T/C/K/S sind unterstützt, nicht Lauf, Mobility oder Sparring.
- Der Faktor wird aus der tatsächlich erlebten letzten Einheit fortgeschrieben, auf 0,8–1,2 begrenzt.
  Prozentwerte sind Planungsimpulse für die Dichte, keine gemessenen physiologischen Belastungsprozente.
  Rundenpause = Grundpause / Faktor / Periodisierungswelle, mindestens 30 Sekunden.
  Kraft: Satzpause = 60 / Faktor (45–90 s), Zirkelpause = 90 / Faktor (60–135 s), gerundet.
- Sobald die neue Steuerung aktiv ist, ersetzt sie die unabhängige bisherige Aufwärtskorrektur der
  Pausendichte. Gewichte und Wiederholungen werden nie um Emoji-Prozente erhöht – sie folgen seit
  15.11.2026 den eingetragenen Sätzen (siehe „Kraftziele aus eingetragenen Sätzen“). Bestehende
  Reduktionsregeln bleiben wirksam.
- Automatische Erhöhung nur nach vollständiger, bestätigter Einheit mit positiver Dauer und RPE nicht
  über deren Ziel, außerhalb der Schutzphasen. Abbrüche erlauben ausdrücklich gewünschte Reduktionen.
- Tagesform, Vorbelastung, Entlastung, Wiedereinstieg, Kinder/Jugend, Wettkampfvorbereitung und andere
  bestehende Schutzregeln haben Vorrang. Bei gesperrter Erhöhung wird kein zusätzlicher Druck erzeugt.
- Nach mehr als 42 Tagen ohne passenden Eintrag greift wieder die normale Planung. Alte RPE-Einträge
  und frühere `difficulty`-/`fast`-Daten werden nicht nachträglich als Einverständnis umgedeutet.
- Neuaufbau wendet dieselbe Antwort nicht mehrfach an. Begonnene Einheiten bleiben unverändert;
  unbegonnene werden nach relevanten Verlaufskorrekturen neu erzeugt. Zukünftige Einträge zählen nicht.
- Kern: `src/core/session-progression.js`; Adapter: `effortDoseState` und `applyStrengthRestDose`.

## Technik-Einheiten mit Schwerpunkt (14.11.2026)

Bei Technik geht es um Technik. Jede Technik-Einheit (T) hat deshalb einen **Schwerpunkt**, den die App beim Erstellen
automatisch wählt. Er gibt der Einheit ihren Sinn – Ergebnis ist, dass man diese Technik geübt hat. Er steht nicht als
eigener Text in der Einheit; man erkennt ihn an den Runden und am Kraftblock (Betreiber 14.11.2026).

- **Auswahl:** über die letzten 12 Einheiten ausgeglichen, mit etwas Zufall. Das Profil „Mehr Boxen / Mehr Kicks“ zieht
  Hand- bzw. Kick-Schwerpunkte vor. Knie-/Sprunggelenk-Einschränkung, Disziplin und Level sperren wie bisher
  (z. B. kein Feger mit Sprunggelenk, Knie nur K1).
- **Kickboxen:** Jab als Eröffnung, Doppel-Jab, Erst Körper dann Kopf, Frontkick oder Sidekick als Eröffnung, Kopfkick,
  Feger, Lowkick (KL/K1) oder Knie (K1) zum Abschluss.
- **Boxen:** Jab als Eröffnung, Doppel-Jab, Erst Körper dann Kopf, Haken oder Aufwärtshaken (ab Level 1) zum Abschluss.
- **Taekwondo (WT und ITF):** ein Tritt – Halbkreistritt, Frontkick, Seitwärtstritt, Axttritt, Rückwärtstritt,
  Schiebetritt oder Sicheltritt –, soweit Level, Grad und Einschränkungen ihn freigeben. Etwa drei von vier
  Kombinationen enthalten ihn.
- **Taktische Schwerpunkte (16.11.2026):** *Gegen größere Gegner* (Körpertreffer und Nahdistanz, raus mit
  Seitschritt) und *Gegen kleinere Gegner* (lange Techniken als Eröffnung, nichts aus der Nahdistanz, raus) ab
  Einsteiger; ab Technikniveau 1 *Kick mit Schlag kontern* und *Schlag mit Kick kontern* (Konterrunden mit passenden
  Abwehr-Konter-Paaren, nur Kickboxen; Lowkick-Konter nur KL/K1, nicht bei Knie/Sprunggelenk) sowie *Gegen gleiche
  Auslage* (Führhand führt, Haken außen) und *Gegen versetzte Auslage* (Schlaghand durch die Mitte, Abschluss mit
  Schlaghand bzw. Kick). Boxen ohne Kick-Konter, Taekwondo über bevorzugte Techniken (groß: Vorwärtsschritt, Halbkreis,
  Faust; klein: Front-, Seitwärts-, Schiebetritt, Rückwärtsschritt; gleiche Auslage: Schiebetritt, Wechsel, Sichel;
  versetzte Auslage: Halbkreistritt). Bei vielen Schwerpunkten wächst das Ausgleichsfenster mit, damit jeder dran kommt.
- **Breite Schwerpunkte in allen Sportarten:** *Beinarbeit* (etwa die Hälfte der Runden nach dem Einstieg sind
  Beinarbeit-Runden) und *Verteidigung & Konter* (Ausweich- und Konterrunden; im Kickboxen mit Partner bekommt jede
  Partnerrunde nach der ersten eine Gegenaktion). Kinder bekommen nur Doppeldeckung, Rausgehen und Block.
- **Am Ende nur Kraft für die Technik:** statt Kondition plus Kraft (bisher ≈ 14–17 Min.) höchstens etwa 10 Min. mit bis
  zu drei Übungen, die genau die Technik des Schwerpunkts stützen (z. B. Lowkick: einbeiniges Wadenheben, Bulgarian
  Split Squats; Sidekick: Einbeinstand mit Kick-Hold, Kick-Halten; Beinarbeit: Wadenheben, seitliche Sprünge;
  Verteidigung: Nackenkräftigung, Dead Bugs). Es gelten Ort, Ausrüstung, Level und Einschränkungen. Drei passende
  Übungen = 10 Min., zwei = 7, eine = 4, keine = kein Block: **die Minuten gehen dann in zusätzliche Technikrunden.**
- Abhärtung bzw. Handgelenk & Griff bleiben, Kondition (C), Sparring (P), Kraft (S) und Mobility (M) sind unverändert.

## Kraftziele aus eingetragenen Sätzen (15.11.2026)

Drei Quellen, drei Aufgaben: **eingetragene Sätze** ergeben den Leistungsstand je Übung, die
**Abschlussbewertung** steuert die Pausendichte und sperrt Steigerungen, wenn es zu hart war, der **Fitnesstest**
legt die Wiederholungsbereiche fest. Das Technikniveau bleibt davon getrennt.

- **Vergleichbar:** gleiche Übung, gleiche relevante Ausrüstung, gleicher Wiederholungsbereich – Ort, Einheitstyp und
  Disziplin egal. Gilt auch, wenn die Emoji-Steuerung aktiv ist (bisher fror sie die Ziele ein).
- **Nachweis:** Einheit abgeschlossen, Anstrengung eingetragen, alle Zielsätze mit Wiederholungen (und Gewicht bei
  Gewichtsübungen). Pro Einheit zählt der schwächste Satz – ein einzelner starker Satz löst nichts aus. Eine Steigerung
  braucht 2 der letzten 3 vergleichbaren Einheiten (höchstens 6 Wochen alt), keine davon über dem Anstrengungsziel.
- **Schritte, immer nur einer:** mehr Wiederholungen bis zur Obergrenze (auf das in beiden Einheiten erreichte Niveau);
  an der Obergrenze +2,5 % Gewicht und zurück an die Untergrenze; ein in allen Sätzen nachgewiesenes höheres Gewicht
  wird übernommen (höchstens +10 % pro Schritt), ebenfalls zurück an die Untergrenze. Höchstens eine Änderung je Übung
  in 14 Tagen. Der bisherige stetige Weg (Ziel im abgeschlossenen Zyklus erreicht → ein Schritt) bleibt bestehen.
- **Ein Hebel:** In einer Krafteinheit mit Steigerung bleibt die Satzpause bei 60 s, der Emoji-Faktor startet wieder
  bei 1; danach darf die Bewertung die Pausen wieder anpassen.
- **Mehrleistung, aber zu hart:** Ziel bleibt, mit Hinweis „Mehr geschafft, aber die Anstrengung war hoch: Ziel bleibt.“
  Zweimal deutlich zu hart (RPE ≥ Ziel + 2) senkt das Ziel (−5 % Gewicht bzw. −1 Wiederholung) – auch in Schutzphasen.
- **Keine Steigerung an geschützten Tagen:** Entlastungswoche, Wiedereinstieg, K.-o.-Sperre, schlechte Tagesform,
  Fastenzeit, harte Woche, Tapering und Erholung, unter 15, Leistungsabfall im Trend, schwere Vorbelastung am Vortag.
  Aufbauphasen dürfen Kraft weiter steigern (wie bisher).
- **Nachvollziehbar und ohne Doppelzählung:** Alles wird bei jedem Planen neu aus dem Protokoll berechnet, nichts
  wird aufaddiert. Begonnene Einheiten behalten ihre Ziele. Code: `strengthTarget`, `applyStrengthRestDose`.
- **Fitnesstest ändert den Wiederholungsbereich (Schritt 2):** Die letzte vollständige Leistung derselben Übung mit
  derselben Ausrüstung (höchstens 12 Wochen alt) wird übertragen statt neu zu beginnen. Mit Gewicht: geschätztes
  Maximum nach Epley aus dem schwächsten Satz, auf den neuen Bereich umgerechnet und auf 0,1 kg abgerundet,
  Wiederholungen an der Untergrenze; höchstens +10 % gegenüber dem bisherigen Gewicht, an Schutztagen oder nach einer
  Einheit über dem Anstrengungsziel gar keine Erhöhung. Ohne Gewicht: die erreichten Wiederholungen, in den neuen
  Bereich eingepasst. Hinweis: „Neuer Wiederholungsbereich: aus deiner letzten Leistung umgerechnet.“ Ohne vollständige
  Leistung beginnt die Übung wie bisher beim Ausgangsziel, ein Gewicht wird nie erfunden.
  Nachgeschärft nach Prüfung (15.11.2026): Die Übertragung erhöht nur, wenn auch eine normale Steigerung erlaubt wäre
  (Schutztage, Leistungsabfall, Reduktionssignal, schwere Vorbelastung, Änderung in den letzten 14 Tagen sperren);
  erhöht sie das Gewicht (bzw. ohne Gewicht die Wiederholungen), gilt sie als der eine Hebel des Tages – Satzpause
  60 s. Liegt im neuen Bereich nur ein älteres Ziel vor, entscheidet die Zeit: die neuere vollständige Leistung im
  anderen Bereich wird übertragen.

## Federn & Antritt (17.11.2026)

Stellung, Beinarbeit, Bewegungsmuster und die Kraft aus Füßen und Sprunggelenken. Chamber, Check, Slippen und Abrollen
sind Bausteine darin.

- **Katalog:** 19 Drills der Kategorie `plyo` (ids.js 88–106, exercises.js), jede mit Skizze (19-sketches.js),
  Formtipps (EXTIPS) und Dosis: Zeit-Drills über die Verschreibung (`core/prescription.js`, Text = Timer),
  gezählte Landungen über `DOSE_TXT` (ohne Timer).
- **Wo ein Drill hingehört:** `PLYO` in `08b-plyo.js` – Sportart/Disziplin (`box`, `lc kl fc k1`, `wt itf`),
  Verwendung (`pow` = Sprünge/Landungen, `cmd` = Beinarbeit mit Kommandos), Belastung (gewichtete Bodenkontakte)
  und Kommandoliste. Niveau über `lvl` des Katalogs (0: beidbeinig auf der Stelle, 1: Richtung/wechselbeinig/
  Landungen, 2: einbeinig und reaktiv). Check nur in Kick Light und K1, Absprünge für Sprungtritte nur Taekwondo,
  Slippen/Abrollen nur Boxen und Kickboxen. Knie- oder Sprunggelenkbeschwerden: kein Drill, kein Schwerpunkt.
- **Obergrenze je Einheit:** 60 / 100 / 140 gewichtete Kontakte nach Technikniveau (`plyoPick`, `plyoLoad`).
- **Einplanung:**
  - Kraft: in etwa jeder zweiten Einheit (nicht in Entlastungswochen, nicht bei Kindern) ein Block „Federn & Antritt“
    direkt nach dem Aufwärmen, 1–2 Drills (`pow`).
  - Kondition: in etwa 60 % der Einheiten wird die zweite Runde ein Beinarbeits-Drill mit Kommandos (`cmd`), nicht in
    den festen Runden eines Schwerpunktblocks.
  - Technik & Kondition: in etwa 60 % ein Drill vor dem Konditionszirkel (eigener Block, 4 Min.).
  - Schwerpunkt „Federn & Antritt“ (`BROAD`, Ausgleich wie die anderen): etwa die Hälfte der Runden nach dem
    Einstieg werden Federn-&-Antritt-Runden mit Kommandos, der Abschlussblock nimmt Sprung-Drills statt Kraft.
- **Kommandos:** `cmdTickExercise` (Übungstimer) und `cmdTickRound` (Rundentimer) rufen nur in Arbeitsphasen, frühestens
  nach 3–4 s, nicht in den letzten 2 s und nicht zur 10-Sekunden-Ansage; Abstand nach Niveau 4–6 / 3–5 / 2–4 s, nie
  zweimal dasselbe hintereinander. Angezeigt und gesagt kommt aus demselben Eintrag (Anzeige trennt mit „·“).
  Gesprochen über `say` (ausgeschrieben, Stimme, Schalter); Ansagen aus: nur Anzeige und kurzer Signalton. Pause =
  kein Tick = kein Kommando. Wörter je Sportart: Boxen ohne Auslagenwechsel und Kicks, Taekwondo mit seinen Kicks.
- **Prüfungen:** Die Sportfremd-Prüfung (H9) und der Katalogtest lassen „Antritt“ zu („Tritt“ bleibt im Boxen
  verboten). H8 vergleicht Sätze je Seite/Bein/Hand jetzt mit beiden Seiten des Timers. Kickbox-Vergleich neu
  aufgezeichnet; mit abgeschalteter Neuerung ist er identisch zum vorherigen (geprüft).

## Schritt 1 der Trainingsmatrix (17.11.2026)

Entscheidungen und Matrix: Dokument „Ringzeit – Trainingsmatrix und offene Entscheidungen“ (alle Empfehlungen angenommen).

- **Bilanz:** `plyoLoad` zählt jetzt alle Blöcke und Runden. Eine Federn-&-Antritt-Runde und ein Beinarbeits-Drill in
  einer Konditionsrunde zählen nach Länge (`bounceRoundPts`: 90 s Federn = 20 Punkte, 3 Min. = 40). Im Schwerpunkt
  „Federn & Antritt“ bleiben nur so viele Federn-Runden, wie die Grenze erlaubt (`plyoLimitRounds`), die übrigen
  bleiben Beinarbeit-Runden ohne Federn; der Abschlussblock bekommt den Rest der Grenze, und wenn nichts übrig ist,
  Unterschenkelkraft ohne weitere Sprünge (`FOCUS_STR.bounceStr`).
- **Partnerangriffe:** Die zweite Gegenaktion auf Wettkampfniveau kommt nur noch, wenn in der Einheit noch ein
  unbenutzter Angriff übrig ist (vorher: bis zu 12 Gegenaktionen bei 11 Angriffen in LC Niveau 2 → gelegentlich
  dieselbe; Ursache des schwankenden Tests). In KL/K1 kann der Lowkick bewusst mehrfach kommen.
- **Rollen** („Federn und Abrollen“) nur noch im Boxen (E6).
- **Tests mit festen Seeds** (`seedRandom`, wie `baseline.mjs`). Der K1-Test der Gegenaktionen startet jede Probe als
  eigene Einheit.
- **Kickbox-Vergleich:** 7 Einheiten (KL/FC Niveau 2, Kondition sowie Technik & Kondition) neu aufgezeichnet. Einzige
  Ursache ist die engere Rollen-Freigabe: Der kleinere Drill-Vorrat ändert die gezogene Übung (geprüft: jede der drei
  Änderungen einzeln zurückgenommen; nur das Zurücknehmen der Rollen-Freigabe stellt diese 7 wieder her, alle drei
  zusammen ergeben den alten Vergleich).

## Schritt 2: Schwerpunkt-Reihenfolge und Körpergröße (17.11.2026)

- **Reihenfolge** (`rotatePick`, 08b-plyo.js; E3/E9): Der Schwerpunkt, der am längsten nicht gewählt wurde, kommt als
  Nächstes; gezählt werden alle Einheiten mit Technikrunden (Technik, Technik & Kondition, Sparring) derselben
  Sportart, im Taekwondo desselben Stils. Nie gewählt = zuerst; Gleichstand entscheidet der Zufall. Der Aufschlag +0,6
  für allgemeine Schwerpunkte und das Fenster über alle Einheitenarten sind entfernt. Gilt für Technik-Schwerpunkte
  und die versteckten Themen von Technik & Kondition und Sparring.
- **Gewichte** (`focusWeight`) strecken nur die Wartezeit: „Mehr Boxen/Kicks“ ×1,5 für die eigene Seite (÷1,5 für die
  andere), der zum Körperbau passende Gegner-Schwerpunkt ×2.
- **Körpergröße** (E8/E15/E16): freiwilliges Feld im Profil (120–230 cm, leer = keine). `buildOf`: Ponderal-Index
  cm ÷ ∛kg mit dem Limit der Gewichtsklasse des nächsten Turniers, sonst dem letzten Gewicht; über 44,5 eher groß
  (→ „gegen kleineren Gegner“ öfter), unter 41,5 eher klein (→ „gegen größeren Gegner“ öfter). Eigene Faustregel,
  im Profil als Schätzung angezeigt. Hilfe-Frage „Wie wird der Schwerpunkt einer Einheit gewählt?“.
- **Bestand** (E14): `PLAN_LOGIC` (39-boot.js). Beim ersten Start mit neuer Logik werden geplante, nicht begonnene
  Einheiten einmal mit denselben Einstellungen neu erstellt (in Datumsreihenfolge); begonnene/erledigte bleiben.
- **Wirkung** (nachgestellt, 30 Wochen T/S/K): Kickboxen bekommt Beinarbeit, Verteidigung und Federn als Schwerpunkt
  jetzt der Reihe nach (vorher nie); die feste Grundabdeckung je Einheit folgt in Schritt 3.
- **Tests:** Reihenfolge mit festen Seeds (jede Sportart: alle Schwerpunkte einmal, bevor einer wiederkommt; im
  Wochenmix Lücke ≤ 25 Technikeinheiten), Vorliebe und Körperbau, Profilfeld, einmaliges Neuerstellen. Angepasst:
  zwei Partner-Tests (Verteidigungs-/Konter-Schwerpunkte geben jeder Partnerrunde nach der ersten eine Gegenaktion,
  Teil 25; eine einzelne Partnerrunde darf eine tragen), der Schwerpunkt-Einheiten-Test (Federn & Antritt) und der
  Release-4-Test (Logikversion wird einmal vermerkt, begonnene Einheit bleibt gleich).
- **Kickbox-Vergleich:** 96 Einheiten neu aufgezeichnet, alle Technik, Technik & Kondition und Sparring; in jeder hat
  sich der Schwerpunkt bzw. das Thema geändert, Kraft, Kondition und die Abläufe sind unverändert.

## Schritt 3: Grundabdeckung Kickboxen (17.11.2026)

Entscheidungen E10, E11, E17–E20 (Dokument „Ringzeit – Trainingsmatrix und offene Entscheidungen“). Code: `08c-cover.js`.

- **Feste Runden:** Jede Kickbox-Technikeinheit ab 4 Runden bekommt eine Runde „Distanz & Ausgang“ (früh, nach dem
  Einstieg) und eine Verteidigungsrunde (zweite Hälfte). Unter 4 Runden und in Technik & Kondition eine der beiden im
  Wechsel; maßgeblich ist die letzte Kickbox-Einheit mit Technikrunden. Deckt der Schwerpunkt eine Art ab
  (Beinarbeit/Federn → Distanz, Verteidigung & Konter/Konter-Schwerpunkte → Verteidigung), entfällt nur diese Runde.
  Nie auf der 6-Kick-, Seil- oder Schwerpunkt-Runde; reicht der Platz nach dem Einstieg nicht, nimmt sie eine
  Einstiegsrunde (nie die erste). Boxen und Taekwondo bleiben unverändert (dort feste Beinarbeits- und Meiden-Runden).
- **Distanz & Ausgang** (`distRound`): kurze Kombination (2–3 Techniken) mit Eingang und Ausgang, oder ab Niveau 1
  „Ausgang zuerst“ (E20: erst raus/Pivot, dann aus der neuen Position angreifen). Eingänge: Schritt mit Jab;
  ab Niveau 1 Nachstellschritt, schräg hinein; KL/K1 seitlich in Lowkick-Distanz (Kombination mit Lowkick); K1 in die
  Nahdistanz mit Knie, kein Clinch (WAKO K1 ab 2027). Ausgänge: zurück, seitlich in den Winkel, ab Niveau 1 Pivot.
  Knie-/Sprunggelenkbeschwerden: kein Lowkick- und Knie-Eingang; Kinder: nur der einfache Eingang, keine
  Ausgang-zuerst-Variante; „gegen kleineren Gegner“: kein Eingang in die Nahdistanz.
- **Mit Partner:** Die Distanzrunde bleibt ein Partnerdrill (Eingang und Ausgang stehen auf der Karte), die
  Verteidigungsrunde ist eine Partnerrunde mit echtem Angriff → Abwehr → Konter, zusätzlich zu den bisherigen
  Gegenaktionen. Die erste Partnerrunde bekommt weiter keine Gegenaktion, die Distanzrunde auch nicht.
- **Anzeige und Ansage:** Karte „Eingang: … · Kombination · Ausgang: …“ bzw. „Ausgang zuerst: …“; die Rundenansage
  sagt Eingang, Kombination, Ausgang in dieser Reihenfolge (über die gemeinsame Textaufbereitung).
- **Disziplin-Techniken pro Einheit** (Hochkick, KL/K1 Lowkick, K1 Knie): kommen zuerst in die Distanzrunde, damit die
  Schwerpunkt-Runden ihre Form behalten; K1-Knie entfällt bei „gegen kleineren Gegner“.
- **Tests:** Abdeckung mit festen Seeds (4 Disziplinen × 3 Niveaus × solo/Partner, 10 Einheiten im Wechsel),
  Inhalte je Disziplin/Niveau/Einschränkung/Kinder, Karte und Ansage. Angepasst: Partner-Tests (Distanzrunde ohne
  Gegenaktion, Verteidigungsrunde darf eine dazugeben), Taktik-Test mit festem Seed und 24 Einheiten.
- **Kickbox-Vergleich:** 70 Einheiten (Technik, Technik & Kondition) neu aufgezeichnet – jede enthält jetzt die
  Distanz- oder Verteidigungsrunde; mit abgeschalteter Grundabdeckung ist der Vergleich identisch zu Schritt 2.

## Schritt 4: Vorbereitung auf den Schwerpunkt (17.11.2026)

Entscheidungen E1, E12, E21–E27 (Dokument „Ringzeit – Trainingsmatrix und offene Entscheidungen“). Code: `08d-prep.js`.

- **Wo:** jede Einheit mit Technikrunden (Technik, Technik & Kondition, Sparring), alle Sportarten. Neuer Block
  „Vorbereitung auf den Schwerpunkt“ direkt nach dem Aufwärmen; die 2 Minuten kommen aus dem allgemeinen Aufwärmen
  (es behält mindestens 6). Die gewählte Dauer bleibt.
- **Inhalt:** bis 45 Min. 2 Teile × 45 s, länger 3 × 40 s, 5 s Wechsel; langsam und einzeln → verbunden →
  Arbeitstempo; abgeleitet aus demselben Schwerpunkt wie der Hauptteil (Beinarbeit/Federn, Verteidigung/Konter,
  Taekwondo-Kick mit Ausholstellung, Kombination, Sparring-Rhythmus). Allein, auch mit Partner.
- **Seite:** Leitsatz des Schwerpunkts (ersetzt die eigene Leitsatz-Seite), Teile, Timer mit Ansage über den
  gemeinsamen Sprachweg; Knopf „Direkt los“ startet den Hauptteil. Zählt nicht für die Grundabdeckung, keine
  Gewöhnungsphase.
- **Bestehende Pläne:** Logikversion 3; nicht begonnene Einheiten werden einmal neu erstellt, begonnene bleiben.
- **Kickbox-Vergleich:** alle Technik-, Technik-&-Kondition- und Sparringseinheiten mit dem neuen Block; ohne
  Vorbereitung identisch zu Schritt 3.

## Schritt 5: Zähler und Grenzen für Federn & Antritt (17.11.2026)

Entscheidungen E4, E13, E27–E29. Code: `08b-plyo.js`.

- **Drei Zähler statt Punkte:** Federzeit (Sekunden; Federrunden mit ihrer Rundenzeit), gezählte Landungen
  (Wiederholungsdrills, alle einbeinig) und davon intensive; geschätzte Bodenkontakte nur zur Anzeige
  (beidbeinig 2/s, einbeinig 1,5/s).
- **Grenzen je Fitnessstufe** (eigene Werte, keine gemessenen Sicherheitsgrenzen): Federzeit 600/900/1200 s,
  Landungen 40/80/120, intensiv 0/20/40; Entlastungswoche −30 %. Seilspringen zählt nicht. Folge: einbeinige
  Wiederholungsdrills (24–36 Landungen) kommen erst ab Fitnessstufe 2 vor.
- **Zeile in der Einheit:** „Federn & Antritt heute: Federzeit m:ss Min. · N Landungen (davon M einbeinig) · ca. X
  Bodenkontakte geschätzt“ – nur wenn die Einheit Sprünge oder Federn enthält.
- **Kickbox-Vergleich:** 13 Kraft-/Konditionseinheiten mit anderem Drill im Abschlussblock (Stufe 1: einbeinige
  Wiederholungsdrills → beidbeinige; Stufe 0: zweiter Drill, Block 3 → 6 Min., Kraft −2, Kondition −1 Min.).

## E35: Partnerangriffe passend zum Konter-Schwerpunkt (17.11.2026)

- Bei „Kick mit Schlag kontern“ bzw. „Schlag mit Kick kontern“ greift der Partner genau mit den Angriffen des
  Schwerpunkts an, die Abwehr folgt dem Schwerpunkt – in allen Gegenaktionen und in der Verteidigungsrunde der
  Grundabdeckung; die schnelle Antwort bleibt im Schwerpunkt (Schläge gegen Kicks, Kicks gegen Schläge).
  Knie-/Sprunggelenkgrenzen nehmen Check und Lowkick weiter heraus. Kickbox-Vergleich unverändert.

## Schritt 6: WAKO-Regelfassung geprüft (17.11.2026, E7)

- `docs/rules-sources.md` R1: WAKO Rules Kapitel 2 (Tatami) und 7 (Ring), Beschlüsse des Board vom 20.03.2026
  (K1 ohne Clinch ab 01.01.2027). Die Kampfzeiten in `waFormat` stimmen; jüngere Kadetten 10–12 sind für LC/KL im
  Kapitel nicht ausgewiesen (bleibt Trainingsformat). Keine Codeänderung außer `RULE_PROFILE.version`.

## Schritt 7: Steigerung bei Federn & Antritt (17.11.2026)

Entscheidungen E5, E30–E34. Code: `08b-plyo.js` (`plyoStep`, `plyoProg`, `plyoDose`, `plyoLog`).

- **Automatisch und vorsichtig**, je Drill im Abschlussblock (nicht in Runden). Nachweis: die letzten 3 eigenen
  Einheiten mit dem Drill auf der aktuellen Stufe vollständig, Anstrengung ≤ 6, keine Beschwerden (Notiz mit
  Schmerz/Beschwerden oder aktive Knie-/Sprunggelenkgrenze) → eine Stufe hoch.
- **Stufe:** +1 Wiederholung in einem Satz bzw. **+1 s je Satz** (korrigiert 18.11.2026; vorher stand hier „+5 s“). In Prozent hängt das vom Ausgangswert ab (20 → 21 s = +5 %, 30 → 31 s ≈ +3 %) – eine genaue 5-%-Steigerung wird nicht versprochen. Reihenfolge: Menge bis +4 Stufen (nur innerhalb
  der Grenzen), dann Pause −5/−10/−15 s, dann Kommandos 1 s schneller.
- **Zurück:** Anstrengung ≥ 9, Beschwerden oder Drill nicht erledigt → eine Stufe zurück. Entlastungswoche: Stufe
  bleibt, ohne Zuschläge.
- **Eine Vorgabe:** Text, Timer und Zähler nutzen `plyoRx`/`plyoReps`; die Stufe steht am Drill in der Einheit und
  im Eintrag (`plyo`: id, Stufe, erledigt). Ältere Einträge ohne Angabe beginnen bei 0; Neuerstellen ändert nichts.
- **Kickbox-Vergleich unverändert** (keine Verlaufsdaten mit Drills).
- **Hilfe:** zwei neue Fragen („Vorbereitung auf den Schwerpunkt“, „Federn & Antritt heute“).

## Automatische Lastverteilung (18.11.2026, E41–E58)

Code: `08e-load.js`; eingehängt in `rpeRange` und `buildSessionCore` (Zielanstrengung, Hinweis, Extra-Technikrunde), `render` (Neuaufbau nicht begonnener Einheiten mit geänderter Rolle, Dialog), Profil → Training (Schalter, harte Tage), Blatt-Arten `loadask`/`loadhard`.

- **Frage statt Umstellung:** ab 5 Trainingstagen pro Woche (Ringzeit- und Vereinstage zusammen, ein Tag mit beidem einmal) einmal je Überschreiten – nach Tour und „Was ist neu“, nie für Kinder und Jugendliche; bestehende Profile mit ≥ 5 Tagen sehen sie beim nächsten Start. „Aktivieren“ schaltet ein und öffnet die Wahl der harten Tage; „Wie bisher“ lässt alles beim Alten.
- **Schalter** „Automatische Lastverteilung“ unter Profil → Training; aus = alles Neue entfällt, Ringzeit plant wie bisher.
- **Eingeschaltet:** höchstens 3 harte Tage pro Woche; hart zählt nur ein Eintrag (eigen oder Verein) mit Anstrengung ≥ 7. Die harten Ringzeit-Tage markiert die Person (höchstens 3). Würde ein hartes Vereinstraining die 3 überschreiten, wird der nächste markierte, noch nicht begonnene Tag mittel. Ein verpasster harter Tag: die nächste offene Ringzeit-Einheit der Woche wird hart (nie direkt nach einem harten Tag). Eine verpasste mittlere/lockere Einheit: die nächste Technik- bzw. Technik-&-Kondition-Einheit bekommt eine Technikrunde mehr, die Minuten kommen aus dem Abschlussblock (mind. 4 bleiben). Die übrigen Einheiten abwechselnd mittel (bis 6) und locker (bis 4), Mobility bleibt bei 3. Dauer und Art der Tage bleiben; nur dieselbe Woche zählt.
- Die Rolle steht an der Einheit (`ld`); ändert sie sich (Eintrag, verpasster Tag), wird eine nicht begonnene Einheit dieser Woche neu erstellt.
- Hilfefrage „Was ist die automatische Lastverteilung?“. Kickbox-Vergleich unverändert (Schalter aus ist Standard).

## Federn-Anteil der Vorbereitung in der Bilanz (18.11.2026, Prüfauftrag Punkt 2)

- **Vorher:** Die Vorbereitung auf den Schwerpunkt „Federn & Antritt“ (und im Taekwondo das Steppen vor dem Kick-Schwerpunkt) enthielt Federn, zählte aber nicht in die Grenze je Einheit. Federzeit konnte dadurch über der Grenze liegen.
- **Jetzt:** Jeder Teil der Vorbereitung trägt seinen Federn-Anteil (`f`, 0…1). Bei Federn-Schwerpunkt und TKD-Kick-Schwerpunkt gilt die Hälfte des ersten Teils als Federzeit (`PREP_FED_SHARE = 0.5`), alle anderen Teile 0. Der Anteil wird schon bei der Planung von der Grenze reserviert (`prepFedPlan`), so dass Federn-Runden und Abschlussblock nur den Rest bekommen. Anzeige („· davon N s Federn“), Timer und Bilanz (`prepFedOf`) lesen denselben Wert; Schätzungen bleiben als Schätzung gekennzeichnet.

## Wortlaut der Steigerung (18.11.2026, Prüfauftrag Punkt 3)

- Der Text versprach „etwa 5 %“ mehr. Der Code steigert je Schritt um **eine Wiederholung in einem Satz oder 1 Sekunde je Satz**. Hilfe (DE/EN), Kommentar in 08b-plyo.js und diese Dokumente sagen jetzt genau das; ein Test vergleicht Text und Code.

## Kraft im Fitnessstudio (18.11.2026, Prüfauftrag Punkt 4, E59–E66)

Nur Ort „Fitnessstudio“ (`studio`, nicht die Sporthalle `gym`) und nur die Krafteinheit. Technik- und Konditionseinheiten im Studio bleiben unverändert.
- **Ausstattung:** feste Standardliste (Langhantel, Kurzhanteln, Kettlebell, Kabelzug, Latzug, Beinpresse, Brustpresse, Rudern am Kabel, Beinbeuger, Beinstrecker, Schulterpresse, Klimmzugstange; Rad, Laufband, Crosstrainer, Rudergerät), Matte in der Dehnecke. Kein Sack, kein Ring, keine Partner- oder Pratzenstation.
- **Aufwärmen** (E61): Cardiogerät, danach Mobilisation im Stand. **Kein Abhärtungsblock**, **kein Sprungblock** (E60) – die Minuten gehen an die Kraft.
- **Kraft** (E62, E66): Geräte zuerst je Bewegungsmuster. Grundübungen fest (Beinpresse, Brustpresse), damit der Verlauf vergleichbar bleibt; Zug wechselt Rudern am Kabel / Latzug; Hüftstreckung wechselt (Beinbeuger, rumänisches Kreuzheben, Hip Thrust). Langhantel bleibt Alternative.
- **Kondition** (E59, E64): erst ein Cardiogerät, danach Kettlebell-Swings an einem Platz – höchstens ein Stationswechsel. Einschränkungen wählen das Gerät (Knie/Sprunggelenk: kein Laufband; Rücken: kein Rudergerät, keine Swings).
- **„Gerät wechseln“** (E63; bis 18.11.2026 „Anderes Gerät“): ein Tipp tauscht eine Übung gegen die nächste Alternative desselben Bewegungsmusters, die die Standardliste hat und die Einschränkungen erlauben – nur solange für die Übung noch nichts eingetragen ist und nur im Training (die Planansicht ist eine Vorschau). Cardio tauscht alle Runden dieses Geräts. Gewichte werden nie übertragen: das Ziel kommt aus dem Verlauf der neuen Übung.
- **Katalog:** sechs neue Übungen (IDs 108–113): Brustpresse, Beinbeuger, Beinstrecker, Schulterpresse (Maschine), Crosstrainer-Intervalle, Cardiogerät zum Aufwärmen – mit Skizze, Tipps und Dosierung.
- **Bestand:** `PLAN_LOGIC = 4` – nicht begonnene Einheiten werden einmal neu erstellt; begonnene, erledigte und der Verlauf bleiben.

## Prüfauftrag 18.11.2026 (2): Nachholtage, Gerätewechsel, Leichtkontakt, Tests

- **Harte Nachholtage und die aktuelle Woche:** Die Woche wird bei jedem neuen, geänderten oder gelöschten Verlaufseintrag neu bewertet (alle Einträge der Woche mit Anstrengung gehen in die Prüfung ein, nicht nur der letzte). Feste harte Tage sind tatsächlich harte Einträge (Anstrengung ≥ 7) und begonnene, hart geplante Einheiten. Würden es mit den noch geplanten mehr als 3, wird zuerst ein nicht begonnener harter Ersatztermin herabgestuft, danach wie bisher die markierten Tage (E48). Das Nachhol-Verzeichnis bleibt dabei unverändert: der Anspruch gilt als verbraucht, wird nicht weitergereicht und löst nichts Neues aus. Wird ein Eintrag wieder gelöscht oder leichter eingetragen, ist der Ersatz wieder hart. Begonnene Einheiten bleiben unverändert; Neustart und wiederholtes Neuberechnen ergeben dieselbe Woche.
- **„Gerät wechseln“ (vorher „Anderes Gerät“):** gesperrt, sobald für die Übung irgendein Wert vorliegt – jedes Feld jedes Satzes (Wiederholungen, Gewicht, linke oder rechte Seite allein), abgehakt, Anstrengung je Übung oder ein laufender Übungstimer; bei Cardio-Runden jede erledigte Runde des Geräts. Zielwerte sind nur Platzhalter und zählen nicht. Die Sperre gilt in der Anzeige (die erste Eingabe blendet den Knopf sofort aus) und im Handler (Hinweis statt Wechsel); eingetragene Daten werden nie gelöscht. Gestaltung: sekundärer Knopf mit Rahmen, dezenter Akzentfläche, Wechselsymbol ⇄ und Text, mindestens 44 × 44 px, direkt unter Übung und Vorgabe – in der geführten Ansicht und in der Trainingsliste; die Planvorschau bleibt ohne Knopf. Englisch „Change equipment“.
- **Leichtkontakt höchstens 4 Techniken – auch nach nachträglichem Ergänzen:** Bleiben in einer Einheit nur Trittkombinationen ohne Gerade, setzt die Körpertreffer-Regel eine Gerade zum Körper vor die Kombination; im Leichtkontakt wurde danach nicht mehr gekürzt (5 Techniken). Ebenso beim nachträglich ans Ende gesetzten Hochkick. Beide Stellen kürzen jetzt wie überall (erste und letzte Technik bleiben). Regressionstest mit erzwungenem Fall.
- **Tests reproduzierbar:** Jede Test-App startet mit festen Zufallszahlen (`RZ_SEED` wählt eine andere Folge zum Durchprüfen). Das Zeitlimit je Aufruf ist ein Schutz gegen Endlosschleifen (15 s, `RZ_VM_TIMEOUT`); eine Überschreitung wird als „ZEITÜBERSCHREITUNG (Laufzeit, keine fachliche Abweichung)“ gemeldet. Die größte Prüfschleife (900 Partner-Einheiten) läuft in 9 kleineren Aufrufen. Gesamtlauf mit 5 verschiedenen Seeds ohne Befund.

## Teil 36: Lastverteilung nach tatsächlicher Belastung (18.11.2026)

Grundsatz (Betreiber): **nur eingetragene Anstrengung und Belastungen steuern die Planung** – geplante, fehlende oder nicht bewertete Einheiten zählen nicht; keine neuen Aufgaben für die Anwendenden.
- **Die letzten 3 Tage entscheiden** (nur mit Lastverteilung): harter Eintrag (≥ 7, eigen oder Verein) gestern oder zwei in den letzten 3 Tagen → höchstens locker; einer vorgestern → höchstens mittel; 3 Tage oder länger her → hart erlaubt. Die Rolle gehört zum Datum: eine verschobene Einheit wird neu bewertet, und eine harte Einheit bleibt beim Verschieben eine harte (der Wochentag ihres Ursprungs zählt als markiert). Eine eigentlich harte Einheit bekommt genau das, was die 3 Tage erlauben (Beispiel Betreiber: harte Tage So + Di → Mi locker, Do mittel, Fr hart). Ersatztermine für ausgefallene harte Tage werden nur auf Tage gelegt, die hart sein dürfen. Hinweis in der Einheit mit Grund.
- **Tagesform** (freiwillig, nur wenn angegeben): schlechte Form an einem harten Tag → heute locker, die nächste offene Einheit der Woche, die hart sein darf und nicht auf einen harten Tag folgt, wird hart; Zahl der harten Tage bleibt. Wurde trotzdem hart trainiert, wandert nichts. Die Anstrengung wird dabei nur einmal gesenkt (Rolle locker, kein zusätzlicher Tagesform-Abzug).
- **Harte Reize auf harte Tage:** Kraft, Sparring und Kondition liegen auf den markierten harten Tagen, Technik auf den übrigen; die Woche behält dieselben Arten, Mobilität bleibt. Nicht begonnene Einheiten folgen, begonnene bleiben; verschobene behalten ihre Art.
- **Vereins-Sparring** zählt nur nach seiner eingetragenen Anstrengung (Entscheidung Betreiber; Vorschlag 4 entfällt).
- **Fortschritt im Verlauf:** Belastung der letzten 4 Wochen nach eingetragener Anstrengung (hart/mittel/locker) und Kraft je Übung (erster → letzter Eintrag, mit Gewicht als geschätztes Maximum nach Epley, sonst Wiederholungen/Sekunden) seit dem Einschalten der Lastverteilung bzw. der letzten 8 Wochen. Ohne Einträge keine Karte.

## Schalter Lastverteilung immer verfügbar (18.11.2026)

- Der Schalter „Automatische Lastverteilung“ steht für alle ab 18 immer unter Profil → Trainingswoche, unabhängig von der Zahl der Trainingstage. Unter 5 Tagen (Ringzeit und Verein zusammen) steht ein Hinweis darunter, dass es ab 5 Tagen am meisten bringt. Ringzeit fragt weiterhin nur von selbst ab 5 Tagen (einmal je Überschreiten). Unter 18 gesperrt wie bisher.
- Texte: Frage und Hilfe nennen „Profil → Trainingswoche“; die Hilfe beschreibt jetzt auch die 3-Tage-Regel, die Tagesform und die harten Tagesarten aus Teil 36.

## Wenig-Zeit-Modus: Fehler behoben, leichter zu finden (21.11.2026)

- **Fehler:** Eine Einheit, die schon einmal mit „Start“ geöffnet war (auch ohne jede Eingabe), behielt beim Einschalten ihre alte Länge – genau die Einheit vor dir änderte sich also nicht. Jetzt wird jede geöffnete, aber leere Einheit ab heute sofort in der neuen Länge neu gebaut (gleiche Art, Ort und Ausstattung). Einheiten mit Eingaben (Satzwerte, Haken, Runden, Anstrengung) bleiben unverändert; eingetragene Daten gehen nie verloren. Beim Ausschalten genauso zurück zur üblichen Länge.
- **Direkt an der Einheit:** Knopf „⏱ Wenig Zeit“ unter der Überschrift der Einheit (nicht an erledigten Tagen); ein Tipp schaltet den Modus dauerhaft an oder aus.
- **Im Profil:** solange der Modus an ist, steht oben ein Eintrag „Wenig-Zeit-Modus: An (seit …)“ mit „Ausschalten“ – bis er entfernt wird. Der Schalter unter Alltag & Pausen bleibt.
- Hilfe („Ich habe heute wenig Zeit.“) DE/EN angepasst.

## Wenig-Zeit-Modus: was trainiert wird (21.11.2026, Teil 39)

- **Planart automatisch** (nicht in Turniervorbereitung, Prüfungsphase, Taper/Erholung, nicht für Kinder und Jugendliche – dort nur kürzer): mit Vereinstagen wechseln die eigenen Tage zwischen Kraft erhalten (S) und kurzen Intervallen (K); ohne Verein ist der erste eigene Tag der Woche Kraft, die übrigen Technik mit Intervall-Abschluss. Mobilität bleibt. Begründung: Kraft lässt sich mit wenig Volumen halten, kurze Intervalle sind die zeitsparendste Kondition, Technik und Sparring liefert der Verein.
- **Ausrüstung:** überall nur Körpergewicht, dazu Sandsack oder Klimmzugstange, falls gewählt – auch in Halle und Fitnessstudio (keine Geräte). **Kein Partner:** Sparring wird Technik, Partnerrunden entfallen; in „Einheit anpassen“ gibt es weder Partner noch Sparring.
- **Keine Kopfkicks** in allen Sportarten (Kickboxen: auf Körperhöhe, Taekwondo: keine Kopf-Kombinationen; Sicherheitsnetz für eigene Kombis und Vorbereitung).
- **Aufwärmen in voller Länge:** 12 Minuten vor Kick-Einheiten (inkl. Vorbereitung), sonst 10; Ausklang 4.
- **Kraft erhalten:** 3 Grundübungen, 2 schwere Sätze (schwerste saubere Variante, 1–2 Wdh. vor Schluss aufhören), kein Sprungblock. **Technik:** statt Kraftteil kurze Intervalle am Ende.
- Baseline: nur das Testprofil mit Wenig-Zeit-Modus ändert sich (Ausrüstung nur Sandsack, Aufwärmen 6→10 + 2 Vorbereitung, Intervalle statt Kraftteil).

## Partnerdrills in Blöcken (25.11.2026, Teil 42 – ersetzt durch Teil 43)

Partnertraining mit Partnerübung (Kickboxen, Boxen, Taekwondo; Technik- und Konditionseinheiten): weniger verschiedene Kombinationen, länger an einer, von leicht zu schwer, ein gemeinsames Konzept für die Einheit.
- **3 Runden je Kombination**, höchstens 3 Kombinationen pro Einheit (lange Einheiten 4 Runden, ein Rest von 2 Runden ist ein eigener Block). Ein neuer Block ist immer eine neue Kombination.
- **Stufen im Block:** Runde 1 langsam und sauber → Runde 2 mit Tempo → Runde 3 mit Gegenaktion des Partners. Konditionseinheit: Rhythmus finden → hohes Tempo → mit Gegenaktion. Gegenaktion: Grundlage und Kinder einmal pro Einheit (im letzten Block), ab Fortgeschritten in jedem Block, Wettkampf und Abwehr-Schwerpunkt schon in Runde 2. Taekwondo ohne Partner-Gegenaktion: dritte Runde im Wettkampftempo gegen einen beweglichen Partner. Kinder ohne Wettkampftempo (bleibt „mit Tempo“).
- **Roter Faden:** Die Blöcke bauen eine Kombination auf – Block 1 ihr Anfang, jeder weitere Block eine Technik mehr, der letzte Block die ganze Kombination (eigene Vereinskombination zuerst, sonst die schwerste der Einheit; Taekwondo: Kickserie bevorzugt). Ein Anfang endet nie mit Abwehr oder Schritt. Ist die Kombination zu kurz (Kinder, Grundlage, Leichtkontakt), folgen dem gemeinsamen Anfang zwei Enden aus der Einheit, das leichtere zuerst („Jab, Cross“ → „Jab, Cross, Low Kick“ → „Jab, Cross, High Kick“). Geht beides nicht, nehmen die Blöcke die Kombinationen der Einheit von leicht nach schwer.
- **Regeln der Einheit bleiben:** Einstiegsrunde (70 %) mit Kicks höchstens auf Körperhöhe – der Kopfkick kommt ab Runde 2; Körpertreffer bleiben in der Einheit (über alle Blöcke mit demselben Anfang); Kinder höchstens 3 Techniken; Kickserien in Taekwondo bleiben; Full Contact: 6-Kick-Regel auf einer Partnerrunde (nicht die Einstiegsrunde).
- **Distanzrunde** (Eingang/Ausgang) bleibt eine eigene Aufgabe und steht nach dem Block, in dem sie lag (ein Block wird nicht geteilt); ihre Aufgabe steht jetzt auch in der Liste.
- **Anzeige:** „Kombination 1 · Runde 2 von 3: jetzt mit Tempo“ in der Liste und im geführten Training (DE/EN). Rollentausch nach 3–5 Wiederholungen bleibt unverändert.
- Ohne Partner, im Wenig-Zeit-Modus und ohne Partnerrunden: keine Blöcke.
- **Weniger Runden durch die Dichte-Steigerung** (Progression kürzt Runden am Ende): „Runde i von n“ stimmt danach; die weggefallene Gegenaktion kommt auf die letzte Runde des Blocks (Fortgeschritten+, Grundlage/Kinder nur wenn die Einheit sonst keine hat); ein Block mit nur einer Runde wird Zusatzrunde des Blocks davor.
- Baseline: nur Profile mit Partnerrunden ändern sich (Stufen, roter Faden, Distanzrunde nach dem Block, Einstiegsrunde mit Kicks auf Körperhöhe, Körpertreffer im Faden, gekürzter letzter Block „von 2“ mit Gegenaktion).

## Teil 43: Kombinationen nach Bewegung, Partner-Einheiten in Themenblöcken (25.11.2026)

Ersetzt die Partnerdrills in 3er-Runden aus Teil 42 (Blöcke, Stufen und roter Faden bleiben als Idee, jetzt als Zeitblöcke).

**Kombinationen nach Bewegung (alle drei Sportarten, `src/app/08g-flow.js`).** Keine festen Listen mehr: jede Kombination wird Schritt für Schritt gebaut, und jeder Schritt muss aus der Körperposition der vorigen Technik folgen (Rechtsauslage, V = vorne, H = hinten):
- Seiten wechseln: eine hintere Technik dreht die Hüfte und lädt die vordere Seite (Cross → Führhand-Haken, -Uppercut, -Roundhouse), der Führhand-Haken dreht zurück und lädt die hintere (→ Cross, hinterer Uppercut, Roundhouse/Low Kick hinten, Knie). Dieselbe Seite zweimal nur als echte Doppelung: Jab–Jab, Jab Körper–Jab, Jab–Führhand-Haken, Körperhaken–Kopfhaken (auch die V/H-Anzeige folgt dieser Regel).
- Distanz: nach Front-/Side-/Rückwärtstritt (schiebt weg) kein Haken, Uppercut, Knie; aus der Nahdistanz kein Front-, Side-, Rückwärts-, Axt- oder Hakentritt.
- Gewicht: nach einem hinteren Schlag kein vorderer Stoß-, Axt- oder Hakentritt.
- Drehtritte nur aus der Gegendrehung davor (Jab, Führhand-Haken, vorderer Side-/Roundhouse-Kick), nie zwei Drehungen; Sprungtechniken nur aus einer Handtechnik.
- Eröffnung mit einer reichenden Technik (Jab, Kick, selten Cross/Haken; Grundlage nie mit Kopfkick), Abschluss mit einer Wirkungstechnik oder einem Kick – nie mit dem Jab. Kicks hintereinander: Grundlage einer, sonst zwei (Trittketten ab Fortgeschritten).
- Häufigkeit nach Trainingsalltag (Jab, Cross, Haken, Roundhouse zuerst; Dreh-, Sprung- und Brazilian Kicks selten); „mehr Boxen/mehr Kicks“ verschiebt die Anteile; ITF Hand-Fuß-betont.
- Taekwondo: Tritte landen vorn, die Beine wechseln von selbst; Drehtritte aus einem drehenden Tritt (oder Drehschritt), Sprungtritte aus Tritt oder Schritt, kein Fauststoß nach einem Schiebetritt, Schritte nur am Anfang, höchstens eine Serie.
- Der Schwerpunkt der Einheit ist eine Bauregel (Eröffnung, Abschluss, Körper–Kopf …) statt einer nachträglichen Änderung; Abdeckung (Kopfkick, Low Kick, Knie, Körpertreffer) baut eine neue passende Kombination, statt Techniken anzuhängen. Eigene Vereinskombinationen bleiben unverändert.

**Partner-Einheiten in Themenblöcken (`src/app/08h-pblocks.js`).** Mit Partner (Technik und Kondition, alle Sportarten, auch Turniervorbereitung, nicht im Wenig-Zeit-Modus):
- Ein sichtbares Thema für die ganze Einheit (der Schwerpunkt, z. B. „Körper – Kopf“, „Low Kick nach der Hand“).
- Hauptteil = Blöcke am Stück von 8–12 Min. (Kinder 5–6, bis 10 Blöcke); ein kurzer Hauptteil bleibt ein Block. Pausen zwischen den Blöcken wie bisher die Rundenpausen.
- Leicht → schwer: die Blöcke bauen eine Kombination auf (Kern des Themas, je Block eine Technik mehr, zuletzt die ganze Kombination); reicht sie nicht, Kombinationen desselben Anfangs (bzw. desselben Abschlusses), nie schwerer als die letzte.
- Stufen nach Zeit im Block (ca. 30/35/35 %): langsam und sauber → mit Tempo + Eingang/Ausgang (frühere Distanzrunde) → mit Gegenaktion des Partners (frühere Abwehrrunde). Grundlage und Kinder: Gegenaktion nur im letzten Block, sonst Wettkampftempo (Kinder: zwei Stufen, ohne Wettkampftempo); Taekwondo: keine Gegenaktion, Wettkampftempo. Kondition: Rhythmus finden → hohes Tempo → Gegenaktion.
- Rollentausch unverändert nach 3–5 Wiederholungen. Einstieg: Stufe 1 des ersten Blocks mit 70 % und Kicks auf Körperhöhe. Full Contact: 6-Kick-Regel in der Tempo-Stufe eines Blocks.
- Anzeige: Thema über den Blöcken, je Block „Block 1 von 4 · 9,5 Min. am Stück“ mit Stufenplan; Training: aktuelle Stufe, beim Stufenwechsel Doppelglocke und Ansage; A/B-Rahmen erst in der Gegenaktions-Stufe.
- Progression: längere Pause → Blöcke werden kürzer, keiner fällt weg.
- Baseline: neu aufgenommen – alle Kombinationen kommen aus dem Baukasten, Partner-Einheiten bestehen aus Blöcken.
