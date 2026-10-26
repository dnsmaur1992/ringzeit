# Ringzeit – To-do-Liste: Bedienung und Akku

Stand: 26.10.2026. Offene Aufgaben aus der Prüfung des aktuellen Quellcodes und dem Durchgehen der veröffentlichten Anwendung im Browser. Die Bildschirmansichten wurden am Desktop geprüft; ein Energieverbrauch auf einem echten Handy wurde nicht gemessen. Die umgesetzten Punkte sind unten abgehakt. Der tatsächliche Energievergleich und die abschließende Tonprüfung auf echten Handys bleiben offen.

## Zuerst: Ablauf und verlässliche Eingaben

- [x] **P1 – Trainingsstart verständlich machen.** „Start“ öffnet aktuell den Hauptteil-Timer, obwohl Aufwärmen davorsteht. Beim Einstieg das Aufwärmen als ersten Schritt zeigen; den direkten Einstieg in den Hauptteil für erfahrene Nutzer weiterhin ermöglichen. Klar benennen, welchen Teil der Einheit der Timer abdeckt.
- [x] **P1 – Anstrengung bewusst auswählen und tatsächliche Dauer bestätigen.** Derzeit sind RPE 7 und die geplante Dauer vorbelegt. Unveränderte Vorgaben sollen nicht automatisch als bewusst erfasste Leistungsdaten gelten. Speichern soll bei vorzeitig beendetem Training weiterhin möglich sein.
- [x] **P1 – Laufende Timer beim endgültigen Abschluss beenden.** Nach bestätigtem Speichern einer Einheit Timer, ausstehende Ansagen, Audiowachhaltung und Bildschirm-Wachhaltung freigeben. Das bloße Schließen der Vollbildansicht darf das laufende Training weiterhin in der Übersicht fortsetzen.
- [x] **P1 – Nur einen Rundentimer gleichzeitig betreiben.** Der freie und der geführte Timer sollen sich nicht unbeabsichtigt überlagern. Beim Wechsel einen laufenden Timer gezielt pausieren oder den Wechsel bestätigen lassen. Das Schließen eines Timers darf die Bildschirm- oder Tonsteuerung eines anderen laufenden Timers nicht versehentlich verändern.

## Übersicht und Bedienbarkeit

- [x] **P2 – Einstellungen einer vorhandenen Einheit einklappbar machen.** Trainingsart, Dauer, Ort und Equipment unter „Einheit anpassen“ zusammenfassen. Die Übungen sollen ohne langes Scrollen erreichbar sein; beim erstmaligen Erstellen dürfen die Optionen direkt sichtbar bleiben.
- [x] **P2 – Informationen nach Wichtigkeit bündeln.** Tagesziel und wichtigste Anpassung zeigen; Einzelheiten zu Datengrundlage, Zyklus und Anpassungsgründen unter „Warum diese Einheit?“ aufklappbar machen. Sicherheitshinweise im passenden Kontext zugänglich halten.
- [x] **P2 – Abhaken und Erklärungen klar unterscheiden.** Sichtbare Hakenflächen und ein kurzer Hinweis „Nummer antippen zum Abhaken“. Übungsdetails über ein deutliches Info-Symbol öffnen. Aktuell öffnet ein antippbarer Übungstitel häufig eine Erklärung, während das Antippen anderer Zeilen abhakt.
- [x] **P2 – Fortschritt sichtbar machen und Symbolschalter benennen.** Zum Beispiel „8 von 20 Übungen erledigt“ sowie ein Sprung zur nächsten offenen Übung. Start, Pause, Fortsetzen und Richtungsschalter mit eindeutigen zugänglichen Namen versehen; großzügige Trefferflächen vorsehen.

## Akkuverbrauch senken

**Festgelegt:** Der Bildschirm bleibt während laufender Runden und Pausen bewusst an. Die restliche Runden- und Pausenzeit muss jederzeit sichtbar und gut lesbar sein. Bildschirm-Wachhaltung und Lesbarkeit werden für die Akkuoptimierung beibehalten.

- [x] **P1 – Bildschirm-Wachhaltung zuverlässig an den Timer koppeln.** Während laufender Runden und Pausen bleibt sie aktiv. Nach endgültigem Abschluss oder bewusstem Stoppen nicht mehr benötigte Ressourcen freigeben. Bildschirm und Ton intern getrennt steuern, damit eine Audiooptimierung die sichtbare Zeitanzeige nicht beeinträchtigt.
- [x] **Festgelegt: Animationen erhalten.** Die saisonalen Effekte, bewegten Skizzen, Pulse und sonstigen Animationen bleiben unverändert. Kein visueller Sparmodus.

- [x] **P2 – Audiowachhaltung gezielt prüfen.** Im Code läuft während des Timers ein nahezu unhörbarer Dauerton, damit Signale zuverlässig beginnen. Prüfen, wo er nötig ist und wo Audio zwischen Signalen ruhen kann. Nach Pause oder Ende Ressourcen freigeben. Änderungen mit Glocke, Ansagen und eigener Musik auf iPhone und Android gegenprüfen.
- [x] **P3 – Timerprüfungen und verdeckte Anzeigeaktualisierungen reduzieren.** Der freie Timer prüft alle 200 ms, obwohl er nur bei geänderter Restsekunde die Anzeige aktualisiert. Prüfung und Anzeige an tatsächliche Zeitgrenzen koppeln; untätige Timer nicht dauerhaft abfragen. Nur die sichtbare Ansicht aktualisieren. Vergangene Zeit weiterhin aus realen Zeitpunkten berechnen, statt Genauigkeit von der Aufrufhäufigkeit abhängig zu machen.
- [ ] **P1 – Energievergleich auf dem Handy durchführen.** Gleich lange Trainingsläufe bei gleicher Helligkeit, Lautstärke und Ausgangslage vergleichen: normaler Modus, reduzierte Animationen, optimierte Hintergrund- und Audiosteuerung bei weiterhin eingeschaltetem Bildschirm. Neben dem Akku auch Signale, Rundenwechsel und Verhalten nach Appwechsel oder Sperren prüfen. Einsparungen erst nach Messung beziffern.

## Weitere bereits bekannte Aufgaben der Trainingssteuerung

- [x] Feste Grundübungen über einen Trainingsblock ermöglichen, damit genügend vergleichbare Kraftprotokolle entstehen.
- [x] Kraftleistungen nach der für die konkrete Übung relevanten Ausrüstung vergleichen; zusätzlich ausgewähltes, unbenutztes Equipment soll den Vergleich nicht unnötig verhindern.
- [x] Eine freiwillige Rückmeldung zur Schwierigkeit einzelner Kraftübungen prüfen, zusätzlich zur Gesamtanstrengung der Einheit.

## Verifikation

Automatisierte Prüfungen umfassen die Trainingszyklen über 20 und 40 Wochen, bestätigte Abschlussangaben, Pausieren und Timerwechsel, Nachholen verstrichener Phasen, späte Wake-Lock-Antworten, schlafende Audiokontexte und kompatible alte Sicherungen. Eine ergänzende DOM-Prüfung kontrolliert die Einheitenansicht einschließlich Haken, aufklappbarer Optionen und Abschlussrückfrage. Eine abschließende Bild-/Ton- und Akkuprüfung auf dem echten Handy steht noch aus.

## Abnahmekriterien

- Bestehende Daten und Sicherungen bleiben lesbar; die bisherigen Haken und Protokolle bleiben erhalten.
- Abgebrochene oder vorzeitig beendete Einheiten zählen weiterhin zur tatsächlich angegebenen Belastung.
- Zurückgehen aus dem Vollbild bedeutet nicht automatisch Training abbrechen.
- Nach einem bestätigten Abschluss laufen weder Timer noch nicht mehr benötigte Ton-/Bildschirmfunktionen weiter.
- Die Animationen bleiben erhalten. Bildschirm-Wachhaltung, gut lesbare Restzeit, verlässliche Zeiterfassung und deutlich erkennbare Trainingszustände bleiben während laufender Runden und Pausen erhalten.
