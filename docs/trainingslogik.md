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

