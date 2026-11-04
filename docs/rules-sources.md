# Ringzeit Dev – Regel- und Trainingsquellen

Angelegt in Teil 3-Q (03.11.2026). Regeln, Prüfungsprogramme und Trainingsquellen stehen getrennt. Eine Trainingsquelle
ist keine Verbandsregel. Nur aufgenommen, was tatsächlich geprüft wurde; „Fassung/Gültigkeit“ nennt den geprüften Stand.

## A. Wettkampfregeln (Verbände)

| Nr. | Herausgeber | Titel | URL | Fassung / Gültigkeit | Geltungsbereich | Fundstelle | Status |
|---|---|---|---|---|---|---|---|
| R1 | WAKO | Regelwerke Kickboxen (LC, KL, FC, K1) | – | im Code als `RULE_PROFILE` (`src/sports/kickboxing/rules.js`) übernommen | Kickboxen | – | **Fassung noch nicht belegt** (Befund aus Schritt 1); Prüfung bei Bedarf eigener Auftrag |
| R2 | Deutscher Boxsport-Verband e.V. (DBV) | Die Wettkampfbestimmungen des DBV für das olympische Boxen (WKB), rechtsverbindliche, nicht kommentierte Fassung | https://www.boxverband.de/wp-content/uploads/2026/09/DBV-WKB-Wettkampfbestimmungen.pdf · Übersicht https://www.boxverband.de/wettkampfbestimmungen/ | Stand 01.09.2026, in Kraft seit 01.11.2026 (§ 108); ersetzt die bisherige „WB“ | olympisches Boxen im DBV | Altersklassen § 46, Runden § 47, Trefferfläche (Begriffsbestimmungen), Regelverstöße § 43, Kopfschutz § 26, Gewichtsklassen § 45 + Anhang 1–2, Sparring § 52, Sperren § 81 Abs. 9, §§ 89–91, Stufenplan Anhang 5 | **geprüft 03.11.2026** an der PDF; in der App nur verlinkt (Entscheidung B1, `docs/boxing-concept.md`) |
| R3a | World Taekwondo (WT) | Competition Rules & Interpretation (Kyorugi) | https://www.worldtaekwondo.org/ (PDF in Kraft ab 01.06.2026, nicht maschinell lesbar) · gelesen: Fassung in Kraft ab 01.01.2026 über taekwondobond.nl und USA Taekwondo (Art. 7, 11, 12, 14) | 01.01.2026; 01.06.2026 vorhanden, nicht geprüft (D5; für 6b ersatzweise Kopie bei taekwondo.dk, Art. 11/12, Stand 01.06.2026, gelesen) | Taekwondo WT, international | Art. 4, 5, 7, 11, 12, 14 | belegt mit Einschränkung (5) |
| R3b | Deutsche Taekwondo Union (DTU) | Wettkampfordnung Zweikampf (WOZ) 8.1 + 8.1.4 WT-Neuerungen | https://www.dtu.de/fileadmin/Downloads/Ordnungen/2026/8.1_Wettkampfordnung_Zweikampf_Stand_01.01.2026.pdf · https://www.dtu.de/downloads/regelwerke-co | Stand 01.01.2026 | Taekwondo WT, Deutschland | 1, 2.4–2.5, 4.1, 4.4, 7.1–7.3, 10.4, 17.3 | belegt (5) |
| R3c | DTU | Prüfungsordnung für Kup-, Poom- und Dangrade (PO 2024), Nr. 10.1 | https://www.dtu.de/fileadmin/Downloads/Ordnungen/2026/10.1_PO_Stand_12.09.2026.pdf | Änderung Beschluss MV 12.09.2026 (Urfassung rückwirkend 01.01.2024) | WT-Kup bis 1. Dan/Poom | Erster Teil § 1 Nr. 5, § 2, § 3; Zweiter Teil § 1–3 | belegt (5) |
| R3d | Kukkiwon | Taekwondo Technical Terminology (EN) | Kopie: https://wientaekwondo.com/wp-content/uploads/2022/07/Technical_Terminology_ENG.pdf | Vorwort 01.03.2012 | Umschriften WT | Tritte, Stellungen, Blöcke, Schritte | belegt, ältere Fassung |
| R4a | ITF-D | Prüfungsordnung (PO) · Kids-Prüfungsordnung (KPO) | https://www.itf-d.de/api/public/res/file-manager/downloads/rules/67b44df9564df.pdf · https://itf-d.de/files/itf-d/downloads/regelwerke/kpo.pdf | PO 14.02.2025 · KPO 03.06.2012 | ITF-D-Kup bis 1. Dan, Kinder | PO §§ 1–3, 5, 7, 8 | belegt; Gürtelfarben: Angabe des Betreibers 03.11.2026 (= DTU-Folge, D2 erledigt), Tabelle § 7 prüfen (D3) |
| R4b | ITF-D | Wettkampfordnung (WO) | https://www.itf-d.de/api/public/res/file-manager/downloads/rules/63a9cc9056659.pdf | Stand 01.01.2023 | ITF-D-Turniere | §§ 1–5 | belegt (5) |
| R4c | International Taekwon-Do Federation (Sitz Wien) | ITF Tournament Rules | https://itf-tkd.org/wp-content/uploads/2026/03/itf-tournament-rules-ver.22.03.2026.pdf | ver. 22.03.2026 | ITF international | Rundenzeiten, Trefferflächen, Punkte, Fouls, Ausrüstung | belegt; Anwendung durch ITF-D vom Betreiber bestätigt (03.11.2026) |
| R4d | Wikipedia | International Taekwondo Federation (de) | https://de.wikipedia.org/wiki/International_Taekwondo_Federation | abgerufen 03.11.2026 | Zuordnung ITF-D → ITF Wien | – | nur Zuordnung, keine Regelquelle |

## B. Prüfungsprogramme

Noch keine (Kickbox-Gürtelprogramm stammt aus der stabilen App; Quelle nicht belegt. Taekwondo ab Teil 5).

## C. Trainingsquellen (keine Regeln)

| Nr. | Autoren / Herausgeber | Titel | Fundstelle | Geprüft | Verwendung in Ringzeit |
|---|---|---|---|---|---|
| T1 | Foster C. et al. | A new approach to monitoring exercise training | J Strength Cond Res 2001; 15(1): 109–115 · Katalogeintrag https://sponet.de/sponet/Record/4006210 | Titel, Zeitschrift, Jahrgang, Seiten am 03.11.2026 über Katalog bestätigt | Belastung einer Einheit = Dauer (min) × Anstrengung (Session-RPE, 0–10) – `data-load-concept.md` 4.1 |
| T2 | Impellizzeri F. M. et al. | Acute:Chronic Workload Ratio: Conceptual Issues and Fundamental Pitfalls | Int J Sports Physiol Perform 2020 · https://pmc.ncbi.nlm.nih.gov/articles/PMC7534938/ | Titel und Thema am 03.11.2026 per Suche bestätigt; Volltext nicht abrufbar (Browserprüfung der Seite) | Begründung, das Verhältnis Vorwoche/Vorwochenmittel nur als einfachen Auslöser „etwas leichter“ zu nutzen, nicht als Verletzungsprognose – `data-load-concept.md` 4.1 |

| T3 | Chaabène H. et al. | Amateur boxing: physical and physiological attributes | Sports Med 2015; 45(3): 337–352 · https://www.pubmed.gov/25358529/ | Titel/Fundstelle am 03.11.2026 per Suche bestätigt; Volltext nicht abgerufen | Anforderungsprofil Boxen (aerob/anaerob, Schnellkraft) – `boxing-concept.md` 3 |
| T4 | Slimani M., Chaabène H., Davis P., Franchini E., Cheour F., Chamari K. | Performance aspects and physiological responses in male amateur boxing competitions: a brief review | J Strength Cond Res 2017; 31(4): 1132–1141 · https://www.pubmed.gov/28081033/ | Kurzfassung am 03.11.2026 gelesen | Serien statt Einzeltechniken, Block-/Konterverbindungen, Aktivität/Pause, Anpassung an Alter und Niveau – `boxing-concept.md` 3 |
| T5 | Gesellschaft für Pädiatrische Sportmedizin (Schulze S., Kirchem A.) | Belastungsprofil: Boxen | https://www.kindersportmedizin.org/attachments/article/241/Belastungsprofil%20Boxen.pdf (ohne Datum, Zahlen von 2015) | am 03.11.2026 gelesen | Beweglichkeit nachrangig, typische Verletzungen/Überlastungen (Hand, Schulter/Nacken). **Rundenzeiten darin veraltet** – Regeln nur aus R2 |

Hinweis: Das Bereichsmodell (Beine/Tritte, Schultern/Arme, Rumpf, Ausdauer, Beweglichkeit) ist eine bewusst einfache
eigene Festlegung aus den vorhandenen Übungsdaten (Meidecodes, Kategorien), keine Quelle mit Muskel- oder Erholungswerten.

Box-Geschichte und Wissenswertes (4b, nicht als Regelquelle): Olympedia (olympedia.org, Sportseite Boxen) und Wikipedia „Boxing at the Summer Olympics“; geprüft am 03.11.2026 per Suche; Verwendung: kurze Fakten im Ratgeber „Amateurboxen – kurze Geschichte“ und in den Box-Fakten (`src/app/02-tips.js`, Quellenzeile je Eintrag).

Taekwondo-Geschichte und Wissenswertes (6d, nicht als Regelquelle): Wikipedia „Taekwondo“, „International Taekwon-Do Federation“, „Deutsche Taekwondo Union“; taekwondonation.com (WT-Geschichte); Olympedia (olympische Einordnung); geprüft am 03.11.2026 per Suche; Verwendung nur für Fakten und Geschichte im Ratgeber.
