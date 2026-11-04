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
- Das Level kommt aus dem Fitnesstest: gemeinsame Werte (Kraft, Schnelligkeit, Ausdauer, Beweglichkeit) plus die Technik-Einschätzung der jeweiligen Sportart. Full Contact und K1 sind nicht mehr an das Level gebunden, nur an das Mindestalter (15 Jahre).

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
