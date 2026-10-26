# Trainingsablauf und Progression

## Abhaken und Abschließen

Jede Übung ohne Satzprotokoll lässt sich am Nummernknopf oder durch Antippen der Zeile abhaken. Das gilt auch für Aufwärmen, Cool-down, Abhärtung, Laufabschnitte und Prüfungsübungen. Kraftübungen sind erledigt, wenn alle vorgesehenen Sätze einen Wiederholungs- oder Sekundenwert haben. Ein eingetragener Wert zählt wie bisher als erledigt; ob das Leistungsziel erreicht wurde, wird getrennt ausgewertet.

Die Runden werden erst nach tatsächlich abgelaufener Arbeitszeit automatisch abgehakt. Überspringen setzt keinen Haken. Manuelles An- und Abhaken ist ebenfalls möglich; ein Timer-Neustart setzt die Rundenhaken zurück. Haken, Eingaben und die bisherigen `rdone`-Werte werden beim Laden alter Sicherungen weiter berücksichtigt.

Bei offenen Übungen fragt die App vor dem Speichern nach. Auch vorzeitig beendete Einheiten zählen mit ihrer eingegebenen Dauer und Anstrengung zur Belastung und zum Verlauf. Sie gelten jedoch nicht als vollständig bewältigt und lösen keine Steigerung aus. Neue Rundenzähler zählen erledigte Runden; die geplante Zahl bleibt separat gespeichert.

## Automatischer Timer

Nach einmaligem Start: 10 Sekunden Vorlauf → Arbeit → Pause → nächste Arbeitsrunde. Nach der letzten Arbeitsrunde endet der Timer. Pause/Fortsetzen, Zurücksetzen und manuelles Wechseln bleiben möglich. Der automatische Übergang nutzt denselben Timerzustand in der Listen- und Vollbildansicht. Die nächste Übung wird gegen Ende der Pause angekündigt, soweit Sprachausgabe verfügbar und aktiviert ist.

Vergangene Zeit beim Wechseln oder Sperren des Bildschirms wird beim nächsten Timer-Tick nachgeholt, ohne alte Tonsignale abzuspielen. Die tatsächliche Ton- und Hintergrundausführung hängt weiterhin vom Browser und Betriebssystem ab.

## Zyklen und Entscheidungen

Im Grundlagenmodus bestehen die Zyklen aus fünf Kalenderwochen ab der ersten Planwoche: vier Aufbauwochen, danach die bestehende Entlastung. Die Wochenwelle verändert die Pausendichte mit den Faktoren 0,90 / 0,95 / 1,00 / 1,05. Bestehende Schwerpunkt-Blöcke behalten ihre sechs Wochen und ihre eigenen Stufen; sie erhalten keine zusätzliche Wochenwelle.

Die App vergleicht abgeschlossene Zyklen getrennt nach Disziplin, Level und Trainingsart. Eine Steigerung braucht mindestens zwei vollständig bewältigte Einheiten an verschiedenen Tagen, mindestens 80 % der protokollierten vergleichbaren Einheiten müssen erfolgreich sein. Eine erfolgreiche Einheit dauert mindestens 80 % ihrer geplanten Dauer und liegt bei der Anstrengung höchstens am oberen Zielwert. Nach mehr als 42 Tagen ohne vergleichbare Leistung wird nicht erhöht. Kalenderzeit allein erzeugt keinen Fortschritt.

- Gut bewältigt: Ausgangsstufe um einen Schritt erhöhen.
- Zweimal mindestens zwei RPE-Punkte über dem oberen Ziel: Ausgangsstufe um einen Schritt senken.
- Zu wenig Daten oder unvollständige Bewältigung: bisherige Stufe beibehalten.

Alte Protokolle ohne neue Leistungs- und Abschlussinformationen werden nicht nachträglich als erfolgreich eingestuft. Einträge aus dem laufenden Zyklus erhöhen dessen eigene Stufe nicht. Doppelte Einträge desselben Tages zählen nicht mehrfach.

## Technik und Kondition

Ein Schritt entspricht 5 % höherer **Pausendichte**: Die ursprüngliche Pause wird durch den Stufenfaktor geteilt. Das ist ausdrücklich keine Behauptung einer gleich großen Steigerung der gesamten Trainingsbelastung. Der Faktor ist zwischen 0,90 und 1,20 begrenzt; Pausen werden niemals kürzer als 30 Sekunden. Bei längeren Pausen wird die Rundenzahl nötigenfalls reduziert, damit Arbeitszeit plus Pausen in das bestehende Zeitbudget passen. Arbeitsrunden, Kontaktintensität und offizielle Wettkampfformate werden durch diese Progression nicht erhöht.

## Kraftziele

Geeignete protokollierte Kraftübungen erhalten individuelle Zielvorschläge. Verglichen werden dieselbe Übung, Ausrüstung, Trainingsort, Trainingsart, Satzanzahl und Wiederholungs-/Haltezeitspanne. Zirkel, explosive Übungen und besondere Dosierungen behalten ihre eigenen Vorgaben.

Ein neuer Zielwert setzt mindestens zwei vergleichbare, erfolgreiche Protokolle aus einem abgeschlossenen Zyklus voraus. Pro Zyklus steigt nur eine Größe: eine Wiederholung bzw. fünf Sekunden bis zum oberen Bereichsende; danach bei Gewichtsübungen 2,5 % Gewicht, auf 0,1 kg abgerundet. Geeignete Geräteabstufungen wählt der Nutzer. Ein Startgewicht wird niemals erfunden. Das Gewicht muss zuvor für alle vorgesehenen Sätze tatsächlich eingetragen worden sein.

Im Grundlagenmodus steigt der Wiederholungs-/Haltezeitvorschlag während der Aufbauwochen, innerhalb der bestehenden Bereichsgrenzen. Der Ausgangswert wird separat behalten, sodass eine Belastungsspitze nicht direkt zum nächsten Einstiegsziel wird. Bei wiederholter Überforderung reduziert sich der Vorschlag um eine Wiederholung bzw. fünf Sekunden oder 5 % Gewicht. Tatsächliche Eingaben bleiben immer leer, bis der Nutzer sie einträgt.

## Vorrang bestehender Anpassungen

Keine zusätzliche Progression bei Kindern/Jugendlichen, Sparring, Mobility, Läufen, Wettkampf- oder Prüfungsvorbereitung, Erholung nach Wettkampf, Entlastungswochen, Wiedereinstieg, K.o.-Sperre, Fasten, stressiger Woche oder eingeschränkter Tagesform. Körperliche Arbeit verhindert zusätzlich die Kraftsteigerung. Die vorhandenen Anpassungen bleiben zuständig; bereits erreichte Stufen werden dadurch nicht gelöscht.

Alle neuen Felder liegen optional in den vorhandenen Einheiten und Protokollen. Der Speicherschlüssel bleibt unverändert. Export und Import behalten diese Felder mit bei; alte Sicherungen bleiben lesbar.

## Prüfen

`node --test tests/training.test.mjs` prüft den Produktionscode einschließlich Timerübergängen, übersprungenen Runden, Abschlussrückfrage, Speicherung, alten Sicherungen, Progression und geschützten Trainingsphasen. Browserdienste werden dabei simuliert. Tonsignale, Sprachausgabe, Musik und Wake Lock zusätzlich auf echten Geräten testen.
