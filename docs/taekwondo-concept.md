# Ringzeit Dev – Taekwondo (WT und ITF): Quellen, Grad- und Trainingsmodell

Teil 5 (03.11.2026). Nur Recherche und Konzept, kein Code. Umsetzung: 6a (Gürtelbereich, Dobok), 6b (WT-Pläne),
6c (ITF-Pläne), 6d (Ratgeber). Quellen: `docs/rules-sources.md` R3a–R3d (WT/DTU/Kukkiwon), R4a–R4d (ITF/ITF-D).

Drei Dinge werden in der App immer getrennt gekennzeichnet:
- **Wettkampfregel**: aus den Regelwerken in R3/R4.
- **Prüfungsanforderung**: aus den Prüfungsordnungen (DTU bzw. ITF-D).
- **Trainingsempfehlung**: Ringzeit-Vorschlag, *keine* Verbandsregel, Trainerprüfung empfohlen.

Ringzeit behauptet keine Verbandsanerkennung, bewertet keine Ausführung automatisch und enthält keine Wertung zwischen
Styles oder Verbänden.

## 1. Entscheidungen des Betreibers (03.11.2026)

| Nr. | Entscheidung |
|---|---|
| T1 | **WT** = WT-Wettkampf + Kukkiwon-Terminologie + DTU-Kup-Prüfungen. **ITF** = ITF-D als Referenz. Keine Vermischung, keine neue Verbandswahl (Auftrag 6E). |
| T2 | Beide Styles: alle Schülergrade bis zur Vorbereitung auf den 1. Dan; einen erreichten 1. Dan erfassen und anzeigen, keine höheren Dan-Programme. |
| T3 | **Formen werden nicht trainiert und nicht erklärt.** In der Prüfungsvorbereitung steht nur, *dass* eine Form verlangt ist und *welche* (Name bzw. Nummer laut Prüfungsordnung). Kein Inhalt, keine Abläufe, keine Formenwettkämpfe. |
| T4 | **Umschalter für Technik-Namen**: „Koreanisch“ ↔ „Sprache der App“ (wie DE/EN). Beispiel: *Ap-chagi* ↔ Frontkick/Front kick, *Dwi-chagi* ↔ Rückwärtstritt/Back kick. Weicht bewusst von 7C ab (dort: immer koreanisch). |
| T5 (Routine) | **Sprachausgabe** folgt dem Umschalter, spricht bei „Koreanisch“ aber den Namen in der App-Sprache. Grund: Deutsche und englische Stimmen sprechen die Umschriften falsch. |
| T6 (Routine) | **Allgemeine Kraft-, Ausdauer- und Dehnübungen** behalten ihre deutschen und englischen Namen. Keine erfundenen koreanischen Übersetzungen. |
| T7 (Routine) | **Gürtelfarben** nur nach belegter Verbandsfolge, keine Vereinsstreifen. Fehlt ein Beleg, wird er als offen markiert (§ 3.2). |
| T9 | DTU 3. und 2. Kup: **roter** Streifen bzw. **roter** Gürtel, kein Braun (Betreiber, 03.11.2026). |
| T10 | **Abhärtung bleibt** in beiden Styles (Betreiber, 03.11.2026): traditionelle Kampfkunst, Stärkung und Härtung von Fingern, Fäusten, Handkante, Schienbein und Füßen. Gleiche Schutzregeln wie beim Kickboxen (Alter, Einschränkungen, Entlastung). |
| T11 | ITF-D wendet die Regeln der ITF (Wien) an (Betreiber, 03.11.2026). ITF-Kinder unter 12: Partnerübungen nur Semikontakt und zusätzlich nur an der Pratze. |
| T12 | **Abhärtung Taekwondo** (Betreiber, 03.11.2026): neue Bereiche **Handkante** (Sonnal/Sonkal gegen Pratze, dann Sack; Handkanten-Klopfen), **Finger** (Fingerspitzen-Liegestütze, erst auf den Knien; volles Körpergewicht erst ab Fortgeschritten und nur Erwachsene) und **Fuß** (Ballen, Spann, Ferse gegen Pratze und Sack; Fußsohlen-/Spann-Klopfen; barfuß am Sack nur Erwachsene, Kinder mit Fußschutz). Steigerung wie bei der Faust: erst mit Schutz, ohne Schutz nur Erwachsene. |
| T13 | **Aufbau des Abhärtungsblocks** (TKD): je Einheit ein Handbereich (Faust, Handkante oder Finger) **und** ein Beinbereich (Schienbein oder Fuß), abwechselnd. **Kinder** wie beim Kickboxen nur die sanften Varianten. |
| T14 | **Freies Sparring**: WT wie Kickboxen („Freies technisches Sparring“, 50 % Kraft, nur mit Trainer, ab Fortgeschritten); ITF als Leichtkontakt, Kinder unter 12 nur Semikontakt bzw. Pratze (T11). |
| T15 | **Formennamen in der Prüfungsvorbereitung** (Betreiber, 03.11.2026): DTU mit üblichen Namen Taegeuk Il Jang bis Pal Jang (Hinweis: PO nennt nur Nummern); ITF-D mit den Tul-Namen der PO (Chon-Ji bis Choong-Moo). Nur Name, kein Inhalt (T3). |
| T8 (Routine) | Bruchtest, Selbstverteidigung (über die Erwähnung als Prüfungsteil hinaus), Waffen-SV und Spezialtechniken werden nicht trainiert. Sie stehen in der Prüfungsübersicht nur als Teil, der im Verein vorbereitet wird. |

## 2. Regelmatrix

### 2.1 WT-Wettkampf (Kyorugi)

Quellen: WT Competition Rules & Interpretation (R3a), DTU Wettkampfordnung Zweikampf (WOZ), Stand 01.01.2026 (R3b).
Die WOZ richtet sich nach WT und ETU, hat aber eigene Regeln (z. B. Best-of-Three, Golden Round). Für deutsche
Turniere gilt die WOZ, im Zweifel immer die Ausschreibung.

| Punkt | Inhalt | Beleg |
|---|---|---|
| Altersklassen (Turnierjahr) | Jugend D 7–8 · Jugend C 9–11 · Jugend B (Kadetten) 12–14 · Jugend A 15–17 · Junioren 15–20 · Senioren ab 17 · Masters 1: 35–44 · Masters 2: ab 45 | WOZ 4.1 |
| WT international | Kadetten 12–14 · Junioren 15–17 · Senioren ab 17 (nach Geburtsjahr) | R3a Art. 4 |
| Runden | Senioren und Jugend A: 3 × 2 Min., 1 Min. Pause · Jugend B–D und Masters (traditionell): 3 × 1:30 · Best-of-Three: 3 × 2 Min. (bei Jugend C/D auch 3 × 1 Min. möglich) · Golden Round 1 Min. bei Gleichstand | WOZ 7.1–7.3 |
| Erlaubte Techniken | Faust: gerader Stoß mit den Knöcheln der geschlossenen Faust · Fuß: jeder Teil unterhalb des Knöchels | R3a Art. 11 (über USATKD-Fassung, s. R3a) |
| Trefferflächen | Rumpf (Weste, nicht Wirbelsäule) mit Faust und Fuß · Kopf (oberhalb Schlüsselbein) **nur mit dem Fuß** | R3a Art. 11 |
| Punkte (ab 01.01.2026) | Faust Rumpf 1 · Tritt Rumpf 2 · Tritt Kopf 3 · Drehtritt Rumpf 4 · Drehtritt Kopf 6 · Gam-jeom für den Gegner 1 | R3a Art. 12; WT-Neuerungen 2026 (R3b) |
| Verboten (Gam-jeom, Auswahl) | Treten unter die Gürtellinie · Faust zum Kopf · Knie/Kopfstoß · Greifen/Stoßen · Bein heben, um zu blocken oder zu stören · Grenzlinie überschreiten · Fallen · Angriff auf Gefallenen | R3a Art. 14 |
| Schutzausrüstung | Dobok, Rumpf- und Kopf-PSS bzw. Weste und Kopfschutz, Tiefschutz, Unterarm- und Schienbeinschützer, Handschützer, Zahnschutz (weiß/transparent, ≥ 3 mm), Sensorsocken; Jugend B–D Kopfschutz mit Visier | R3a Art. 4; WOZ 2.4–2.5 |
| Sperre nach Gehirnerschütterung | Senioren/Masters 30 Tage · Junioren/Jugend A 40 Tage · Jugend B–D 50 Tage | WOZ 17.3 |

Gewichtsklassen stehen in WOZ 4.4. Ringzeit übernimmt sie, wie beim Boxen, **nicht** als Tabelle, sondern verlinkt nur
(Entscheidung B1 analog).

### 2.2 ITF-Wettkampf (Matsogi / Jayu Matsogi)

Quellen: ITF-D Wettkampfordnung (WO), Stand 01.01.2023 (R4b), verweist auf die „Official ITF Rules of Competition“.
ITF-D gehört laut Wikipedia zur ITF mit Sitz in Wien (R4d). Deren Turnierregeln, Fassung 22.03.2026 (R4c), dienen hier
als internationale Ergänzung. **Laut Betreiber wendet ITF-D dieses ITF-Regelwerk an** (T11; D1 geklärt).

| Punkt | Inhalt | Beleg |
|---|---|---|
| Altersklassen (ITF-D) | D-Jugend 6–8 · C-Jugend 9–11 · B-Jugend 12–14 · A-Jugend 15–17 · Erwachsene ab 18 (Alter = Wettkampfjahr − Geburtsjahr − 1) | WO 2.5 |
| Kontakt | Bis 11 Jahre **Semikontakt (Punkt-Stopp)**, ab 12 Jahren **Leichtkontakt (Durchkämpfen)** | WO 5.1 |
| Runden | ITF-D-PO: Kampf mit Schutzausrüstung, 2 Min. · ITF (Wien) international: Erwachsene 2 × 2 Min., 1 Min. Pause; Kinder 10–11 und Kadetten 12–13: 2 × 1:30, 45 s; 8–9 Jahre: 2 × 1 Min., 30 s | PO § 1 (R4a); R4c |
| Trefferflächen | Kopf (nicht Hinterkopf) und Hals (nicht Nacken) · Rumpf vorn/seitlich vom Gürtel bis zur Schulterlinie, nicht der Rücken | R4c |
| Erlaubte Techniken | Hand: Vorderfaust (*apjumok*) und Faustrücken (*dungjumok*) · Fuß: alle Teile des Fußes | R4c |
| Verboten (Auswahl) | Kopf, Ellbogen, Knie · Fegen/Beinstellen · Halten/Stoßen · Angriff in den Unterleib | R4c |
| Punkte (ITF Wien) | 1 bis 5 nach Schwierigkeit und Höhe: z. B. Hand Mitte/oben 1 · Fuß Mitte 1 · Fuß oben 2 · Sprungtritt oben 3 · gesprungene Drehung über 360° oben 5 | R4c |
| Wertung ITF-D | Punkt-Stopp: Richter vergeben 1, 2 oder 3 Punkte | WO 5.1.2 |
| Schutzausrüstung | geschlossene Handschuhe (8–13 J. 8 oder 10 oz, ab 14 J. 10 oz), Fußschutz, Kopfschutz ohne Gesichtsmaske, Zahnschutz, Schienbeinschutz, Tiefschutz (m), Brustschutz (w); ITF-D: farbige Ausrüstung nicht Pflicht, Armbinden rot/blau | R4c; WO 5.2 |

Gewichtsklassen sind in der ITF-D-WO nicht festgelegt (Anmeldung mit Gewicht, bei C-Jugend Größe). Ringzeit nennt
keine.

## 3. Grad- und Prüfungsmodell

### 3.1 WT / DTU – Kup (Prüfungsordnung Nr. 10.1, Stand MV 12.09.2026, R3c)

| Grad | Gürtel (PO § 1 Nr. 5a) | Mindestwartezeit (§ 2) | Form laut PO (nur Name/Nummer) | Zweikampf im Basisprogramm | Bruchtest (ab 15 J.) |
|---|---|---|---|---|---|
| 10. Kup | weiß | – (Anfang) | – | – | – |
| 9. Kup | weiß, gelber Streifen | 2 Mon. ab Trainingsbeginn | – (Grundschule) | Step- und Pratzensparring | – |
| 8. Kup | gelb | 2 Mon. | – (Vorprogramm Grundschule) | Step- und Pratzensparring, Angriff–Konter | – |
| 7. Kup | gelb, grüner Streifen | 2 Mon. | 1. Form – üblich: Taegeuk Il Jang | wie 8. Kup | – |
| 6. Kup | grün | 2 Mon. | 2. Form – üblich: Taegeuk Ee Jang | wie 8. Kup | – |
| 5. Kup | grün, blauer Streifen | 2 Mon. | 3. Form – üblich: Taegeuk Sam Jang | wie 8. Kup | – |
| 4. Kup | blau | 4 Mon. | 4. Form – üblich: Taegeuk Sa Jang | Pratzen- und Situations-Sparring (Angriff–Konter) | 1 Technik |
| 3. Kup | blau, roter Streifen | 4 Mon. | 5. Form – üblich: Taegeuk Oh Jang | wie 4. Kup | 2 Techniken |
| 2. Kup | rot | 6 Mon. | 6. Form – üblich: Taegeuk Yuk Jang | wie 4. Kup | 2 Techniken |
| 1. Kup | rot, schwarzer Streifen | 6 Mon. | 7. Form – üblich: Taegeuk Chil Jang | wie 4. Kup | 2 Techniken |
| 1. Dan / 1. Poom | schwarz (Poom unter 15 J.) | 1 Jahr | Taegeuk Pal Jang (in der PO „Taeguk Pal Jang“) | – | – |

Weitere Prüfungsteile: **Grundschule** (ab 9. Kup), **Wahlpflicht** (z. B. 1-Schritt-Kampf, freies Sparring,
Selbstverteidigung), **Theorie** (mündlich: koreanische/deutsche Bezeichnungen, ab 4. Kup Grundzüge der
Wettkampfregeln, ab 1. Kup Trainingslehre). Unter 15 Jahren kein Bruchtest, stattdessen eine Wahlpflichtoption.
Waffen-SV erst ab 15.

Befunde:
- Die PO nennt die Kup-Formen nur als „1.–7. Form“ und erlaubt ab dem 7. Kup „jegliche Taekwondo-Formen“. Auf Wunsch des
  Betreibers (T15) zeigt Ringzeit die übliche Kukkiwon-Folge **Taegeuk Il Jang bis Chil Jang** mit dem Hinweis „PO nennt nur
  die Nummer – im Zweifel deinen Prüfer fragen“. Beispiel: „Für den 6. Kup musst du die 2. Form können, üblich: Taegeuk Ee Jang.“
- Die PO widerspricht sich bei braunen Gürteln: § 2 nennt für den 3. Kup auch „roter **oder brauner**“ Streifen und für
  den 2. Kup „roter **oder brauner**“ Gürtel, § 1 nicht. Entscheidung des Betreibers (03.11.2026): bei der DTU wird **Rot** getragen; Braun wird nicht angeboten.

### 3.2 ITF-D – Kup (Prüfungsordnung, Stand 14.02.2025, R4a; Kids-PO Stand 03.06.2012)

| Grad | Mindestwartezeit (§ 2) | Tul laut PO (nur Name) | Partnertraining (§ 7) | Jayu Matsogi | Kyok-Pa (Bruchtest) |
|---|---|---|---|---|---|
| 9. Kup | 2 Mon. | – (Gibon Yonsup: Saju Jirugi, Saju Makgi) | – | – | – |
| 8. Kup | 2 Mon. | Chon-Ji | Sambo-Matsogi | – | – |
| 7. Kup | 3 Mon. | Dan-Gun | Sambo-Matsogi | – | – |
| 6. Kup | 3 Mon. | Do-San | Sambo-Matsogi | ja | – |
| 5. Kup | 4 Mon. | Won-Hyo | Ibo-Matsogi | ja | ja |
| 4. Kup | 4 Mon. | Yul-Gok | Ibo-Matsogi | ja | ja |
| 3. Kup | 5 Mon. | Joong-Gun | Ilbo-Matsogi | ja | ja |
| 2. Kup | 5 Mon. | Toi-Gye | Ilbo-Matsogi | ja | ja |
| 1. Kup | 6 Mon. | Hwa-Rang | Ilbo-Matsogi | ja | ja |
| 1. Dan | 1 Jahr | Choong-Moo (plus Wiederholung) | Sambo-, Ibo-, Ilbo-Matsogi | ja | ja |

Weitere Teile: Hosinsul ab 4. Kup, Theorie (*Ilon*), Verhalten (*Tedo*), für den 1. Dan zusätzlich ein
Vorbereitungslehrgang. Kinder bis 12 haben reduzierte Anforderungen. Für Kinder gibt es Minikup-Grade (Kids-PO) mit
Streifen auf weißem Gürtel, die Kids-PO stammt aber von 2012.

Befunde:
- Die ITF-D-PO nennt den Begriff „Kup“ (nicht „Gup“) und **keine Gürtelfarben**. Die üblichen ITF-Farben (weiß, gelb,
  grün, blau, rot mit Zwischenstreifen) sind damit für ITF-D **nicht belegt** (Dokumentfrage D2). Bis zum Beleg: weißer
  Standardgürtel, Grad als Text, keine Farbe.
- Die Tabelle in § 7 des PDF ist schwer lesbar. Die Zuordnung oben (Tul und Partnerform je Grad) ist vor 6a am Original zu
  prüfen (D3).

### 3.3 Grad, Fitness und Erfahrung (für 6a)

- **Grad je Style getrennt**, z. B. WT 4. Kup und ITF 8. Kup; kein Übertrag.
- **Gürtel ändert sich nur** durch eine eingetragene bestandene Prüfung oder eine manuelle Korrektur. Einheitenzahl,
  Abzeichen oder Fitnesstest ändern ihn nie.
- Vorhandenen Grad direkt eintragen (Einstieg und Profil), ohne Stufen durchzuspielen. Ohne Angabe: weißer Gürtel als
  Darstellung, *kein* bestätigter Grad.
- **Prüfungsplanung**: Datum eintragen; Ringzeit zeigt die Mindestwartezeit (Hinweis, keine Sperre) und die Prüfungsteile
  des nächsten Grads mit Kennzeichnung „laut PO“. Ringzeit trainiert nur die Teile, die zu seinen Inhalten passen
  (Grundschule-Techniken, Tritte, Partnerformen Step/Pratze, Fitness). Formen, Bruchtest, Selbstverteidigung und Theorie
  bleiben als Liste „im Verein vorbereiten“.
- **Fitnesslevel** steuert Belastung und Umfang, nicht Techniken (6A).
- **Technik-Auswahl** nach Grad: Ein Grad schaltet die Techniken frei, die ab diesem Grad in der PO vorkommen (z. B. ITF
  Twimyo-Tritte ab 2. Kup laut Kyok-Pa-Liste). Für WT legt die PO keine Technikliste je Grad fest; dort gilt ein
  einfaches Modell: Grundtritte ab 10. Kup, Drehtritte (*Dwi-chagi*, *Dwi-huryeo-chagi*) ab Erfahrung „Fortgeschritten“
  **und** grünem Gürtel, Sprungtritte nur ab blauem Gürtel. **Dieses Modell ist eine Trainingsempfehlung** (Trainerfrage
  F2).

## 4. Terminologie, Umschalter und Audio

### 4.1 Umschriften (nicht vereinheitlicht, 7C)

| Bedeutung | WT / Kukkiwon (R3d) | ITF-D (aus der PO, R4a) | DE | EN |
|---|---|---|---|---|
| Vorwärtstritt | Ap-chagi | Ap Chagi | Frontkick | Front kick |
| Halbkreistritt | Dollyeo-chagi | Dollyo Chagi | Halbkreistritt | Roundhouse kick |
| Seitwärtstritt | Yeop-chagi | Yop Chagi | Seitwärtstritt | Side kick |
| Rückwärtstritt | Dwi-chagi | Dwit Chagi | Rückwärtstritt | Back kick |
| Axttritt | Naeryeo-chagi | – (nicht in PO) | Axttritt | Axe kick |
| Drehtritt rückwärts | Dwi-huryeo-chagi | Bandae Dollyo Chagi | Drehhakentritt | Spinning hook kick |
| Sichelförmiger Tritt | Bandal-chagi | – | Sicheltritt | Crescent kick |
| Schiebetritt | Mireo-chagi | – | Schiebetritt | Push kick |
| gesprungen (Vorsilbe) | Ttwieo- | Twimyo | gesprungen | jumping |
| Fauststoß | Jireugi | Jirugi (Ap Joomuk Jirugi) | Fauststoß | Punch |
| Block | Makgi (Arae-makgi …) | Makgi | Block | Block |
| Kampfstellung | Gyeorugi-junbi | – | Kampfstellung | Fighting stance |
| Schritte | Nae-ditgi, Mulleo-ditgi, Yeop-ditgi, Dora-ditgi | – | Schritt vor/zurück/seitlich, Drehschritt | Step forward/back/side, turning step |
| Bereiche | Eolgul · Momtong · Arae | – | Kopf · Rumpf · unten | Face · Trunk · Low |
| Partnerformen | – | Sambo-, Ibo-, Ilbo-, Jayu Matsogi | Drei-, Zwei-, Ein-Schritt-, Freikampf | Three-, two-, one-step, free sparring |

Hangul ist optional (die Kukkiwon-Terminologie, Fassung 01.03.2012, enthält es; eine neuere Kukkiwon-Fassung wurde nicht eingesehen). ITF-Begriffe, die weder in der ITF-D-PO stehen noch in einer
anderen ITF-D-Quelle belegt sind, werden **nicht** eingeführt (D4).

### 4.2 Verhalten in der App

- Umschalter in den Einstellungen: „Technik-Namen: Koreanisch / Deutsch“ (bzw. English). Standard: Koreanisch.
- Anzeige bei „Koreanisch“: *Dollyeo-chagi* in der Übung, Übersetzung aufklappbar (kein Text neben jeder Technik).
- Sprachausgabe: immer der Name in der App-Sprache (T5). Grenze: Mit „Koreanisch“ steht bei Ansagen ein anderes Wort in
  der Anzeige als im Ton. Der Hinweis dazu steht beim Umschalter.
- Allgemeine Übungen (Liegestütz, Plank, Seil …) bleiben immer DE/EN (T6).

## 5. Vergleichsmatrix der Sportarten (Regeln → Folgen fürs Training)

| Merkmal | Kickboxen LC (WAKO) | Boxen (DBV) | Taekwondo WT | Taekwondo ITF (ITF-D) |
|---|---|---|---|---|
| Kontakt | Leichtkontakt, Durchkämpfen | Vollkontakt | Vollkontakt mit Punktwertung (PSS) | bis 11 J. Semikontakt, ab 12 J. Leichtkontakt |
| Hände | Schläge Kopf/Körper | nur Schläge | nur gerade Faust, **nur Rumpf**, 1 Punkt | Vorderfaust, Faustrücken; Kopf und Rumpf, 1 Punkt |
| Füße | Tritte Kopf/Körper, Fußfeger | – | Rumpf und Kopf; **Drehtritte doppelt** (4/6) | Rumpf und Kopf; Sprung- und Drehtritte höher bewertet |
| Unterhalb Gürtel | nur Fußfeger | – | verboten | verboten, Fegen verboten |
| Runden (Erw.) | laut WAKO-Profil | 3 × 3 Min. | 3 × 2 Min., 1 Min. Pause | 2 × 2 Min., 1 Min. Pause (ITF Wien); ITF-D 2 Min. |
| Folgerung Ringzeit | wie bisher | Serien, Beinarbeit, Meiden | **Tritte im Mittelpunkt**, Standbein, aktive Beweglichkeit, Distanz/Beinarbeit, wenig Schlagtraining | **Hand-Fuß-Verbindungen**, Sprung- und Drehtritte kontrolliert, Distanz, Partnerformen |

**ITF ↔ Leichtkontakt (7D – geprüfte Annahme):** Gemeinsam sind Leichtkontakt, Ziele oberhalb des Gürtels, Hand und Fuß
mit ähnlicher Wertung (Hand 1, Fuß Kopf höher) und 2-Min.-Runden. Unterschiede: ITF bewertet Sprung- und Drehtritte bis
5 Punkte, kennt Faustrücken, verbietet Fegen, Kinder kämpfen Semikontakt, und die Prüfungen verlangen Partnerformen
(Sambo/Ibo/Ilbo-Matsogi). **Folgerung:** ITF-Pläne dürfen den Kickbox-LC-*Aufbau* (Blockfolge, Rundenlogik)
übernehmen, nicht aber Kombinationen, Drills und Gewichtung. Keine umbenannten LC-Pläne.

## 6. Trainingsmodell (Trainingsempfehlung, keine Verbandsregel)

### 6.1 Blöcke und relative Schwerpunkte

Es gibt keine belegten Idealquoten (7D). Die Unterschiede sind **Umverteilungen innerhalb derselben Dauer** und folgen aus
der Regelmatrix (5). Mehr Beweglichkeit heißt *aktive* Beweglichkeit und Trittkontrolle, nicht härteres Dehnen.

| Baustein | WT | ITF |
|---|---|---|
| Technik | Tritte zu Rumpf und Kopf, Drehtritte erst nach Grad/Erfahrung (3.3), wenige gerade Fauststöße (nur Rumpf) | Hand-Fuß-Verbindungen (z. B. Fauststoß → Halbkreistritt), Faustrücken, Tritte, Sprungtritt nur nach Grad |
| Beinarbeit/Distanz | Schritte vor/zurück/seitlich (*ditgi*), Wechselschritt, Eindrehen | Gleit- und Wechselschritt, rein–raus mit Hand-Fuß-Verbindung |
| Abhärtung (T10, T12, T13; 6 Min.) | ein Handbereich (Faust, Handkante, Finger) + ein Beinbereich (Schienbein, Fuß: Ballen, Spann, Ferse), abwechselnd; Kinder nur sanfte Varianten | gleich wie WT |
| Standbein/Kontrolle | kein eigener Block; Teil der Tritt-Technik (Einbeinstand, langsames Anziehen und Strecken, kontrolliertes Zurückziehen) | Teil der Technik (langsame Tritte, Faust–Tritt-Übergänge in Zeitlupe) |
| Aktive Beweglichkeit | eigener Anteil in T- und M-Einheiten (Beinschwünge, Haltepositionen für Tritte) | etwas weniger als WT |
| Partner | Pratze (Tritt-Pratze), Step-Sparring, Angriff–Konter, Situations-Sparring nach PO; höchstens eine Runde Freies technisches Sparring (T14) | Sambo/Ibo/Ilbo-Matsogi als Drill-*Prinzip* (Angriff in Schritten, Abwehr, Konter), Semikontakt-Drills für Kinder; Freies Sparring als Leichtkontakt (T14) |
| Kraft/Kondition | wie Kickboxen, Schwerpunkt Beine/Hüfte, Sprungkraft dosiert | wie Kickboxen |

Belastungsbereiche (für `entryRegions`, eigene einfache Festlegung wie 3-Q): WT Beine 0,50 · Arme 0,15 · Rumpf 0,15 ·
Ausdauer 0,20. ITF Beine 0,40 · Arme 0,25 · Rumpf 0,15 · Ausdauer 0,20. Kickboxen bleibt 0,35/0,35/0,10/0,20 (3-Q).

### 6.2 Beispielprofile mit gleicher Dauer (60 Min., Fortgeschritten, Sack + Seil; P mit Partner + Pratzen)

Kickboxen und Boxen aus `docs/boxing-concept.md` § 5. WT und ITF sind Vorschläge für 6b/6c. Minuten je Block:

| Art | Kickboxen LC (heute) | Boxen (4a-U) | WT (Vorschlag) | ITF (Vorschlag) |
|---|---|---|---|---|
| T | 9 · Technik 25 · Kraft 14 · Abhärtung 6 · 6 | 9 · Technik 25 · Kraft 14 · Handgelenk 6 · 6 | 9 · Tritt-Technik 25 (davon ≈ 1/3 Beinarbeit/Distanz, mit Standbeinarbeit) · Kraft 8 · aktive Beweglichkeit 6 · Abhärtung 6 · 6 | 9 · Hand-Fuß-Technik 25 (≈ 1/4 Beinarbeit) · Kraft 14 · Abhärtung 6 · 6 |
| P | 9 · Partner 27 · Kraft 12 · Abhärtung 6 · 6 | 9 · Pratze + Aufgabensparring 27 · 12 · 6 · 6 | 9 · Tritt-Pratze + Step/Situations-Sparring 27 · Kraft 12 · Abhärtung 6 · 6 | 9 · Pratze + Matsogi-Drills 27 · 12 · 6 · 6 |
| M | 8 · Mobility 30 · 7 | 8 · 22 · Beinarbeit 8 · 7 | 8 · aktive Beweglichkeit/Tritthaltepositionen 34 · 3 (locker) | 8 · Mobility 28 · lockere Hand-Fuß-Verbindungen 4 · 5 |

Wochenmuster: WT plant bei 3+ Tagen eine M-Einheit mehr als Kickboxen (statt einer K-Einheit), ITF wie Kickboxen.
**Trainerfrage F1.**

### 6.3 Weitere Profile für die Tests in 6b/6c

| Profil | Erwartung |
|---|---|
| WT, Kind 10 J. (Jugend C), 8. Kup, 30 Min. | Runden 1:30 (bzw. 1 Min.), nur Grundtritte, kein Partnerkontakt außer Pratze, Kinder-Modus |
| WT, 16 J. (Jugend A), 4. Kup, Turnier in 4 Wochen | 3 × 2 Min., Drehtritte erlaubt (Grad + Erfahrung), Situations-Sparring, Sperre nach Gehirnerschütterung 40 Tage |
| ITF, Kind 9 J. (C-Jugend), Minikup | Semikontakt-Drills, keine Sprungtritte, Grad als Text (Farbe offen, D2) |
| ITF, Erwachsener, 3. Kup, Prüfung in 6 Wochen | Prüfungsübersicht: Tul *Joong-Gun* (nur Name), Ilbo-Matsogi, Jayu Matsogi, Hosinsul, Kyok-Pa als „im Verein“; Training Hand-Fuß, Ilbo-Matsogi-Drill-Prinzip |
| Wechsel WT ↔ Kickboxen | gemeinsamer Verlauf, Bereiche nach Sportart, Grad nur bei TKD, Level je Sport getrennt |
| WT und ITF parallel | zwei Grade, kein Übertrag, Pläne je Style |

## 7. Offene Punkte

### 7.1 Dokumentfragen (vor 6a/6c klären)

| Nr. | Frage | Stand |
|---|---|---|
| D1 | Welches ITF-Regelwerk wendet ITF-D an? | **geklärt**: ITF (Wien), R4c (T11) |
| D2 | Gürtelfarben der ITF-D-Kup-Grade | in PO und Kids-PO nicht für 9.–1. Kup festgelegt |
| D3 | Zuordnung Tul/Partnerform je Kup (§ 7 ITF-D-PO) am Original prüfen | PDF-Tabelle schwer lesbar |
| D4 | Weitere ITF-D-Terminologie (Stellungen, Blöcke) | keine ITF-D-Begriffsliste gefunden |
| D5 | Offizielle WT-Regel-PDF (in Kraft 01.06.2026) | auf worldtaekwondo.org vorhanden, aber nicht maschinell lesbar; Inhalte aus Fassung 01.01.2026 (nationale Kopien) und DTU-WOZ |

### 7.2 Trainerfragen (für Sichtung, keine Blockade)

| Nr. | Frage |
|---|---|
| F1 | WT: Ist eine M-Einheit mehr pro Woche (statt Kondition) sinnvoll? – **Ja** (Betreiber, 04.11.2026; umgesetzt in 7b ab 4 Tagen) |
| F2 | WT-Technikfreigabe: Drehtritte ab grünem Gürtel + Fortgeschritten, Sprungtritte ab blauem Gürtel – passt das? |
| F3 | ITF: Gewichtung Hand-/Fußtechnik in der Technikrunde (Vorschlag ≈ 40/60) |
| F4 | ~~DTU-Formen~~ – entschieden: übliche Taegeuk-Folge mit Hinweis (T15). |
| F5 | ~~Standbein-Block statt Abhärtung~~ – entschieden: Abhärtung bleibt (T10). |
| F6 | ~~ITF-Kinder unter 12~~ – entschieden: Semikontakt und nur Pratze (T11). |

## 8. Vorschlag für 6a–6d (ohne Freigabe)

1. **6a Gürtelbereich und Dobok** (Sonnet): Grad je Style (3.1/3.2), Prüfung planen mit Wartezeit-Hinweis und Teilen
   „laut PO“, Ergebnis und Verlauf, 1. Dan erfassen; weißer Dobok in allen Posen, Gürtelfarbe nur bei belegtem Grad;
   interne Testansicht.
2. **6b WT-Pläne** (Sonnet): Regelprofil 2.1, Techniken/Umschalter 4, Bausteine 6.1, Beispiele 6.2/6.3.
3. **6c ITF-Pläne** (Sonnet): Regelprofil 2.2 nach Klärung D1–D4, eigene Drills (keine LC-Kopie).
4. **6d Ratgeber** (Sonnet): Gürtelbinden, Dobokpflege, Begriffe, Prüfungsvorbereitung je Style, neutrale Geschichte.
