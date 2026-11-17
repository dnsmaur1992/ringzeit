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
