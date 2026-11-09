# Ringzeit – Prüfung und Release 4 vom 09.11.2026

## Geprüfte Stände

- Dev: `dnsmaur1992/ringzeit-dev@3385b8b`. Alle 18 Dateien des vorherigen Abschlussbewertungs-Pakets
  sind bytegleich angekommen, einschließlich Root-HTML und Service Worker. 257 Tests und Baseline bestanden.
- Prod vorher: `dnsmaur1992/ringzeit@e23d121`. 241 Tests und bisherige Baseline bestanden.
  Es fehlen dort Technik/Fitness-Trennung und die neue gemeinsame Abschlusssteuerung.
- Release-Kandidat: Dev-Funktionen auf Prod-Kennung übernommen, mit aktuellem Update-Hinweis und
  schonender Aktualisierung alter unbegonnener Planvorschauen. Anleitung: `release.md`, Abschnitt 9.

## Umsetzung

Eine abschließende Pflichtbewertung mit fünf Emojis ersetzt die Zwischenfragen. Automatische Erhöhungen
bei sehr locker (+10 %) und locker (+5 %); optionale Anpassung bei fordernd (+5 %), hart (−5 %) und
am Limit (−10 %), sonst beibehalten. Die Schritte wirken über Pausen innerhalb derselben Trainingsgattung
und Sportart/Stil/Disziplin, getrennt nach körperlicher Ausgangsstufe. Faktor auf 0,8–1,2 begrenzt;
Schutzregeln und Periodisierung vorrangig. Keine pauschal behauptete physiologische Prozentsteigerung.

## Befund beim Prod-Übergang

Ein bereits gespeicherter alter Plan hätte keine neuen Dosierungs-Metadaten. Deshalb werden nur alte,
noch vollständig unbegonnene Vorschauen ab heute einmal neu erzeugt, mit ihrer gewählten Dauer,
Ausrüstung, Ort, Sport, Stil und Gattung. Ablaufposition, Satzdaten, Haken, Rundenfortschritt und
Wiederaufnahme-Snapshot schützen bestehende Einheiten vor dieser Neuberechnung. Historische Pläne bleiben.

## Nachweise

| Prüfung | Ergebnis |
|---|---|
| Prod-Release-Tests | 261 bestanden |
| Vergleichsbasis | 24 Profile × 9 Einheiten plus 2 Abläufe bestanden |
| Gegen vorherige Prod-Baseline | Neue Technik-/Fitness-/Steuerungs-Metadaten und 49 präzisierte Hinweistexte; keine sonstigen Übungs-/Dosierungsabweichungen bei identischen Ausgangseinstellungen |
| Vollständige Ablaufmatrix | 648 Einheiten, 0 Befunde |
| Zusatzprüfungen H1–H9 | bestanden, inklusive 216 Text-/Timer-Vergleiche |
| Vorherige Daten | Synthetische Fixtures erzeugt mit tatsächlichem vorherigem Prod-Code e23d121; Kickboxen, Boxen, WT, ITF |
| Datenerhalt | Profil, Verlauf, Tests, Gewicht, Turniere, Overrides, Fortschritt und erneutes Laden geprüft |
| Kennungen | Ringzeit / ringzeit.v1 / ringzeit.resume.v1; kein Wechsel auf Dev-Schlüssel |
| Cacheaktivierung | Alte Prod-Caches entfernt; Dev-/Fremdcaches und aktueller Prod-Cache bleiben (Simulation) |
| Build/Paket | Produktionsbuild, JavaScript-Syntax, nichtleere Austauschdateien und ZIP-Inhalte geprüft |

## Praktische Grenze

Keine neue Prüfung in einem echten Browser oder auf iPhone/Android durchgeführt. Tests verwenden
Produktionscode mit ersetzten Browser-Diensten; reale Offline-Aktualisierung, Darstellung, Ansagen und
Bildschirm-Wachhalten sind nach Upload manuell zu kontrollieren. Das Paket ist vorbereitet, nicht veröffentlicht.
Es gibt keine Garantie für Trainingswirkung; die vorhandenen Grenzen und vorsichtige Steuerung bleiben aktiv.
