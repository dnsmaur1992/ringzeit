# Prod-Korrektur: Winter-Arc-Mobility (09.11.2026)

Basis: `dnsmaur1992/ringzeit@f0048fd` (Release 4). Dieses Paket enthält nur Austauschdateien
für die stabile App. Gleiche Ordnerpfade verwenden, nichts löschen. `index.html` und `sw.js` in
der Repository-Wurzel gemeinsam mit Quelle, Tests und Dokumentation ersetzen.

## Behobene Punkte

1. Winter-Arc-Mobility zeigt die vorhandene Skizze der aktuellen Übung, dynamisch oder als Halteposition.
   Es wird derselbe SVG-Renderer wie im regulären Training verwendet. Die Größe bleibt auf 320 px begrenzt.
2. Für Zeitlupen-Kicks fehlte bisher die Skizze: Knie anziehen / kontrolliert strecken, langsamer Zyklus.
   Die Darstellung ist schematisch; der Übungstext beschreibt weiterhin die auszuführenden Kicks.
3. In der Mobility-Pause steht die angezeigte Restzeit still, statt wieder die volle Phasendauer anzuzeigen.
   Auch nach erneutem Rendern/Seitenwechsel kommt die Anzeige aus derselben Uhr wie der Ablauf.
   Die Skizzenanimation pausiert in dieser Ansicht mit dem Training.
4. Die kleine Übungsskizze im Rundentimer verwendete in der Arbeitsphase versehentlich den deutschen
   Namen statt der stabilen Übungs-ID. Sie erscheint jetzt wie zuvor schon in der Pausenvorschau.

## Handprüfung nach Upload

- Nach der Pages-Veröffentlichung App online schließen und neu öffnen; notfalls noch einmal neu starten.
- Winter Arc → Mobility öffnen: Vorschau ansehen und starten. Aktuelle Übung hat eine passende Skizze.
- Dynamische Übung bewegt sich; Halteübung darf statisch sein und zeigt „Halten“ / „Hold“.
- Eine Zeitübung einige Sekunden laufen lassen, pausieren, warten, fortsetzen:
  Restzeit bleibt in der Pause gleich und läuft anschließend von dort weiter.
- Seitenwechsel und nächste Übung prüfen. Bei Wiederholungen bleibt „Weiter“ manuell bedienbar.
- Früh abbrechen: kein automatischer Mobility-Haken. Bis zum Ende durchführen: Haken wie bisher.
- Falls die Folge Zeitlupen-Kicks enthält, ist die Illustration langsamer als die übrigen dynamischen Skizzen.
- In einer Konditionsrunde mit Übungsskizze zeigt auch die Arbeitsphase die kleine Skizze.
- Auf dem Handy prüfen, dass die Schaltflächen erreichbar bleiben (bei kleiner Höhe scrollen).

## Prüfung im Code

264 Tests einschließlich neuer Regressionsfälle sowie Kickbox-Baseline. Ablaufmatrix mit 216 Einheiten
und H1–H9. Die neuen Tests prüfen Skizzenabdeckung im Mobility-/Cool-down-Katalog, Wiedergabe je Sport/Stil
und Sprache, echte Restzeit nach Pause/Fortsetzen und die kompakte Rundentimer-Skizze.
Produktionsbuild und ZIP werden vor Ausgabe geprüft. Keine neue echte Browser-/Geräteabnahme.
