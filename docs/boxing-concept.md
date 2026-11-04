# Ringzeit Dev – Boxen (DBV): Regelmatrix und Trainingskonzept

Teil 4a-Q (03.11.2026). Nur Recherche und Konzept, kein Code. Umsetzung in 4a-U (Pläne), Tipps/Kleidung/Ratgeber in 4b.
Quellen: `docs/rules-sources.md` (R2 Regeln, T3–T5 Training). Trainingsempfehlungen sind **keine** DBV-Regeln und werden
in der App nie als solche bezeichnet.

## 1. Entscheidungen des Betreibers (03.11.2026)

| Nr. | Entscheidung |
|---|---|
| B1 | Regeln: in der App nur ein Verweis auf die WKB-PDF (wie beim Kickboxen). Keine Handschuh-/Unzenangaben, keine Gewichtsklassentabelle. Übernommen wird nur, was der Planer braucht (Rundenformat je Altersklasse, Sperre nach Niederschlag). |
| B2 | Partnertage = **Aufgabensparring** (A/B mit klarer Aufgabe). Dazu höchstens eine Runde **„Freies Touch-Sparring“**: frei, aber minimaler Kontakt (höchstens 30–40 % Schlaghärte), nur mit Partner und kompletter Schutzausrüstung, ab Fortgeschritten, nicht für Kinder, nicht in Taper-/Erholungswochen und nicht während einer Sperre. Hinweis bei der Runde: „Freies Sparring nur nach Absprache mit deinem Trainer und unter Aufsicht.“ Vorbild ist die bestehende Kickbox-Runde „Freies technisches Sparring“ (dort 50 %, Trainer schaut zu). |
| B3 | **Keine Abhärtung.** *(Geändert in 7b, Betreiber 04.11.2026: ab Level 1, 16 Jahren, ohne Einschränkungen und nicht in Entlastungs-/Taper-/Erholungswochen wird die zweite Hälfte des Blocks Körperabhärtung – „Handgelenk & Körperabhärtung“.)* Stattdessen ein fester Block **Handgelenk & Griff**. Mehr Anteil an **Beinarbeit** und **Oberkörperarbeit (Meiden mit dem Kopf)**. |
| B4 | Über 40 Jahre: kein DBV-Format; Trainingsstandard **3 × 2 Min., 1 Min. Pause**, gekennzeichnet „kein offizielles DBV-Format“. |

## 2. Regelmatrix (DBV-Wettkampfbestimmungen)

Quelle R2: „Die Wettkampfbestimmungen des Deutschen Boxsport-Verbandes e.V. für das olympische Boxen“ (WKB),
rechtsverbindliche, nicht kommentierte Fassung, **Stand 01.09.2026, in Kraft seit 01.11.2026 (§ 108)**; ersetzt die bisherige „WB“.
Geltungsbereich: Wettkämpfe im DBV. Geprüft am 03.11.2026 an der vom Betreiber bereitgestellten PDF.

| Kategorie | Regel | Fundstelle | Verwendung in Ringzeit |
|---|---|---|---|
| Altersklassen | nach Kalenderjahr: **U13 Schüler** (10–12 im laufenden Jahr), **U15 Kadetten** (13–14), **U17 Junioren** (15–16), **U19 Jugend** (17–18), **Erwachsene** (ab 19 bis Ende des Jahres des 40. Geburtstags) | § 46 Abs. 1–6 | Rundenformat in der Turniervorbereitung; Alter = Jahr − Geburtsjahr (nicht das genaue Geburtsdatum) |
| Runden | immer **3 Runden**, **2 Pausen à 1 Min.**; Rundenlänge U13 **1 Min.**, U15 **1,5 Min.**, U17 **2 Min.**, U19 **3 Min.**, Erwachsene **3 Min.** | § 47 Abs. 1–2 | Kampfformat-Runden wie beim Kickboxen (`waFormat` → `dbvFormat`) |
| verschiedene Altersklassen | Rundenzeit der jüngeren Klasse; Verkürzung durch Vereinbarung möglich, nicht bei Meisterschaften | § 47 Abs. 3–5 | nicht modelliert (Standardformat) |
| über 40 | keine Altersklasse | § 46 Abs. 6 | **offen in den Regeln** → Trainingsstandard 3 × 2 Min. (B4) |
| unter 10 | keine Altersklasse | § 46 Abs. 2 | kein Kampfformat; Kinder-Modus der App |
| Trefferfläche | Vorderseite Kopf und Oberkörper bis einschließlich Gürtellinie, nur mit geschlossener Faust und Schlagfläche des Handschuhs | Begriffsbestimmungen „Trefferfläche“ | Partnerziele in Drills: Kopf/Körper vorn; nie Hinterkopf, Nacken, Nieren, unter Gürtel |
| verbotene Handlungen (Auswahl, drillrelevant) | u. a. Halten/Klammern, Kopfstoß, **Abducken unter die gegnerische Gürtellinie**, dauerhaft gestreckter Arm, Rücken zuwenden, Schulter/Ellbogen/Knie/Fuß als Angriff | § 43 Abs. 1 c, h, i, j, l, m, n | Meiden-Drills: Abtauchen nur bis Hüfthöhe; Halbdistanz ohne Klammern; keine Tritte/Knie |
| Kopfschutz | Pflicht, wenn ein Wettkämpfer weiblich ist oder U13–U19 angehört | § 26 Abs. 3 | Ausrüstungshinweis beim Sparring (4a-U/4b) |
| Wettkämpfe je Tag | einer je Kalendertag, 12 Std. Mindestabstand | § 44 | nur Ratgeber |
| Gewichtsklassen | je Altersklasse und Geschlecht, Anhang 1 (männlich) / Anhang 2 (weiblich) | § 45, Anhang 1–2 | **nur Verweis** (B1); Turnier-Eintrag behält das freie Feld „Gewichtsklasse bis kg“ |
| Sparring | WKB regeln nur **öffentliche** Sparringskämpfe bei Veranstaltungen (Ringrichter, lizenzierter Sekundant); Trainingssparring ist nicht geregelt | § 52 | keine Regelableitung; Sparring in der App folgt B2 |
| Sperre nach Niederschlag | erstmalig **mindestens 30 Kalendertage**; erneut innerhalb von 3 Monaten nach Ablauf: **3 Monate**; danach erneut: **1 Jahr**. Während der Sperre keine Wettkämpfe **und keine wettkampfnahen Trainingsformen**. Rückkehr nur nach ärztlicher Freigabe | § 81 Abs. 9, § 89, § 91 | Box-Sperre 30 Tage statt WAKO-4-Wochen; Text nennt die Steigerung und „Ringarzt/Arzt entscheidet“ |
| Wiedereinstieg nach Niederschlag | Stufenplan: 0 Pause 24–48 h · 1 normale Aktivität · 2 leichtes Ausdauertraining (< 70 % HFmax, kein Krafttraining) · 3 leichte Übungen (Schatten, Seil, Intervalle) · 4 Boxtraining kontaktlos (Sack, Pratzen, Kraft) · **ärztliche Vorstellung** · 5 Vollkontakt (Techniksparring, dann Sparring) · 6 Wettkampf **frühestens 35 Tage nach K.o.**; je Stufe 24 h symptomfrei | Anhang 5 | während der Sperre nur kontaktlose Inhalte, kein Partnerkontakt/Sparring; Stufen als Hinweistext, keine automatische Stufensteuerung |
| Ärztliche Untersuchungen | Grunduntersuchung, jährlich, am Wettkampftag | § 40 | nur Ratgeber (4b) |

Nicht in den WKB (offen, nicht erraten): Leistungs-/Erfahrungsklassen, Masters-/Breitensportformat (§ 39 Abs. 3 nennt
Breitensport-/Masterboxen nur, ohne Format), Trainingsumfänge.
Formaler Widerspruch, für Ringzeit ohne Bedeutung: 12-Unzen-Grenze § 25 Abs. 2 (über 65 kg) vs. § 48 Abs. 3 c („ab 70 kg“).

## 3. Trainingskonzept (Trainingsquellen, keine DBV-Regel)

**Anforderungsprofil** (T3, T4): olympisches Boxen ist hochintensiv und intermittierend; aerobe Grundlage und anaerobe
Kapazität tragen beide; Schnelligkeit, Schnellkraft und Kraftausdauer der Arme und des Rumpfs; Sieger landen mehr Serien
(drei Schläge und mehr), mehr Block-/Konterverbindungen und sind defensiv wirksamer; Elite boxt mit deutlich höherer
Aktivität je Pause als Anfänger. Beweglichkeit ist nachrangig (T5), Grundbeweglichkeit für Schulter, Brustwirbelsäule
und Hüfte bleibt. Folgerungen für Ringzeit:

1. **Kombinationen und Serien** statt Einzeltechniken; Rückkehr in die Deckung nach jeder Serie.
2. **Beinarbeit** als eigener Inhalt: Schritte vor/zurück/seitlich, Drehschritt (Pivot), rein–raus, Kreis um Sack/Partner,
   Ecke/Seile verlassen.
3. **Meiden mit dem Kopf/Oberkörper nur mit Gegneraktion** (7B): solo als vorgestellter Schlag („Jab kommt – außen
   pendeln – Gerade“), mit Partner als echte Aktion von B. Pendeln, Abrollen unter Haken, Rückbeuge, Abtauchen nur bis
   Hüfthöhe (§ 43 i). Keine zufällig eingestreuten Abwehrbausteine. Die Kickbox-Entscheidung (keine zufälligen
   Verteidigungen in Solokombinationen) bleibt unberührt; Boxen nutzt nur benannte Drills mit Aktion.
4. **Handgelenk & Griff** (B3) statt Abhärtung.
5. **Weniger Mobility-Tage** als Kickboxen; Aufwärmen und Cool-down behalten ihre Beweglichkeit.
6. Nacken: die bestehende isometrische Nackenkräftigung bleibt Teil von Kraft/Handgelenk-Block.

### 3.1 Einheitsarten (gleiche Kennbuchstaben wie Kickboxen, Inhalte boxspezifisch)

| Art | Boxen – Hauptinhalt | Unterschied zum Kickboxen |
|---|---|---|
| T Technik | Schatten-/Sackrunden mit Aufgabe (Serie + Beinarbeit, Meiden mit Gegneraktion, Körper–Kopf), Kombinationen 2–4 Schläge | keine Tritte/Knie; mehr Beinarbeit und Meiden |
| C Technik & Kondition | Sackrunden im Kampfformat, dann Intervalle | gleich aufgebaut |
| P Partner | Pratzenrunden + **Aufgabensparring** (3.3), höchstens eine Runde Freies Touch-Sparring | Aufgaben ohne Tritte; Touch statt 50 % |
| S Kraft | Grundübungen, Rumpf, Schulterstabilität, Schnellkraft (Würfe/Liegestütz-Varianten) | gleiche Logik (3-D), Handgelenk-Block statt Abhärtung |
| K Kondition | Seil, Läufe, Intervalle in Rundenlänge | gleich |
| M Mobility | Schulter, Brustwirbelsäule, Hüfte, Sprunggelenk | seltener eingeplant (3.2) |

### 3.2 Wochenmuster (Vorschlag `dayPattern`)

| Tage | Kickboxen (heute) | Boxen (Vorschlag) |
|---|---|---|
| 1 | T | T |
| 2 | T S | T S |
| 3 | T S P | T S P |
| 4 | T S P K | T S P K |
| 5 | T S P C M | T S P C K |
| 6 | T S P K T M | T S P K T M |
| 7 | T S P K T S M | T S P K C S M |

Begründung: bei 5 und 7 Tagen tritt Kondition an die Stelle eines Mobility- bzw. Techniktags (Boxen ist stärker
anaerob-intermittierend, T3/T4; Beweglichkeit nachrangig, T5). Nutzer können jede Art wie bisher ändern.

### 3.3 Partner: Aufgabensparring und Drills (7E)

Ablaufprinzipien aus dem Kickboxen übernommen: A/B klar benannt, kontrollierter Kontakt, Rollentausch je Runde, leichte
Einstiegsrunde, sparsame Gegenaktionen, klare Seiten-/Zielangaben, übersprungene Inhalte bleiben offen.
Konkrete Kickbox-Aufgaben werden **nicht** übernommen, sondern neu für Boxen formuliert:

| Aufgabe (Arbeitstitel) | A | B | Stufe | leicht* |
|---|---|---|---|---|
| Nur Führhand | nur Jab (Kopf/Körper), Distanz halten | nur Jab, Deckung zurück | alle | ✓ |
| Angriff – Verteidigung | 1–2 Schläge Angriff | nur Verteidigung (Block, Meiden, Schritt) | alle | ✓ |
| Konter nach Meiden | pendelt/rollt ab und kontert | schlägt Jab bzw. Haken als Signal | ab Fortgeschritten | ✓ |
| Körper – Kopf | Serie zum Körper, dann Kopf | blockt, kontert nur mit Jab | alle | ✓ |
| Druck – Rückwärts | geht vor, schneidet den Ring ab | arbeitet rückwärts mit Jab und Drehschritt | ab Fortgeschritten | |
| Raus aus der Ecke | steht an Seil/Ecke, verlässt sie mit Meiden + Schritt | hält leichten Druck | ab Fortgeschritten | |
| Halbdistanz | Haken/Aufwärtshaken, **kein Klammern** (§ 43 n) | dasselbe, Rollentausch nach 1 Min. | ab Fortgeschritten | |
| Erster Treffer | wer zuerst sauber trifft, Reset | wie A | ab Fortgeschritten | ✓ |
| **Freies Touch-Sparring** | frei, höchstens 30–40 % Schlaghärte | wie A | ab Fortgeschritten, nur Partner + Schutz | |

\* leicht = in Taper-/Erholungswochen und in der Prüfungsvorbereitung erlaubt (wie `LIGHT_TASKS`).
Ohne Partner: Schatten-/Sack-Variante mit vorgestelltem Gegner (wie beim Kickboxen), Freies Touch-Sparring entfällt.
Einschränkungen gelten für A **und** B: Schulter/Handgelenk/Hand (Meidecodes s, w) streichen Schlagaufgaben und Pratzen
halten; Nacken/Kopf → keine Meiden-Drills mit Kontakt. Kinder: kein Sparring, keine Kopftreffer am Partner, nur Pratze,
Sack und Schatten. Jugendliche und Frauen: Kopfschutz-Hinweis (§ 26). Sperre nach Niederschlag: nur Solo, kontaktlos.

### 3.4 Block „Handgelenk & Griff“ (statt Abhärtung, 6 Min.)

Aus dem Bestand (bewährte Dosierung aus `core/prescription.js`): Handtuch auswringen (3 × 20 s), Faustschluss-Kraft
(10 × 3 s, 2 Durchgänge), Faust-Stütz (3 × 20–30 s, auf Matte), Faust-Liegestütze auf Matte (ab Fortgeschritten),
isometrische Nackenkräftigung. Neu (4a-U, Dosierung als Verordnung): Handgelenk-Beugen und -Strecken mit Kurzhantel oder
Band (je 2 × 15), Fingerstrecken gegen Gummiband (2 × 20). Kinder: nur Körpergewicht-/Handtuchübungen. Nicht übernommen:
alle Kickbox-Abhärtungen mit Treffern oder ohne Handschuh (Faust/Bandagen/Knöchel am Sack, Bauch, Unterarme, Schienbein).

### 3.5 Formate

- Turniervorbereitung: letzte Runden im **DBV-Format der Altersklasse** (§ 47), wie beim Kickboxen.
- Ohne Turnier: Standard 3 Min./1 Min. für Erwachsene/U19, sonst Rundenlänge der Altersklasse; über 40: 3 × 2 Min. (B4).
- Sperre nach Niederschlag: 30 Tage (statt 28), Hinweistext mit § 89-Steigerung und Stufenplan; keine automatische
  Freigabe, keine medizinische Bewertung durch die App.

## 4. Gemeinsame Belastungsgrundlage (Beispiele mit den echten Kernfunktionen)

Alle Sportarten schreiben in denselben Verlauf; Belastung = Minuten × Anstrengung (T1), eine Wochensumme, dieselben
Entlastungsauslöser (`core/history.js`, 3-U). Berechnet am 03.11.2026 mit `entryLoad`, `entryRegions`, `lightRegions`:

| Eintrag (Montag) | Last | Bereiche | Folge am Dienstag |
|---|---|---|---|
| Verein **Boxen**, Sparring, 90 Min., RPE 7 | 630 | Arme 0,55 · Beine 0,15 · Rumpf 0,10 · Ausdauer 0,20 | leichter nur für **Arme/Schultern** |
| Verein **Kickboxen**, Sparring, 90 Min., RPE 7 | 630 | Beine 0,35 · Arme 0,35 · Rumpf 0,10 · Ausdauer 0,20 | leichter für **Beine und Arme** |

Gleiche Last, unterschiedliche Verteilung: Boxen belastet die Beine weniger (Beinanteil auf 0,15 begrenzt, Rest den
Armen zugeschlagen – eigene einfache Festlegung aus 3-Q). Woche mit Wechsel: Mo Verein Boxen 630 + Di eigene Einheit
Boxen T 60 Min. RPE 5 = 300 + Mi Verein Kickboxen 90 Min. RPE 6 = 540 → **eine** Wochensumme 1 470; Entlastung und
Projektion sehen alle drei Einträge, es gibt kein zweites Belastungskonto.

## 5. Beispielprofile (gleiches Zeitbudget, Erfahrung, Ausrüstung)

Vergleich je 60 Min., Fortgeschritten, Ausrüstung Sack + Seil (P: Partner + Pratzen). Kickboxen = Mittel aus 10 echten
Plänen (`buildSessionCore`, Light Contact, 03.11.2026); Boxen = Vorschlag für 4a-U. Minuten je Block:

| Art | Kickboxen (heute) | Boxen (Vorschlag) |
|---|---|---|
| T | Aufwärmen 9 · Technik 25 · Kraft 14 · Abhärtung 6 · Cool-down 6 | Aufwärmen 9 · Technik 25 (davon ≈ 1/3 Beinarbeit/Meiden mit Aktion) · Kraft/Rumpf 14 · Handgelenk & Griff 6 · Cool-down 6 |
| C | 9 · Technik 18 · Kondition 21 · Abhärtung 6 · 6 | 9 · Sackrunden 18 · Intervalle 21 · Handgelenk 6 · 6 |
| P | 9 · Partner 27 · Kraft 12 · Abhärtung 6 · 6 | 9 · Pratzen + Aufgabensparring 27 · Kraft 12 · Handgelenk 6 · 6 |
| S | 9 · Kraft 27 · Kondition 12 · Abhärtung 6 · 6 | 9 · Kraft 27 · Kondition 12 · Handgelenk 6 · 6 |
| K | 9 · Kondition 29 · Rumpf 10 · Abhärtung 6 · 6 | 9 · Kondition 29 · Rumpf 10 · Handgelenk 6 · 6 |
| M | 8 · Mobility 30 · 7 | 8 · Mobility 22 · lockere Beinarbeit/Schatten 8 · 7 |

Gleiche Zeitbudgets, keine erzwungene gleiche Verteilung (7D): die Unterschiede liegen in den Inhalten (keine Tritte,
mehr Beinarbeit/Meiden), im Handgelenk-Block und im Wochenmuster (3.2).

Weitere Profile für die 4a-U-Tests:

| Profil | Erwartung |
|---|---|
| Junior U17 (16 J.), Anfänger, 45 Min., Sack + Seil, kein Partner | Technik als Schatten/Sack mit vorgestelltem Gegner, Rundenlänge 2 Min., kein Sparring |
| Schülerin U13 (11 J.), 30 Min. | Kinder-Modus, Runden 1 Min., nur Körpergewicht, kein Sparring/Partnerkontakt |
| Erwachsener, Wettkampf, Turnier in 4 Wochen, Partner | Kampfformat 3 × 3 Min./1 Min.; Aufgabensparring + eine Runde Touch-Sparring (nicht im Taper) |
| 45 Jahre, Fortgeschritten | Masters-Anpassungen der App, Runden 3 × 2 Min. „kein offizielles DBV-Format“ |
| Boxer nach K.o. (Sperre) | 30 Tage nur Solo, kontaktlos; Hinweis Stufenplan, ärztliche Freigabe |
| Wechsel Boxen ↔ Kickboxen | gemeinsamer Verlauf, Bereiche nach Sportart, Level je Sport getrennt (3-U) |

## 6. Vorschlag für 4a-U (testbare Unterteile, ohne Freigabe)

1. **U1 Regelprofil:** `src/sports/boxing/rules.js` (`dbvFormat(alter im Jahr)`, Standard, Sperrdauer, Link R2), Sport
   registriert mit `visible: false` + Entwicklungsvorschau-Kennzeichnung.
2. **U2 Techniken/Drills:** Schläge, Beinarbeit, Meiden mit Gegneraktion, Pratzen- und Sackserien (`techniques.js`).
3. **U3 Planer:** Einheitsarten 3.1, Wochenmuster 3.2, Formate 3.5, Handgelenk-Block 3.4 (neue Verordnungen).
4. **U4 Partner:** Aufgabensparring 3.3, Touch-Sparring mit Hinweis, Einschränkungen in A und B.
5. **U5 Tests:** Kickbox-Vergleichsbasis unverändert; Boxprofile aus 5; Wechsel Boxen → Kickboxen mit gemeinsamer Historie.
