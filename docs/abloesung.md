# Ablöse-Anleitung: Ringzeit Dev → stabile Ringzeit (Teil 7c)

Diese Anleitung beschreibt, wie der abgenommene Stand von **Ringzeit Dev** die stabile App **Ringzeit** ersetzt.
**Stand 04.11.2026:** Das Release-Paket ist vorbereitet und geprüft (Auftrag des Betreibers 13:02). Hochgeladen wird es
nur vom Betreiber; die Schritt-für-Schritt-Anleitung dazu steht in [release.md](release.md). Die Schritte 2–5 unten
erledigt das Werkzeug `tools/release.py`.

## 1. Ausgangslage (Stand 04.11.2026)

| | Ringzeit (stabil) | Ringzeit Dev |
|---|---|---|
| Repo / Pages | `dnsmaur1992/ringzeit` · `…github.io/ringzeit/` | `dnsmaur1992/ringzeit-dev` · `…github.io/ringzeit-dev/` |
| App-Kennung (`APP_ID`) | `ringzeit` | `ringzeit-dev` (`src/app/06-storage.js`) |
| Datenspeicher (localStorage) | `ringzeit.v1` | `ringzeit-dev.v1`, Wiederaufnahme `ringzeit-dev.resume.v1` |
| Cache des Service Workers | `ringzeit-<Version>` | `ringzeit-dev-<Version>` (Präfix aus `APP_ID`, `tools/build_pwa.py`) |
| Sicherungsdatei | `"app": "ringzeit"` | `"app": "ringzeit-dev"`; der Import nimmt nur die eigene Kennung an |

Beide Apps liegen auf **derselben Herkunft** (`dnsmaur1992.github.io`). Sie teilen sich also localStorage und
Cache-Speicher und sind nur über Schlüssel und Präfix getrennt. Darauf bauen die Schritte unten auf.

## 2. Entscheidung vorab

- **Weg 1 (empfohlen): Code übernehmen, Daten bleiben.** Der Dev-Code kommt ins stabile Repo, mit `APP_ID = "ringzeit"`. Die neue Version liest beim ersten Start die vorhandenen Nutzerdaten aus `ringzeit.v1` und wandelt sie um (`hydrate`/`migrate`/`migrateExIds`). Die Nutzer behalten Link, Home-Bildschirm-Symbol und Verlauf.
- **Weg 2: Umzug auf die Dev-Adresse.** Die Nutzer installieren Ringzeit Dev neu. Ihre Daten bleiben in der alten App, weil die Sicherungen wegen der anderen Kennung nicht importierbar sind. Davon rate ich ab.

## 3. Schritte für Weg 1

1. **Sicherung:** In der stabilen App eine Sicherung exportieren (`ringzeit-…json`, altes Format) und gut aufheben. Zusätzlich ein Komplett-ZIP des stabilen Repos anlegen. Beides ist der Rückweg.
2. **Datenübernahme testen (Pflicht; am 04.11.2026 mit einer echten Sicherung bestanden, siehe 3b; vor dem Release mit einer frischen Sicherung wiederholen):**
   - In einer Kopie von Ringzeit Dev `APP_ID` auf `"ringzeit"` setzen und lokal bauen.
   - Die Sicherung aus Schritt 1 importieren, oder sie als `ringzeit.v1` in den localStorage legen.
   - Prüfen: Profil, Disziplin, Gürtel, Verlauf, Fitnesstests, Gewichte, Turniere und Pausen sind vollständig. Alte Übungsnummern werden zu Text-IDs. Kein Eintrag ist doppelt. Die Wochenbelastung stimmt.
   - Danach die vollständige Prüfung laufen lassen (`node --test …`, `node tests/final-check.mjs`).
3. **Code übernehmen:** Alle Dateien des abgenommenen Dev-Stands ins stabile Repo kopieren (`src/`, `tools/`, `tests/`, `docs/`, `package.json`, `README.md`, `installieren.html`, Icons, gebaute `index.html`/`sw.js`/`manifest.webmanifest`). Dann anpassen:
   - `src/app/06-storage.js`: `APP_ID = "ringzeit"`, `APP_NAME = "Ringzeit"`.
   - `tools/build_pwa.py`: `DESC` ohne „Entwicklungsversion“.
   - `README.md`, `installieren.html`: Hinweis „Entwicklungsversion“ entfernen, Adressen `ringzeit-dev` → `ringzeit`.
   - `tests/training.test.mjs` (`RESUME_KEY`) und `tests/isolation.e2e.mjs`: Kennung anpassen. Den Isolationstest nur behalten, wenn Ringzeit Dev weiterläuft.
4. **Cache-Aufräumen anpassen, falls Ringzeit Dev weiterläuft:** Mit `APP_ID = "ringzeit"` heißt das Präfix `ringzeit-`. Das passt auch auf die Caches von Ringzeit Dev (`ringzeit-dev-…`). Sie würden beim Aufräumen gelöscht, und Ringzeit Dev wäre bis zum nächsten Online-Start nicht offline nutzbar. Das ist dasselbe „Cacheproblem der stabilen App“ wie heute. Abhilfe in `tools/build_pwa.py` (sw.js, activate): `k.startsWith(PREFIX) && !k.startsWith("ringzeit-dev-") && k !== CACHE`.
5. **Bauen und prüfen:** `python3 tools/build_pwa.py`, dann Suite, Baseline, `final-check.mjs`, `final-browser.cjs` (läuft gegen die Repo-Wurzel). Danach die Geräte-Checkliste (`docs/geraete-checkliste.md`) mit einer Kopie der echten Daten durchgehen.
6. **Veröffentlichen:** Hochladen ins stabile Repo, so wie bisher per Web-Upload. Die Nutzer bekommen die neue Version beim nächsten Start (die App-Seite wird zuerst aus dem Netz geladen) und sehen einmal „Was ist neu“.
7. **Nachsorge:** In den ersten Tagen Rückmeldungen sammeln (Feedback-Formular, Profil → App & Daten).

## 3b. Ergebnis des Altdaten-Tests (04.11.2026)

Getestet mit einer echten Sicherung der stabilen App (Export vom 04.11.2026; die Datei liegt nicht im Repo). Beide Wege
wurden geprüft: das Laden über `hydrate` im Testlauf und das Release-Szenario im Browser. Dort war ein Build mit
`APP_ID = "ringzeit"` eingestellt, die Daten lagen unter `ringzeit.v1`.

| Prüfung | Ergebnis |
|---|---|
| Profil (24 Felder: Disziplin, Level, Trainingstage, Minuten, Verein, Einschränkungen, Schwerpunkt-Block, Abzeichen, Rundentimer, Tagesform …) | unverändert übernommen |
| Hauptsport ohne Angabe | Kickboxen |
| Turniere (3, davon 2 mit Ergebnis und Notizen) | vollständig |
| Verlauf (3 Einträge) | vollständig, nichts doppelt; alte Übungsnummern → Text-IDs (z. B. 43 → Ausfallschritte, 23 → Unterarmstütz) |
| Wochenbelastung | KW 26.10. 576 (= 60 × 4 + 56 × 6), KW 02.11. 360 (= 60 × 6) |
| Einheiten (4) mit Haken, Sätzen und Runden | erhalten; die geplante Einheit vom 05.11. läuft im geführten Training vollständig durch |
| Fitnesstest, Level | übernommen; Kickboxen Level 2 bleibt; Boxen und Taekwondo brauchen einen eigenen Technikteil (so gewollt) |
| Verschiebungen und Ausfälle | erhalten |
| Schwerpunkt-Block Schnellkraft | läuft weiter (Woche 2) |
| Alle Seiten | ohne Fehler |
| Neue Sicherung → Rückladen | identisch |
| Release-Szenario im Browser | App startet mit den Daten, keine Inbetriebnahme, keine JS-Fehler, „Was ist neu“ erscheint einmal |

**Erledigt (Release-Paket 04.11.2026):** „Was ist neu“ ist neu geschrieben (Boxen, Taekwondo, Schwerpunkte je Sportart,
neues Profil), `NEWS_V` = 7. Das Cache-Aufräumen schont Ringzeit Dev (Schritt 4). Der Altdaten-Test wurde mit dem
Release-Stand als echtes Update wiederholt und bestanden, siehe [release.md](release.md) Abschnitt 6.

## 4. Rückweg

- **Code:** Das Komplett-ZIP aus Schritt 1 wieder hochladen. Der Service Worker der alten Version übernimmt beim nächsten Online-Start.
- **Daten:** Die neue Version speichert im Format v2 unter `ringzeit.v1`. Die alte Version liest dieses Format vielleicht **nicht vollständig** (das ist nicht geprüft). Deshalb nach einem Rückweg die Sicherung aus Schritt 1 einspielen. Was seit der Ablösung trainiert wurde, müsste man dann von Hand nachtragen.

## 5. Was mit Ringzeit Dev passiert

Es gibt zwei Möglichkeiten:
- **Weiterführen** als Entwicklungskopie für künftige Erweiterungen. Dann gilt Schritt 4.
- **Stilllegen:** Pages abschalten oder einen Hinweis „Bitte die stabile App nutzen“ veröffentlichen.

Daten in Ringzeit Dev (`ringzeit-dev.v1`) gehen nicht automatisch in die stabile App über. Wer Dev zum Training
genutzt hat, sichert dort vorher und trägt das Wichtigste nach. Ein Import über Kennungen hinweg ist nicht vorgesehen.
