# Trainingsablauf und Progression

## Abhaken und Abschließen

Jede Übung ohne Satzprotokoll lässt sich am Nummernknopf oder durch Antippen der Zeile abhaken. Das gilt auch für Aufwärmen, Cool-down, Abhärtung, Laufabschnitte und Prüfungsübungen. Kraftübungen sind erledigt, wenn alle vorgesehenen Sätze einen Wiederholungs- oder Sekundenwert haben. Ein eingetragener Wert zählt wie bisher als erledigt; ob das Leistungsziel erreicht wurde, wird getrennt ausgewertet.

Die Runden werden erst nach tatsächlich abgelaufener Arbeitszeit automatisch abgehakt. Überspringen setzt keinen Haken. Manuelles An- und Abhaken ist ebenfalls möglich; ein Timer-Neustart setzt die Rundenhaken zurück. Haken, Eingaben und die bisherigen `rdone`-Werte werden beim Laden alter Sicherungen weiter berücksichtigt.

Bei offenen Übungen fragt die App vor dem Speichern nach. Auch vorzeitig beendete Einheiten zählen mit ihrer eingegebenen Dauer und Anstrengung zur Belastung und zum Verlauf. Sie gelten jedoch nicht als vollständig bewältigt und lösen keine Steigerung aus. Neue Rundenzähler zählen erledigte Runden; die geplante Zahl bleibt separat gespeichert.

Der Tagesplan ist vor dem Trainingsstart eine reine Vorschau: Übungen, Dosierungen und Ausrüstung sind sichtbar, aber keine Haken, Satz-Eingaben, Abschlussfelder oder bedienbaren Trainings-Timer. Planungseinstellungen bleiben unter „Einheit anpassen“ erreichbar. „Training beginnen“ steht oben in der Einheit und noch einmal nach dem vollständigen Plan, damit niemand erst durch den ganzen Plan scrollen muss. Danach läuft die Einheit als Vollbild-Ablauf Schritt für Schritt (siehe „Trainingsführung“). Position und Abschnitt werden als `session.flow.step` und `session.flow.block` mit dem Startzeitpunkt gespeichert und nach Schließen/Neuladen wieder aufgenommen. Vorhandene Haken und Protokolle bleiben erhalten. Zurückgehen, Überspringen oder vorzeitiger Abschluss erzeugen keine erledigten Übungen; beim Speichern bleibt die Rückfrage für offene Inhalte erhalten.

Zeitbasierte Übungen haben eigene Timer. Eine einzelne Zeitübung zeigt während der Messung „Läuft“, Intervalle zeigen „Arbeit“ und „Pause“. Aufwärmzeiten entsprechen den angezeigten Minuten. Fixe Dehnzeiten gelten pro angegebener Seite, mit fünf Sekunden Wechselzeit zwischen den Seiten; bei Zeitspannen wird die gewählte Dauer angezeigt. Konditionsintervalle unterscheiden Arbeit und Pause, bei Zirkeln wird ein vollständig durchlaufener Übungstimer als ein Durchgang gezählt. Zeitbasierte Kraftübungen können pro Satz gemessen werden: Erst nach dessen vollständigem Ablauf wird die tatsächliche Haltezeit in genau diesem Satz gespeichert; vorhandene Eingaben werden nicht überschrieben. Eine gesonderte Satzpause erledigt keine Übung. Bei reinen Wiederholungs- oder Distanzvorgaben werden keine Arbeitszeiten erfunden. In Mobilitätsabschnitten kann die bereits im Plan angegebene ungefähre Gesamtzeit einer Übung als Zeitrahmen laufen; explizite Haltezeiten haben Vorrang. Wechselzeiten von fünf Sekunden (beziehungsweise drei Sekunden für kurze Wiederholungs-Halteübungen) sind eigene Übergangsphasen und keine zusätzliche Belastungszeit.

Laufende Übungstimer sind in der aktuellen App-Sitzung pausierbar und fortsetzbar. Nach einem Neuladen werden abgeschlossene Inhalte und der Abschnitt wiederhergestellt; eine zuvor unvollständige Zeitmessung muss neu gestartet werden. Fehlende Zeit wird nicht als absolvierte Leistung angenommen.

Zum Speichern muss die Anstrengung bewusst von 1 bis 10 ausgewählt werden. Die geplante Dauer ist vorgeschlagen und gilt als tatsächliche Zeit, solange sie nicht geändert wird; ein zusätzliches Bestätigungshäkchen gibt es nicht mehr. Beim Speichern wird nur geprüft, ob 1 bis 300 Minuten eingetragen sind. Sind noch Übungen offen, nennt die Rückfrage die eingetragene Dauer, falls sie unverändert ist, und empfiehlt, sie bei vorzeitigem Ende vorher anzupassen. Unvollständige Einheiten können danach weiterhin gespeichert werden. Abschlussentwürfe bleiben bei Änderungen der Ansicht erhalten, bis eine andere Einheit gewählt oder die Seite neu geladen wird.

Neue Protokolle tragen `inputConfirmed: true`. Ältere Einträge ohne diese Bestätigung bleiben im Verlauf und in der Belastungsberechnung erhalten, gelten aber nicht als bewusst bestätigte neue Progressionsdaten.

## Trainingsführung

Nach „Training beginnen“ zeigt ein Vollbild immer nur den aktuellen Schritt. Die Schritte ergeben sich aus dem Plan:

- **Zeitübung** (Aufwärmen, Dehnen, Intervalle, Abhärtung, Zeit-Kraftübungen ohne Satzprotokoll): 10 Sekunden „Bereit machen“ mit Ansage von Übung und Dosierung, dann der Timer mit Gong bei jedem Phasenwechsel und am Ende. Danach startet der nächste Schritt von selbst; ist er wieder eine Zeitübung, beginnt erneut die Vorbereitung. Zehn Sekunden vor dem Ende wird ein folgender Schritt ohne Timer angesagt.
- **Übung ohne feste Zeit** (Wiederholungen, Strecken, Gelenkkreise): großer ✓-Knopf. Es wird keine Zeit erfunden.
- **Kraftübung mit Satzprotokoll**: Karte mit Ziel und darunter die Satz-Tabelle auf demselben Bildschirm. Werte werden von Hand eingetragen; ✓ ohne Eintrag fordert zur Eingabe auf, nach einem eingetragenen Satz startet ✓ die Satzpause (60 s, Gong), nach dem letzten Satz geht es weiter. Unter dem Pausenring lässt sich die Satzpause anhalten und fortsetzen. Alle anderen Timer (Zeitübungen, Halteübungen, Zirkelpausen, Runden) halten und starten über den großen Mittelknopf. Zeitbasierte Kraftübungen (z. B. Unterarmstütz) laufen wie Runden: ▶ startet 10 Sekunden Vorbereitung, dann Halten → 60 s Pause → nächster Satz, jeweils mit Gong; nach dem letzten Satz geht es von selbst weiter. Jeder vollständig gehaltene Satz trägt seine Sekunden ein, vorhandene Einträge bleiben unverändert und lassen sich ändern.
- **Zirkel**: Durchgang für Durchgang; die Karte listet alle Übungen des Durchgangs, die aktuelle hervorgehoben. Zwischen den Durchgängen läuft eine Pause von 90 Sekunden. Bei Kraftübungen im Zirkel wird nur der Satz dieses Durchgangs eingetragen.
- **Runden**: der bestehende Rundentimer im Vollbild; nach der letzten Runde führt „Weiter“ zum nächsten Schritt.
- **Abschluss**: Dauer, Anstrengung und Notiz wie bisher.

**10-Sekunden-Hinweis:** In jeder Arbeits- oder Pausenphase ab 20 Sekunden (auch in der Satzpause nach ✓) gibt es 10 Sekunden vor dem Ende einen kurzen Ton und eine Ansage – in der Arbeit „Noch 10 Sekunden“, in der Pause zusätzlich, was als Nächstes kommt. Vor jedem Start sagt die 10-Sekunden-Vorbereitung die Übung an.

**Ton am iPhone:** Gong und Ansagen sind stumm, solange der Schalter an der Seite auf lautlos steht (bei neueren Modellen: Stummmodus im Kontrollzentrum). Auf Android ist die Medienlautstärke getrennt vom Klingelton und oft niedrig. Auf beiden Systemen weisen ein Hinweis zu Beginn der Trainingsführung (bis „Ton ist an“ getippt wird) und eine Zeile in der Planvorschau darauf hin.

Zurück, Weiter und „Vorzeitig abschließen“ sind immer erreichbar; Überspringen setzt keinen Haken. Die bisherige Abschnittsübersicht mit allen Übungen liegt unter ☰; der Wechsel zur Übersicht und zurück lässt laufende Timer weiterlaufen. Erledigt ist ein Schritt, wenn sein Timer vollständig abgelaufen ist, ✓ getippt wurde oder alle Sätze eingetragen sind.

## Automatischer Timer

Nach einmaligem Start: 10 Sekunden Vorlauf → Arbeit → Pause → nächste Arbeitsrunde. Nach der letzten Arbeitsrunde endet der Timer. Pause/Fortsetzen, Zurücksetzen und manuelles Wechseln bleiben möglich. Der automatische Übergang nutzt denselben Timerzustand in der Listen- und Vollbildansicht. Die nächste Übung wird gegen Ende der Pause angekündigt, soweit Sprachausgabe verfügbar und aktiviert ist.

Runden-, Übungs- und freier Timer verwenden einen gemeinsamen, an der nächsten Restsekunde ausgerichteten Zeitgeber. Im Leerlauf oder nach einer Pause läuft keine permanente Timerabfrage. Der Wechsel zum anderen Timer pausiert den bisher laufenden Timer. Das Schließen des Runden-Vollbilds zeigt die Abschnittsübersicht und lässt die Runde dort fortsetzen. Das Schließen der gesamten Trainingsführung zur Planvorschau pausiert laufende Trainings-Timer. Beim Wechsel in einen anderen Abschnitt wird ebenfalls pausiert. Der bestätigte Einheitsabschluss stoppt dagegen Timer, ausstehende Ansagen und nicht mehr benötigte Bildschirm-/Audiofunktionen.

Der freie Timer holt nach Verzögerungen alle verstrichenen Phasen anhand der tatsächlichen Zeitpunkte nach. Ausgelassene Tonsignale werden dabei nicht nachträglich abgespielt. Bei manueller Rundenüberspringung wird die übersprungene Runde nicht als vollständig absolviert gezählt.

Vergangene Zeit beim Wechseln oder Sperren des Bildschirms wird beim nächsten Timer-Tick nachgeholt, ohne alte Tonsignale abzuspielen. Die tatsächliche Ton- und Hintergrundausführung hängt weiterhin vom Browser und Betriebssystem ab.

## Zyklen und Entscheidungen

Im Grundlagenmodus bestehen die Zyklen aus fünf Kalenderwochen ab der ersten Planwoche: vier Aufbauwochen, danach die bestehende Entlastung. Mit ausreichender Datengrundlage verändert die Wochenwelle die Pausendichte mit den Faktoren 0,90 / 0,95 / 1,00 / 1,05. Solange Daten fehlen, bleibt sie bei einem vorsichtigen Faktor von 0,90. Bestehende Schwerpunkt-Blöcke behalten ihre sechs Wochen und ihre eigenen Stufen; sie erhalten keine zusätzliche Wochenwelle.

Die App vergleicht abgeschlossene Zyklen getrennt nach Disziplin, Level und Trainingsart. Sie berücksichtigt höchstens zwölf Wochen vergleichbarer, abgeschlossener Zyklen. Die Datengrundlage steht in der Einheit unter „Warum diese Einheit?“:

- **Im Aufbau:** Weniger als vier vollständig dokumentierte Einheiten, weniger als drei erfasste Trainingswochen oder lückenhafte Plan-/Leistungsangaben. Keine automatische Steigerung.
- **Ausreichend:** Mindestens vier dokumentierte Einheiten in mindestens drei unterschiedlichen Wochen. Mindestens 80 % der Einträge müssen die nötigen Angaben und einen gespeicherten Plan enthalten; mindestens 80 % der geplanten Gelegenheiten müssen gültig protokolliert sein.
- **Gut belegt:** Mindestens acht dokumentierte Einheiten in mindestens vier Wochen, mit mindestens 90 % vollständigen Angaben, bekannten Planinformationen und erfassten geplanten Gelegenheiten. Eine größere Datenmenge vergrößert den Steigerungsschritt nicht.

Dauer, empfundene Anstrengung, Abschlussstatus und geplante Dauer müssen bekannt sein; beim Krafttraining werden auch tatsächlich ausgefüllte Sätze und bei Gewichtsübungen Gewichte benötigt. Der Plan wird bei der Erstellung der Einheit als Datumsübersicht gespeichert. So werden später geänderte Profiltage nicht rückwirkend als damaliger Plan ausgegeben. Nicht protokollierte geplante Tage und ausdrücklich übersprungene Einheiten verbessern die Erfassungsquote nicht. Bekannte Pausen und verschobene Ausgangstermine zählen nicht als offene Gelegenheiten.

Für eine Steigerung muss auch der jüngste abgeschlossene Zyklus mindestens 80 % Planabdeckung haben. Mindestens drei seiner Einheiten müssen vollständig bewältigt und mindestens 80 % seiner vergleichbaren Einträge erfolgreich sein. Eine erfolgreiche Einheit dauert mindestens 80 % ihrer geplanten Dauer und liegt bei der Anstrengung höchstens am oberen Zielwert. Nach mehr als 42 Tagen ohne vergleichbare Leistung wird die Datenbasis wieder als im Aufbau behandelt. Bei acht oder mehr Einträgen wird zusätzlich geprüft, ob die letzten vier relativ zu ihrem Ziel deutlich anstrengender wurden als die vorherigen vier; ein Anstieg um mehr als einen RPE-Punkt verhindert eine Steigerung.

Diese Grenzwerte sind transparente Planungsregeln der App, keine sportwissenschaftlich validierte Leistungsdiagnostik. Kalenderzeit oder die Zahl der Einträge allein erzeugen keinen Fortschritt.

- Gut bewältigt: Ausgangsstufe um einen Schritt erhöhen.
- Zweimal mindestens zwei RPE-Punkte über dem oberen Ziel: Ausgangsstufe um einen Schritt senken.
- Zu wenig Daten oder unvollständige Bewältigung: bisherige Stufe beibehalten.

Alte Protokolle ohne neue Leistungs-, Abschluss- oder Planinformationen bleiben erhalten, gelten aber nicht automatisch als ausreichende Datengrundlage für eine Steigerung. Einträge aus dem laufenden Zyklus erhöhen dessen eigene Stufe nicht. Doppelte Einträge desselben Tages zählen nicht mehrfach.

## Technik und Kondition

Ein Schritt entspricht 5 % höherer **Pausendichte**: Die ursprüngliche Pause wird durch den Stufenfaktor geteilt. Das ist ausdrücklich keine Behauptung einer gleich großen Steigerung der gesamten Trainingsbelastung. Der Faktor ist zwischen 0,90 und 1,20 begrenzt; Pausen werden niemals kürzer als 30 Sekunden. Bei längeren Pausen wird die Rundenzahl nötigenfalls reduziert, damit Arbeitszeit plus Pausen in das bestehende Zeitbudget passen. Arbeitsrunden, Kontaktintensität und offizielle Wettkampfformate werden durch diese Progression nicht erhöht.

## Kraftziele

Geeignete protokollierte Kraftübungen erhalten individuelle Zielvorschläge. Verglichen werden dieselbe Übung, die dafür relevante Ausrüstung, Trainingsort, Trainingsart, Satzanzahl und Wiederholungs-/Haltezeitspanne. Zusätzlich ausgewähltes, unbenutztes Equipment wird aus dem Vergleichsschlüssel entfernt; entsprechende alte Vergleichsschlüssel werden beim Lesen normalisiert. Zirkel, explosive Übungen und besondere Dosierungen behalten ihre eigenen Vorgaben.

Im Kraft-Hauptteil werden geeignete Grundbewegungen wiederkehrend ausgewählt: eine verfügbare Beinübung, eine Druckübung und eine Zugübung beziehungsweise eine geeignete Rumpfübung als Ersatz. Verfügbarkeit, Einschränkungen, Alter und Level werden weiterhin geprüft. Weitere Plätze bleiben variabel. Die Auswahl bleibt bei vergleichbaren Rahmenbedingungen wiederkehrend, damit Protokolle entstehen können.

Bei protokollierten Kraftübungen kann freiwillig „Leicht“, „Passend“ oder „Zu schwer“ angegeben und durch erneutes Antippen wieder entfernt werden. Zweimal „Zu schwer“ bei vergleichbaren Vorgaben führt bei der nächsten Zyklusbewertung zu einer Reduktion des Übungsziels, auch wenn die Gesamtanstrengung der Einheit passend war. Als „Zu schwer“ markierte Übungsleistungen rechtfertigen keine Steigerung.

Ein höherer Zielwert setzt mindestens vier vergleichbare Protokolle derselben Übung aus einem abgeschlossenen Zyklus voraus, von denen mindestens 80 % das Ziel erreicht haben müssen. Die Übung muss über mindestens drei unterschiedliche Wochen dokumentiert worden sein. Viele Technik-Einheiten ersetzen diese übungsbezogenen Kraftdaten nicht. Pro Zyklus steigt nur eine Größe: eine Wiederholung bzw. fünf Sekunden bis zum oberen Bereichsende; danach bei Gewichtsübungen 2,5 % Gewicht, auf 0,1 kg abgerundet. Geeignete Geräteabstufungen wählt der Nutzer. Ein Startgewicht wird niemals erfunden. Das Gewicht muss zuvor für alle vorgesehenen Sätze tatsächlich eingetragen worden sein.

Mit ausreichenden Daten zur jeweiligen Übung steigt im Grundlagenmodus der Wiederholungs-/Haltezeitvorschlag während der Aufbauwochen, innerhalb der bestehenden Bereichsgrenzen. Der Ausgangswert wird separat behalten, sodass eine Belastungsspitze nicht direkt zum nächsten Einstiegsziel wird. Bei wiederholter Überforderung reduziert sich der Vorschlag um eine Wiederholung bzw. fünf Sekunden oder 5 % Gewicht. Leere Satzfelder zeigen das Ziel als blassen, kursiven Hinweis („Ziel 8“), damit es nicht wie ein eingetragener Wert aussieht. Tatsächliche Eingaben bleiben leer, bis der Nutzer sie einträgt oder ein vollständig abgelaufener Kraftsatz-Timer dessen Haltezeit gemessen hat.

## Hinweis beim Einstieg

Ein kurzer Hinweis erklärt einmalig in der ersten geöffneten Einheit, warum regelmäßige Einträge die Anpassung verbessern – egal ob die Einrichtung abgeschlossen oder übersprungen wurde. In der Einrichtung selbst erscheint er nicht mehr, damit der erste Start kurz bleibt. „Verstanden“ blendet ihn dauerhaft aus; die Entscheidung bleibt auch in Sicherungen erhalten.

## Vorrang bestehender Anpassungen

Keine zusätzliche Progression bei Kindern/Jugendlichen, Sparring, Mobility, Läufen, Wettkampf- oder Prüfungsvorbereitung, Erholung nach Wettkampf, Entlastungswochen, Wiedereinstieg, K.o.-Sperre, Fasten, stressiger Woche oder eingeschränkter Tagesform. Körperliche Arbeit verhindert zusätzlich die Kraftsteigerung. Die vorhandenen Anpassungen bleiben zuständig; bereits erreichte Stufen werden dadurch nicht gelöscht.

Alle neuen Felder liegen optional in den vorhandenen Einheiten und Protokollen. Der Speicherschlüssel bleibt unverändert. Export und Import behalten diese Felder mit bei; alte Sicherungen bleiben lesbar.

## Bildschirm, Animationen und Audio

Der Bildschirm bleibt während laufender Arbeits- und Pausenphasen bewusst an. Im Runden-Vollbild bleiben Start, Zurück und Weiter immer am unteren Rand sichtbar, auch bei langen Übungstexten oder kleinen Bildschirmen; der Ring wird auf niedrigen Bildschirmen kleiner. Die vorhandenen Animationen und Übungsskizzen sind unverändert. Verdeckte Anzeigen werden nicht sekündlich neu geschrieben. Eine verspätet bewilligte Bildschirm-Wachhaltung wird wieder freigegeben, falls der Timer inzwischen beendet wurde.

Auf erkannten Apple-Mobilgeräten beziehungsweise mit entsprechender Audio-Session-Unterstützung bleibt die bisherige nahezu unhörbare Audiowachhaltung während aktiver Timer erhalten. Andere Audiokontexte dürfen nach fünf Sekunden ohne neue Ausgabe ruhen; vor einer nächsten Web-Audio-Ausgabe werden sie wieder aktiviert. Nach dem Stoppen werden der Dauerton und seine Verbindungen beendet; eine letzte Glocke kann ausklingen. Auf dem Gerät müssen Glocke, Ansagen, Musik und Unterbrechungen zusätzlich praktisch geprüft werden.

## Akkuverbrauch auf dem Handy – geprüft

Praxiswert vom 27.10.2026: 1 Stunde Training auf dem iPhone, Bildschirm dauerhaft an, parallel Spotify-Musik und eine zweite App → 10 % Akku. Den größten Teil davon verbrauchen Bildschirm und Musik; der Anteil von Ringzeit ist gering. Der Code vermeidet weiterhin unnötige Dauerabfragen und räumt Ressourcen auf. Offen bleibt nur die Tonprüfung (Gong, Ansagen, Musik) auf weiteren Geräten, vor allem Android.

## Prüfen

`node --test tests/training.test.mjs` prüft den Produktionscode einschließlich Timerübergängen, übersprungenen Runden, Abschlussrückfrage, Speicherung, alten Sicherungen, Progression und geschützten Trainingsphasen. Browserdienste werden dabei simuliert. Tonsignale, Sprachausgabe, Musik und Wake Lock zusätzlich auf echten Geräten testen.

Die ergänzenden Tests prüfen außerdem die reine Vorschau, Abschnittsfortsetzung, Zeitmessung mit Sekundenbruchteilen, beide Seiten einer Dehnung, einzelne gemessene Kraftsätze, Zirkel-Durchgänge sowie den gegenseitigen Ausschluss aller drei Timerarten.

## Einfacher Einstieg

- Die App-Tour hat sechs Schritte: Willkommen, Heute, Training beginnen, Rundentimer, Profil, Ende. Weitere Erklärungen stehen dort, wo sie gebraucht werden.
- „Erste Schritte“ auf Heute zeigt nur den nächsten offenen Schritt und den Fortschritt; „Alle Schritte anzeigen“ klappt die Liste auf.
- Zielvorgaben bei Kraftübungen sind kurz („Ziel: 3 × 8“). Ein Grund steht nur dabei, wenn das Ziel gestiegen oder gesunken ist; „Gewicht selbst wählen“ nur bei Übungen mit Gewicht.
- Im Profil-Bereich „Training“ stehen oben die Vereins- und Ringzeit-Tage; Level, Disziplin, Technik-Schwerpunkt, Alter, Geschlecht und Einschränkungen sind unter „Mehr“ eingeklappt.
- „Was ist neu“ (aktuell Stand 2: Trainingsführung Schritt für Schritt) erscheint nach größeren Updates einmal für alle, die die App schon genutzt haben (nicht nach einer frischen Einrichtung). Gesteuert wird das über `NEWS_V`; die Entscheidung `newsSeen` bleibt in Sicherungen erhalten. Unter Profil → App & Daten ist der Hinweis jederzeit erneut lesbar.
- Einbeinige Übungen (Ausfallschritte, Bulgarian Split Squats, Step-ups, Wadenheben einbeinig, Einbeinstand mit Kick-Hold, Skater-Sprünge) zeigen „pro Bein“ in Dosierung, Ziel und Timer („Bein 1/2“); beidseitige Rumpfübungen behalten „je Seite“.
- Bei einbeinigen Kraftübungen hat jeder Satz zwei Felder, **Links** und **Rechts** – für Wiederholungen wie für Sekunden. Der Satz gilt als erledigt, wenn beide Beine eingetragen sind; für Ziele, Fortschritt und „Letztes Mal“ zählt das schwächere Bein. Einbeinige Halteübungen laufen im Satz-Ablauf je Satz als Links → Wechsel → Rechts, beide Zeiten werden eingetragen. Ältere Einträge mit nur einem Wert bleiben gültig.
- Freier Rundentimer: oben rechts gibt es einen eigenen Ansage-Schalter (🔊/🔈). Werden die Coach-Ansagen eingeschaltet, wird die Sprachausgabe automatisch mit eingeschaltet. Sprachausgaben starten auf dem iPhone verzögert nach einem Abbruch, damit Safari sie nicht verschluckt.
