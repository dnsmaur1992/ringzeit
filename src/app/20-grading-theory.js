  /* ============ Grading theory: learning cards and a short quiz per topic ============ */
  /* Sources: § 32/33 StGB; WAKO Deutschland rule pages (Point Fighting, Light Contact, Full Contact), WAKO Deutschland
     creative forms rules (2019), wako.sport (history), IOC recognition 2018/2021. Cards: [title, text]; quiz: [question, options, correct, explanation] */
  const THEORY = {
    notwehr: {
      de: {
        t: "Notwehr",
        cards: [
          [
            "Das Gesetz",
            "§ 32 StGB: Wer eine Tat begeht, die durch Notwehr geboten ist, handelt nicht rechtswidrig. Notwehr ist die Verteidigung, die erforderlich ist, um einen gegenwärtigen rechtswidrigen Angriff von sich oder einem anderen abzuwenden.",
          ],
          [
            "Angriff, gegenwärtig, rechtswidrig",
            "Ein Angriff ist die Bedrohung deines Körpers, deiner Freiheit oder deines Eigentums durch einen Menschen. Gegenwärtig heißt: Er steht unmittelbar bevor, läuft gerade oder dauert noch an. Ist er vorbei, ist ein Gegenschlag keine Notwehr mehr, sondern selbst eine Straftat. Rechtswidrig heißt: Der Angreifer hat kein Recht dazu.",
          ],
          [
            "Erforderlich",
            "Erlaubt ist die Verteidigung, die den Angriff sicher beendet. Gibt es mehrere gleich sichere Mittel, musst du das mildeste wählen. Wer Kampfsport kann, hat oft mildere wirksame Mittel wie Befreien oder Wegstoßen, und das wird berücksichtigt.",
          ],
          [
            "Nothilfe",
            "Notwehr gilt auch, wenn jemand anderes angegriffen wird: „von sich oder einem anderen“. Das nennt man Nothilfe.",
          ],
          [
            "Grenzen",
            "Eingeschränkt ist Notwehr zum Beispiel bei Angriffen von Kindern oder erkennbar Betrunkenen, bei einem krassen Missverhältnis zwischen Angriff und Verteidigung oder wenn du den Angriff selbst provoziert hast. Dann gilt: ausweichen, Abstand, Hilfe holen.",
          ],
          [
            "Notwehrexzess (§ 33 StGB)",
            "Wer die Grenzen der Notwehr aus Verwirrung, Furcht oder Schrecken überschreitet, wird nicht bestraft. Aus Wut oder Rache gilt das nicht.",
          ],
          [
            "In der Praxis",
            "Weggehen, Abstand halten, laut werden und Hilfe holen (110) ist fast immer die beste Lösung. Das ist eine Lernhilfe für die Prüfung, keine Rechtsberatung.",
          ],
        ],
        quiz: [
          [
            "Nach einem Schlag läuft der Angreifer weg. Darfst du hinterher und zurückschlagen?",
            ["Ja, das ist Notwehr", "Nein, der Angriff ist nicht mehr gegenwärtig", "Ja, wenn der Schlag wehgetan hat"],
            1,
            "Notwehr gibt es nur gegen einen gegenwärtigen Angriff. Ein Racheschlag ist selbst strafbar.",
          ],
          [
            "Was bedeutet „erforderlich“?",
            [
              "Jede Verteidigung ist erlaubt",
              "Das mildeste von mehreren gleich sicheren Mitteln",
              "Nur Abwehr, nie ein Gegenschlag",
            ],
            1,
            "Die Verteidigung muss den Angriff sicher beenden, aber unter gleich sicheren Mitteln das mildeste sein.",
          ],
          [
            "Ein Freund wird angegriffen. Darfst du eingreifen?",
            ["Ja, das ist Nothilfe", "Nein, Notwehr gilt nur für dich selbst", "Nur wenn er dich darum bittet"],
            0,
            "§ 32 StGB: Angriff „von sich oder einem anderen“.",
          ],
          [
            "Wann bleibt ein Überschreiten der Notwehr straffrei?",
            ["Aus Wut", "Aus Furcht oder Schrecken", "Wenn der Angreifer stärker war"],
            1,
            "§ 33 StGB nennt Verwirrung, Furcht oder Schrecken, nicht Wut oder Rache.",
          ],
          [
            "Wo ist die Notwehr geregelt?",
            ["§ 32 StGB", "§ 823 BGB", "Grundgesetz Artikel 2"],
            0,
            "Notwehr steht in § 32 des Strafgesetzbuchs, der Notwehrexzess in § 33.",
          ],
        ],
      },
      en: {
        t: "Self-defence law (Germany)",
        cards: [
          [
            "The law",
            "§ 32 of the German Criminal Code: an act required by self-defence is not unlawful. Self-defence is the defence necessary to avert a present unlawful attack on yourself or another person.",
          ],
          [
            "Attack, present, unlawful",
            "An attack is a threat by a person to your body, freedom or property. Present means it's imminent, happening or still ongoing. Once it's over, hitting back is no longer self-defence but an offence itself. Unlawful means the attacker has no right to do it.",
          ],
          [
            "Necessary",
            "You may use the defence that reliably ends the attack. Of several equally safe means you must choose the mildest. Trained fighters often have milder effective options such as releasing or pushing away, and that is taken into account.",
          ],
          ["Defending others", "Self-defence also covers attacks on someone else: “yourself or another person”."],
          [
            "Limits",
            "Self-defence is restricted, for example, against children or obviously drunk people, when attack and defence are grossly out of proportion, or if you provoked the attack. Then: step away, keep distance, get help.",
          ],
          [
            "Excessive self-defence (§ 33)",
            "Exceeding the limits out of confusion, fear or shock is not punished. Out of anger or revenge it is.",
          ],
          [
            "In practice",
            "Walking away, keeping distance, shouting and calling for help (110 in Germany) is almost always best. This is a study aid for the grading, not legal advice.",
          ],
        ],
        quiz: [
          [
            "After a punch the attacker runs off. May you chase him and hit back?",
            ["Yes, that's self-defence", "No, the attack is no longer present", "Yes, if the punch hurt"],
            1,
            "Self-defence only applies to a present attack. A revenge punch is an offence itself.",
          ],
          [
            "What does “necessary” mean?",
            ["Any defence is allowed", "The mildest of several equally safe means", "Only blocking, never a counter"],
            1,
            "The defence must reliably end the attack, but be the mildest of equally safe options.",
          ],
          [
            "A friend is attacked. May you step in?",
            ["Yes, defending others is covered", "No, it only applies to yourself", "Only if he asks you"],
            0,
            "§ 32: an attack on “yourself or another person”.",
          ],
          [
            "When does exceeding self-defence go unpunished?",
            ["Out of anger", "Out of fear or shock", "If the attacker was stronger"],
            1,
            "§ 33 names confusion, fear or shock, not anger or revenge.",
          ],
          [
            "Where is self-defence regulated in Germany?",
            ["§ 32 Criminal Code (StGB)", "§ 823 Civil Code", "Basic Law Article 2"],
            0,
            "Self-defence is § 32 StGB, excessive self-defence § 33.",
          ],
        ],
      },
    },
    pf: {
      de: {
        t: "Regelkunde Point Fighting",
        cards: [
          [
            "Prinzip",
            "Kontrollierte, schnelle Techniken auf erlaubte Ziele. Wie beim Fechten zählt der erste Treffer: Nach jeder Wertung unterbricht der Hauptkampfrichter den Kampf.",
          ],
          [
            "Punkte",
            "Schlag (auch gesprungen): 1 · Tritt zum Körper: 1 · Fußfeger: 1 · Tritt zum Kopf: 2 · gesprungener Tritt zum Körper: 2 · gesprungener Tritt zum Kopf: 3.",
          ],
          [
            "Trefferflächen",
            "Kopf vorne und seitlich, Hinterkopf nur bei einem Angriff von vorne. Oberkörper vorne und seitlich oberhalb des Gürtels. Fußfeger nur Fuß gegen Fuß bis zur Knöchelhöhe.",
          ],
          [
            "Verboten",
            "Angriffe auf Hals, Rücken, Beine und unterhalb der Gürtellinie, Knie, Ellbogen, Kopfstoß, Würfe, Klammern, blinde Techniken, der gedrehte Backfist, Angriffe auf einen fallenden oder liegenden Gegner und Weiterkämpfen nach „Stop“.",
          ],
          [
            "Zeit und Kampfende",
            "Landesebene 2 Runden à 2 min (1 min Pause) oder à 1,5 min (30 s Pause), Bundesfinale und international 3 × 2 min. Die Zeit läuft bei Wertungen weiter. Bei 6 bzw. 10 Punkten Vorsprung endet der Kampf vorzeitig. Jeder Exit gibt einen Minuspunkt, der vierte führt zur Disqualifikation.",
          ],
        ],
        quiz: [
          ["Wie viele Punkte gibt ein Tritt zum Kopf?", ["1", "2", "3"], 1, "Tritt zum Kopf: 2 Punkte, gesprungen 3."],
          [
            "Was passiert nach einem Wertungstreffer?",
            ["Es wird weitergekämpft", "Der Hauptkampfrichter unterbricht", "Die Runde endet"],
            1,
            "Point Fighting ist Stop-and-go: Nach jeder Wertung wird unterbrochen.",
          ],
          [
            "Ist der gedrehte Backfist erlaubt?",
            ["Ja", "Nein", "Nur zum Körper"],
            1,
            "Der gedrehte Backfist (spinning backfist) ist im Point Fighting verboten.",
          ],
          [
            "Wohin darf ein Fußfeger gehen?",
            ["Gegen den Fuß bis Knöchelhöhe", "Gegen die Wade", "Gegen das Knie"],
            0,
            "Nur Fuß gegen Fuß bis zur Knöchelhöhe.",
          ],
          [
            "Was gibt ein gesprungener Tritt zum Kopf?",
            ["2 Punkte", "3 Punkte", "4 Punkte"],
            1,
            "Das ist die höchste Einzelwertung: 3 Punkte.",
          ],
        ],
      },
      en: {
        t: "Point fighting rules",
        cards: [
          [
            "Principle",
            "Controlled, fast techniques to legal targets. As in fencing the first hit counts: after every score the referee stops the fight.",
          ],
          [
            "Points",
            "Punch (also jumping): 1 · kick to the body: 1 · foot sweep: 1 · kick to the head: 2 · jumping kick to the body: 2 · jumping kick to the head: 3.",
          ],
          [
            "Targets",
            "Head front and side, back of the head only when attacked from the front. Torso front and side above the belt. Foot sweeps only foot to foot up to the ankle.",
          ],
          [
            "Forbidden",
            "Attacks to the throat, back, legs and below the belt, knees, elbows, headbutts, throws, clinching, blind techniques, the spinning backfist, attacking a falling or downed opponent and fighting on after “stop”.",
          ],
          [
            "Time and end",
            "State level 2 rounds of 2 min (1 min break) or 1.5 min (30 s break), national finals and international 3 × 2 min. The clock keeps running during scoring. A lead of 6 or 10 points ends the fight early. Each exit costs a minus point, the fourth means disqualification.",
          ],
        ],
        quiz: [
          ["How many points is a kick to the head?", ["1", "2", "3"], 1, "Kick to the head: 2 points, jumping 3."],
          [
            "What happens after a score?",
            ["The fight goes on", "The referee stops the fight", "The round ends"],
            1,
            "Point fighting is stop-and-go: every score stops the fight.",
          ],
          [
            "Is the spinning backfist allowed?",
            ["Yes", "No", "Only to the body"],
            1,
            "The spinning backfist is forbidden in point fighting.",
          ],
          [
            "Where may a foot sweep go?",
            ["Foot to foot up to the ankle", "To the calf", "To the knee"],
            0,
            "Only foot to foot up to the ankle.",
          ],
          [
            "What does a jumping kick to the head score?",
            ["2 points", "3 points", "4 points"],
            1,
            "The highest single score: 3 points.",
          ],
        ],
      },
    },
    lkvk: {
      de: {
        t: "Regelkunde Leicht- und Vollkontakt",
        cards: [
          [
            "Leichtkontakt: Prinzip",
            "Durchkämpfen ohne Unterbrechung nach Treffern. Schnelle, kraftvolle Techniken, aber nur leichter Kontakt. Hand- und Fußtechniken sollen ausgeglichen eingesetzt werden. Leichtkontakt gilt als Vorstufe zum Full Contact.",
          ],
          [
            "Leichtkontakt: Wertung",
            "Drei Seitenrichter werten elektronisch. Punkte wie im Point Fighting: Schlag, Tritt zum Körper, Fußfeger 1 · Tritt zum Kopf und gesprungener Tritt zum Körper 2 · gesprungener Tritt zum Kopf 3. Bei 15 Punkten Vorsprung endet der Kampf. Jeder Exit gibt einen Minuspunkt, der vierte führt zur Disqualifikation.",
          ],
          [
            "Leichtkontakt: Zeit",
            "Landesebene 2 × 2 min oder 2 × 1,5 min, Bundesfinale und international 3 × 2 min mit 1 min Pause. Kampffläche bei Meisterschaften 7 × 7 m.",
          ],
          [
            "Vollkontakt: Prinzip",
            "Im Ring, Schläge und Tritte mit voller Kraft, ein K. o. ist möglich. Erlaubt sind Jab, Punch, Haken, Aufwärtshaken, Tritte auch mit dem Schienbein und Fußfeger. Treffer nur an Kopf und Oberkörper oberhalb des Gürtels, keine Tritte gegen die Beine.",
          ],
          [
            "Vollkontakt: Regeln",
            "3 Runden à 2 min, 1 min Pause. Pro Runde mindestens 6 Kicks, ein Kickzähler zählt mit. Wer weniger tritt, bekommt einen Minuspunkt, der 3 Trefferpunkten entspricht. Kopfschutz, 10-oz-Handschuhe, Mund-, Schienbein-, Fuß- und Tiefschutz sind Pflicht.",
          ],
        ],
        quiz: [
          [
            "Wird im Leichtkontakt nach einem Treffer unterbrochen?",
            ["Ja, wie im Point Fighting", "Nein, es wird durchgekämpft", "Nur bei Kopftreffern"],
            1,
            "Leichtkontakt ist ein Continuous Fight.",
          ],
          [
            "Ab welchem Vorsprung endet ein Leichtkontakt-Kampf vorzeitig?",
            ["6 Punkte", "10 Punkte", "15 Punkte"],
            2,
            "Sieg durch Überlegenheit bei 15 Punkten Vorsprung.",
          ],
          [
            "Wie viele Kicks pro Runde sind im Vollkontakt mindestens gefordert?",
            ["4", "6", "8"],
            1,
            "Mindestens 6 Kicks, sonst gibt es einen Minuspunkt.",
          ],
          [
            "Darf man im Vollkontakt gegen den Oberschenkel treten?",
            ["Ja", "Nein, nur Kopf und Oberkörper", "Nur mit dem Schienbein"],
            1,
            "Tritte gegen die Beine gibt es erst im Low Kick und K1. Im Vollkontakt ist am Bein nur der Fußfeger erlaubt.",
          ],
          [
            "Wie lang ist eine Vollkontakt-Runde?",
            ["1,5 min", "2 min", "3 min"],
            1,
            "3 Runden à 2 min mit 1 min Pause.",
          ],
        ],
      },
      en: {
        t: "Light & full contact rules",
        cards: [
          [
            "Light contact: principle",
            "Continuous fighting without stops after scores. Fast, powerful techniques but only light contact. Hands and kicks should be balanced. Light contact is the step before full contact.",
          ],
          [
            "Light contact: scoring",
            "Three judges score electronically. Points as in point fighting: punch, body kick, foot sweep 1 · head kick and jumping body kick 2 · jumping head kick 3. A 15-point lead ends the fight. Each exit costs a minus point, the fourth means disqualification.",
          ],
          [
            "Light contact: time",
            "State level 2 × 2 min or 2 × 1.5 min, national finals and international 3 × 2 min with 1 min breaks. Area at championships 7 × 7 m.",
          ],
          [
            "Full contact: principle",
            "In the ring, punches and kicks with full power, knockouts are possible. Allowed: jab, punch, hook, uppercut, kicks including with the shin, and foot sweeps. Targets only head and torso above the belt, no kicks to the legs.",
          ],
          [
            "Full contact: rules",
            "3 rounds of 2 min, 1 min break. At least 6 kicks per round, counted by a kick judge. Fewer kicks cost a minus point worth 3 scoring points. Headguard, 10 oz gloves, mouth, shin, foot and groin guard are mandatory.",
          ],
        ],
        quiz: [
          [
            "Is light contact stopped after a score?",
            ["Yes, like point fighting", "No, it's continuous", "Only for head shots"],
            1,
            "Light contact is a continuous fight.",
          ],
          [
            "What lead ends a light contact bout early?",
            ["6 points", "10 points", "15 points"],
            2,
            "Win by superiority with a 15-point lead.",
          ],
          [
            "How many kicks per round are required in full contact?",
            ["4", "6", "8"],
            1,
            "At least 6 kicks, otherwise a minus point.",
          ],
          [
            "May you kick the thigh in full contact?",
            ["Yes", "No, only head and torso", "Only with the shin"],
            1,
            "Leg kicks come with low kick and K1. In full contact only the foot sweep may go to the leg.",
          ],
          [
            "How long is a full contact round?",
            ["1.5 min", "2 min", "3 min"],
            1,
            "3 rounds of 2 min with 1 min breaks.",
          ],
        ],
      },
    },
    formen: {
      de: {
        t: "Regelkunde Formen",
        cards: [
          [
            "Was sind Formen?",
            "Eine Vorführung ohne Gegner: eine selbst gestaltete Abfolge von Techniken, Tritten und Bewegungen, die wie ein Kampf gegen imaginäre Gegner wirkt.",
          ],
          [
            "Musikformen",
            "Vorführung zur Musik, unterteilt in Hard Style (kraftvoll, karateähnlich), Soft Style (fließend, wushuähnlich) und Creative Forms mit akrobatischen Elementen. Jede Variante gibt es auch mit Waffen.",
          ],
          [
            "Kreativformen",
            "Bei WAKO Deutschland zusätzlich: Kreativformen und Kreativformen mit Waffen, ohne Musik und ohne Zeitlimit. Ein Starter darf pro Turnier höchstens vier Kategorien aus Musik- und Kreativformen belegen.",
          ],
          [
            "Bewertung",
            "Punkte von 7,0 bis 10,0. Kriterien sind Basics (Stellungen, Hand- und Fußtechniken, Blocks), Gleichgewicht und Fokus, Schwierigkeit (Sprünge, Drehungen, Kombinationen) und Darbietung. In Waffenkategorien zählt die Waffenhandhabung zuerst.",
          ],
        ],
        quiz: [
          [
            "In welchem Bereich liegen die Wertungen bei Formen?",
            ["0–10", "5,0–10,0", "7,0–10,0"],
            2,
            "Bewertet wird von 7,0 bis 10,0 Punkten.",
          ],
          [
            "Werden Kreativformen mit Musik gezeigt?",
            ["Ja, immer", "Nein, ohne Musik", "Nur mit Waffen"],
            1,
            "Kreativformen laufen ohne Musik, Musikformen mit.",
          ],
          [
            "Welcher Stil ist fließend und wushuähnlich?",
            ["Hard Style", "Soft Style", "Creative"],
            1,
            "Soft Style ist fließend, Hard Style kraftvoll und karateähnlich.",
          ],
          [
            "Was zählt in Waffenkategorien zuerst?",
            ["Die Musik", "Die Waffenhandhabung", "Die Kleidung"],
            1,
            "Die Waffenhandhabung ist dort das erste Kriterium.",
          ],
        ],
      },
      en: {
        t: "Forms rules",
        cards: [
          [
            "What are forms?",
            "A performance without an opponent: a self-designed sequence of techniques, kicks and movements, like a fight against imaginary opponents.",
          ],
          [
            "Musical forms",
            "Performed to music, divided into hard style (powerful, karate-like), soft style (flowing, wushu-like) and creative forms with acrobatics. Each also exists with weapons.",
          ],
          [
            "Creative forms",
            "WAKO Germany also has creative forms with and without weapons, performed without music and without a time limit. A competitor may enter at most four musical and creative forms categories per tournament.",
          ],
          [
            "Judging",
            "Scores from 7.0 to 10.0. Criteria are basics (stances, hand and foot techniques, blocks), balance and focus, difficulty (jumps, spins, combinations) and presentation. In weapon categories weapon handling comes first.",
          ],
        ],
        quiz: [
          [
            "What is the scoring range for forms?",
            ["0–10", "5.0–10.0", "7.0–10.0"],
            2,
            "Forms are scored from 7.0 to 10.0.",
          ],
          [
            "Are creative forms performed to music?",
            ["Yes, always", "No, without music", "Only with weapons"],
            1,
            "Creative forms are performed without music, musical forms with.",
          ],
          [
            "Which style is flowing and wushu-like?",
            ["Hard style", "Soft style", "Creative"],
            1,
            "Soft style is flowing, hard style powerful and karate-like.",
          ],
          [
            "What comes first in weapon categories?",
            ["The music", "Weapon handling", "The outfit"],
            1,
            "Weapon handling is the first criterion there.",
          ],
        ],
      },
    },
    geschichte: {
      de: {
        t: "Geschichte des Kickboxens",
        cards: [
          [
            "Wurzeln",
            "In Japan entstand in den 1960er-Jahren das Kickboxen aus Karate und Muay Thai. In den USA wurde Anfang der 1970er Full Contact Karate populär: Karateka kämpften mit Boxhandschuhen und vollem Kontakt. 1974 fand in Los Angeles eine erste Weltmeisterschaft im Full Contact statt.",
          ],
          [
            "Gründung der WAKO",
            "Die WAKO (World Association of Kickboxing Organizations) wurde am 26. Februar 1977 in Berlin gegründet. Gründer war Georg F. Brückner, die Idee eines weltweiten Verbands teilte er mit Mike Anderson. 1978 folgte die erste Weltmeisterschaft mit 110 Kämpfern aus 18 Ländern.",
          ],
          [
            "Olympische Anerkennung",
            "2018 erkannte das IOC die WAKO vorläufig an, im Juli 2021 vollständig. Heute vertritt die WAKO rund 130 Nationen. Kickboxen gehört zu den World Games und den European Games.",
          ],
          [
            "Disziplinen",
            "Tatami-Disziplinen: Point Fighting, Light Contact, Kick Light und Formen. Ring-Disziplinen: Full Contact, Low Kick und K1. In Deutschland ist die WAKO Deutschland (Bundesfachverband für Kickboxen) der Dachverband.",
          ],
        ],
        quiz: [
          ["Wann wurde die WAKO gegründet?", ["1974", "1977", "1985"], 1, "Am 26. Februar 1977."],
          [
            "In welcher Stadt wurde die WAKO gegründet?",
            ["Los Angeles", "Tokio", "Berlin"],
            2,
            "Gründungsort war Berlin.",
          ],
          [
            "Wer gilt als Gründer der WAKO?",
            ["Georg F. Brückner", "Bruce Lee", "Benny Urquidez"],
            0,
            "Georg F. Brückner, gemeinsam mit der Idee von Mike Anderson.",
          ],
          [
            "Seit wann ist die WAKO vom IOC vollständig anerkannt?",
            ["2012", "2018", "2021"],
            2,
            "Vorläufig 2018, vollständig im Juli 2021.",
          ],
          [
            "Welche Disziplin ist eine Ring-Disziplin?",
            ["Point Fighting", "Light Contact", "K1"],
            2,
            "K1, Low Kick und Full Contact werden im Ring gekämpft.",
          ],
        ],
      },
      en: {
        t: "History of kickboxing",
        cards: [
          [
            "Roots",
            "In Japan, kickboxing grew out of karate and Muay Thai in the 1960s. In the USA full contact karate became popular in the early 1970s: karateka fought with boxing gloves and full contact. A first full contact world championship was held in Los Angeles in 1974.",
          ],
          [
            "WAKO is founded",
            "WAKO (World Association of Kickboxing Organizations) was founded on 26 February 1977 in Berlin. Its founder was Georg F. Brückner, who shared the vision of a world body with Mike Anderson. The first world championships followed in 1978 with 110 fighters from 18 countries.",
          ],
          [
            "Olympic recognition",
            "The IOC recognised WAKO provisionally in 2018 and fully in July 2021. Today WAKO represents about 130 nations. Kickboxing is part of the World Games and the European Games.",
          ],
          [
            "Disciplines",
            "Tatami: point fighting, light contact, kick light and forms. Ring: full contact, low kick and K1. In Germany the umbrella body is WAKO Deutschland (Bundesfachverband für Kickboxen).",
          ],
        ],
        quiz: [
          ["When was WAKO founded?", ["1974", "1977", "1985"], 1, "On 26 February 1977."],
          ["In which city was WAKO founded?", ["Los Angeles", "Tokyo", "Berlin"], 2, "It was founded in Berlin."],
          [
            "Who is considered WAKO's founder?",
            ["Georg F. Brückner", "Bruce Lee", "Benny Urquidez"],
            0,
            "Georg F. Brückner, together with Mike Anderson's vision.",
          ],
          [
            "Since when has WAKO had full IOC recognition?",
            ["2012", "2018", "2021"],
            2,
            "Provisional in 2018, full in July 2021.",
          ],
          [
            "Which discipline is fought in the ring?",
            ["Point fighting", "Light contact", "K1"],
            2,
            "K1, low kick and full contact are ring disciplines.",
          ],
        ],
      },
    },
    lehre: {
      de: {
        t: "Lehrbeispiel Technikvermittlung",
        cards: [
          [
            "Aufbau",
            "Ein bewährter Ablauf: Ziel nennen, vormachen, kurz erklären, üben lassen, korrigieren, anwenden. Plane 5–10 Minuten für eine Technik.",
          ],
          [
            "Vormachen und erklären",
            "Erst die ganze Technik in normalem Tempo zeigen, dann langsam und von zwei Seiten. Nur 1–2 Kernpunkte nennen, zum Beispiel „Hüfte dreht mit“ oder „Hand sofort zurück zur Deckung“.",
          ],
          [
            "Üben lassen",
            "Vom Leichten zum Schweren: erst in der Luft, dann an der Pratze, dann mit Partner. Bei komplexen Techniken in Teilen üben und dann zusammensetzen.",
          ],
          [
            "Korrigieren",
            "Immer nur einen Fehler auf einmal, den wichtigsten zuerst. Positiv formulieren („Ellbogen höher“ statt „nicht so tief“) und zwischendurch loben.",
          ],
          [
            "Anwenden",
            "Die Technik in eine Kombination oder eine kleine Partneraufgabe einbauen, damit sie im Sparring ankommt. Zum Schluss kurz zusammenfassen.",
          ],
        ],
        quiz: [
          [
            "Wie viele Kernpunkte nennst du beim Erklären?",
            ["1–2", "5–6", "Alle, die es gibt"],
            0,
            "Wenige Kernpunkte bleiben hängen, zu viele verwirren.",
          ],
          [
            "Wie korrigierst du am besten?",
            ["Alle Fehler auf einmal", "Einen Fehler nach dem anderen", "Gar nicht, Übung macht den Meister"],
            1,
            "Den wichtigsten Fehler zuerst, dann den nächsten.",
          ],
          [
            "Was kommt nach dem Vormachen?",
            ["Sofort Sparring", "Kurz erklären und üben lassen", "Die Theorie abfragen"],
            1,
            "Vormachen, kurz erklären, dann üben lassen.",
          ],
        ],
      },
      en: {
        t: "Teaching a technique",
        cards: [
          [
            "Structure",
            "A proven sequence: state the goal, demonstrate, explain briefly, let them practise, correct, apply. Plan 5–10 minutes per technique.",
          ],
          [
            "Demonstrate and explain",
            "Show the whole technique at normal speed first, then slowly and from two sides. Give only 1–2 key points, for example “the hip turns with it” or “hand straight back to guard”.",
          ],
          [
            "Practise",
            "From easy to hard: in the air first, then on pads, then with a partner. Break complex techniques into parts, then put them together.",
          ],
          [
            "Correct",
            "One mistake at a time, the most important first. Phrase it positively (“elbow higher” rather than “not so low”) and praise in between.",
          ],
          [
            "Apply",
            "Build the technique into a combination or a small partner task so it reaches sparring. Sum up briefly at the end.",
          ],
        ],
        quiz: [
          [
            "How many key points do you give when explaining?",
            ["1–2", "5–6", "Every one there is"],
            0,
            "Few key points stick, too many confuse.",
          ],
          [
            "How do you correct best?",
            ["All mistakes at once", "One mistake at a time", "Not at all, practice makes perfect"],
            1,
            "The most important mistake first, then the next.",
          ],
          [
            "What comes after demonstrating?",
            ["Straight to sparring", "Explain briefly and let them practise", "Test the theory"],
            1,
            "Demonstrate, explain briefly, then practise.",
          ],
        ],
      },
    },
  };
  /* theory item of the grading programme → topics */
  const TH_TOPIC = {
    "1.th.0": ["notwehr"],
    "2.th.0": ["pf"],
    "3.th.0": ["lkvk"],
    "4.th.0": ["formen"],
    "4.th.1": ["geschichte"],
    "5.th.0": ["lehre"],
    "6.th.0": ["notwehr", "pf", "lkvk", "formen", "geschichte"],
  };
  const thText = (k) => THEORY[k][S.profile.lang === "de" ? "de" : "en"];
  function thSheetHtml(o) {
    const topics = TH_TOPIC[o.id];
    if (o.mode !== "quiz") {
      let h = "";
      topics.forEach((k) => {
        const tx = thText(k);
        if (topics.length > 1) h += `<div class="lab">${esc(tx.t)}</div>`;
        h += tx.cards.map((c) => `<div class="thcard"><b>${esc(c[0])}</b><p>${esc(c[1])}</p></div>`).join("");
      });
      return (
        h +
        `<div class="acts2"><button type="button" class="btn sec" data-sx="close">${t("close")}</button><button type="button" class="btn" data-thq="start">${t("thQuiz")}</button></div>`
      );
    }
    const q = o.qs[o.qi];
    if (!q) {
      const pass = o.score >= Math.ceil(o.qs.length * 0.8);
      return `<div class="thres"><b>${o.score} / ${o.qs.length}</b><p>${pass ? t("thPass") : t("thFail")}</p></div><div class="acts2"><button type="button" class="btn sec" data-thq="again">${t("thAgain")}</button><button type="button" class="btn" data-sx="close">${t("close")}</button></div>`;
    }
    const answered = o.pick != null;
    return `<div class="tstep">${t("thQ")(o.qi + 1, o.qs.length)}</div><p class="thq">${esc(q[0])}</p><div class="mlist">${q[1]
      .map(
        (a, i) =>
          `<button type="button" data-tha="${i}" class="${answered ? (i === q[2] ? "right" : i === o.pick ? "wrong" : "") : ""}" ${answered ? "disabled" : ""}><b>${esc(a)}</b></button>`,
      )
      .join(
        "",
      )}</div>${answered ? `<div class="note ${o.pick === q[2] ? "ok" : "warn"}">${esc(q[3])}</div><div class="acts2"><button type="button" class="btn" data-thq="next">${o.qi + 1 < o.qs.length ? t("onbNext") : t("thDone")}</button></div>` : ""}`;
  }
  function thStartQuiz(o) {
    const all = [];
    TH_TOPIC[o.id].forEach((k) => thText(k).quiz.forEach((q) => all.push(q)));
    // shuffle; mixed sets for the black belt are capped at 10 questions
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    Object.assign(o, {
      mode: "quiz",
      qs: all.slice(0, 10),
      qi: 0,
      pick: null,
      score: 0,
    });
  }
  /* Form cues: German name → [DE cues, EN cues, DE mistake, EN mistake] */
  /* focus blocks: power and active mobility */
  Object.assign(SKETCH, {
    "pow.jump_squats": {
      a: { ...SQUAT, w: [92, 104], W: [88, 104], ea: [0, 1] },
      b: {
        h: [120, 20],
        s: [120, 44],
        p: [120, 78],
        w: [130, 6],
        W: [110, 6],
        f: [124, 132],
        F: [116, 132],
        ea: [1, 0],
        ka: [1, 0],
      },
      arrow: [
        [186, 124],
        [186, 70],
      ],
    },
    "pow.broad_jumps": {
      a: {
        h: [83, 65],
        s: [72, 86],
        p: [56, 116],
        f: [86, 148],
        F: [80, 148],
        ka: [1, -0.4],
        w: [50, 100],
        W: [46, 100],
        ea: [0, 1],
      },
      b: {
        h: [183, 65],
        s: [172, 86],
        p: [156, 116],
        f: [186, 148],
        F: [180, 148],
        ka: [1, -0.4],
        w: [196, 92],
        W: [192, 94],
        ea: [0, 1],
      },
      arrow: [
        [86, 30],
        [170, 30],
      ],
    },
    "pow.lateral_bounds": SKETCH["cond.skater_jumps"],
    "pow.clap_push_ups": {
      a: { ...pd, w: [119, 147], ea: [-1, -0.3] },
      b: { ...skLine([40, 146], 36), w: [130, 116], W: [128, 118], ea: [1, 1] },
      arrow: [
        [192, 124],
        [192, 86],
      ],
    },
    "pow.explosive_push_ups": {
      a: { ...pd, w: [119, 147], ea: [-1, -0.3] },
      b: { ...skLine([40, 146], 36), w: [122, 134], ea: [-1, 0] },
      arrow: [
        [192, 124],
        [192, 86],
      ],
    },
    "cond.speed_rounds": SKETCH["cond.shadow_sprints"],
    "pre.short_pre_stretch": SKETCH["cool.hip_flexor_stretch"],
    "mob.controlled_leg_swings": {
      a: st({
        W: [94, 66],
        EA: [0, 1],
        w: [128, 96],
        f: [98, 142],
        ka: [1, 0],
      }),
      b: st({
        W: [94, 66],
        EA: [0, 1],
        w: [128, 96],
        f: [170, 80],
        ka: [0, -1],
      }),
      props: [["wall", 82]],
      arc: [[120, 94], 66, 115, -18],
    },
    "mob.kick_holds": {
      a: st({
        w: [132, 50],
        W: [126, 54],
        ea: [0, 1],
        f: [146, 122],
        ka: [1, -1],
      }),
      b: {
        h: [100, 44],
        s: [106, 66],
        p: [118, 98],
        w: [118, 52],
        W: [112, 56],
        ea: [0, 1],
        f: [172, 90],
        F: [114, 148],
        ka: [0, -1],
      },
      arrow: [
        [196, 132],
        [196, 98],
      ],
    },
    "mob.active_leg_raises": {
      a: {
        h: [182, 134],
        s: [158, 138],
        p: [124, 140],
        w: [128, 146],
        W: [124, 146],
        ea: [0, -1],
        f: [70, 144],
        F: [70, 144],
        ka: [0, -1],
      },
      b: {
        h: [182, 134],
        s: [158, 138],
        p: [124, 140],
        w: [128, 146],
        W: [124, 146],
        ea: [0, -1],
        f: [116, 86],
        F: [70, 144],
        ka: [-1, 0],
      },
      arc: [[124, 140], 64, 190, 262],
    },
  });
  const EXTIPS = {
    "pre.short_pre_stretch": [
      [
        "Nur nach dem Aufwärmen, nie kalt",
        "15–30 s pro Muskel – länger kostet Schnellkraft",
        "Danach direkt dynamisch weitermachen",
      ],
      [
        "Only after warming up, never cold",
        "15–30 s per muscle – longer costs power",
        "Go straight into dynamic work afterwards",
      ],
      "Lange und bis an die Schmerzgrenze halten",
      "Holding long and up to the pain threshold",
    ],
    "pow.jump_squats": [
      ["Knie zeigen in Richtung Zehen", "Arme schwingen kraftvoll mit", "Weich über den Vorfuß landen"],
      ["Knees point over the toes", "Swing the arms powerfully", "Land softly through the forefoot"],
      "Knie fallen bei der Landung nach innen",
      "Knees cave in on landing",
    ],
    "pow.broad_jumps": [
      ["Ausholen mit Armen und Hüfte", "Beide Füße gleichzeitig", "Landung halten, erst dann aufrichten"],
      ["Load with arms and hips", "Both feet at the same time", "Stick the landing before standing up"],
      "Nach der Landung nach vorn stolpern",
      "Stumbling forward after landing",
    ],
    "pow.lateral_bounds": [
      ["Vom Außenbein abdrücken", "Landung auf einem Bein, Knie über dem Fuß", "1 s stabil halten"],
      ["Push off the outside leg", "Land on one leg, knee over the foot", "Hold steady for 1 s"],
      "Sofort weiterspringen ohne stabile Landung",
      "Bouncing on without a stable landing",
    ],
    "pow.clap_push_ups": [
      ["Körper bleibt ein Brett", "Explosiv drücken, schnell klatschen", "Mit gebeugten Armen weich landen"],
      ["Body stays a plank", "Push explosively, clap fast", "Land soft with bent arms"],
      "Mit gestreckten Armen landen",
      "Landing on locked arms",
    ],
    "pow.explosive_push_ups": [
      ["Langsam runter, explosiv hoch", "Hände lösen sich nur kurz", "Rumpf fest"],
      ["Lower slowly, push up explosively", "Hands leave the floor only briefly", "Tight core"],
      "Hüfte hängt durch",
      "Hips sag",
    ],
    "cond.speed_rounds": [
      ["10 s wirklich Maximaltempo", "Hände kommen sofort zurück an den Kopf", "20 s locker bewegen, nicht stehen"],
      ["10 s truly at max speed", "Hands come straight back to the head", "Move easy for 20 s, don't stand still"],
      "Tempo geht auf Kosten der Deckung",
      "Speed at the cost of the guard",
    ],
    "mob.controlled_leg_swings": [
      ["Oberkörper bleibt aufrecht", "Höhe langsam steigern", "Standbein leicht gebeugt"],
      ["Upper body stays upright", "Increase the height gradually", "Standing knee slightly bent"],
      "Mit Schwung über den Schmerz reißen",
      "Yanking the leg up past the pain",
    ],
    "mob.kick_holds": [
      ["Knie erst hoch anziehen, dann strecken", "Ferse führt, Fuß angezogen", "Höhe halten, die du kontrollierst"],
      ["Chamber the knee high first, then extend", "Heel leads, foot flexed", "Hold the height you control"],
      "Oberkörper kippt weit nach hinten weg",
      "Upper body tips far back",
    ],
    "mob.active_leg_raises": [
      ["Unteres Bein bleibt am Boden", "Knie gestreckt, Fuß angezogen", "Langsam absenken"],
      ["Lower leg stays on the floor", "Knee straight, foot flexed", "Lower slowly"],
      "Mit Schwung hochwerfen",
      "Throwing the leg up with momentum",
    ],
    "str.push_ups": [
      ["Hände unter den Schultern", "Körper bleibt ein Brett: Po und Bauch fest", "Brust bis knapp über den Boden"],
      ["Hands under the shoulders", "Body stays a plank: glutes and abs tight", "Chest to just above the floor"],
      "Hüfte hängt durch oder Po ragt nach oben",
      "Hips sag or the butt sticks up",
    ],
    "str.plank_shoulder_taps": [
      ["Füße etwas breiter für mehr Stabilität", "Hüfte bleibt ruhig und waagrecht", "Langsam abwechselnd tippen"],
      ["Feet a little wider for stability", "Hips stay still and level", "Tap slowly, alternating sides"],
      "Hüfte schaukelt bei jedem Tippen mit",
      "Hips rock with every tap",
    ],
    "str.plank": [
      ["Ellbogen unter den Schultern", "Po anspannen, Bauchnabel einziehen", "Blick zum Boden, Nacken lang"],
      ["Elbows under the shoulders", "Squeeze glutes, pull the belly button in", "Look at the floor, long neck"],
      "Hohlkreuz, wenn die Spannung nachlässt",
      "Arched lower back as tension fades",
    ],
    "str.hollow_hold": [
      [
        "Lendenwirbelsäule fest in den Boden drücken",
        "Schultern und Beine knapp über dem Boden",
        "Zu schwer? Knie anwinkeln",
      ],
      ["Press the lower back into the floor", "Shoulders and legs just off the floor", "Too hard? Bend the knees"],
      "Unterer Rücken hebt vom Boden ab",
      "Lower back lifts off the floor",
    ],
    "str.pull_ups": [
      [
        "Aus dem ganzen Hang starten",
        "Schulterblätter zuerst nach unten ziehen",
        "Kinn über die Stange, kontrolliert ablassen",
      ],
      ["Start from a full hang", "Pull the shoulder blades down first", "Chin over the bar, lower under control"],
      "Mit Schwung aus den Beinen hochkippen",
      "Kipping up with leg swing",
    ],
    "str.negative_pull_ups": [
      ["Mit Sprung oder Kasten nach oben", "3–5 Sekunden langsam ablassen", "Unten ganz ausstrecken"],
      ["Jump or step to the top", "Lower slowly over 3–5 seconds", "Straighten fully at the bottom"],
      "Die letzte Hälfte einfach fallen lassen",
      "Dropping through the last half",
    ],
    "str.hanging_knee_raises": [
      ["Schultern aktiv, nicht passiv hängen", "Knie zur Brust, Becken einrollen", "Langsam ablassen, kein Pendeln"],
      ["Active shoulders, not a passive hang", "Knees to chest, curl the pelvis", "Lower slowly, no swinging"],
      "Schwung statt Bauchkraft",
      "Using momentum instead of abs",
    ],
    "str.dead_hang": [
      ["Schulterbreit greifen", "Schultern leicht aktiv halten", "Ruhig weiteratmen"],
      ["Shoulder-width grip", "Keep shoulders slightly engaged", "Keep breathing calmly"],
      "Schultern ganz bis zu den Ohren hochziehen lassen",
      "Letting shoulders creep up to the ears",
    ],
    "str.barbell_back_squat": [
      [
        "Stange auf dem oberen Rücken, nicht am Nacken",
        "Knie zeigen in Richtung Fußspitzen",
        "Fersen bleiben am Boden, Brust oben",
      ],
      ["Bar on the upper back, not the neck", "Knees track over the toes", "Heels down, chest up"],
      "Knie fallen nach innen",
      "Knees cave inward",
    ],
    "str.goblet_squats": [
      ["Gewicht eng vor der Brust", "Ellbogen zwischen die Knie sinken lassen", "Aufrecht bleiben, Fersen am Boden"],
      ["Weight close to the chest", "Let the elbows sink between the knees", "Stay upright, heels down"],
      "Fersen heben ab, Gewicht kippt nach vorn",
      "Heels lift and the weight tips forward",
    ],
    "str.barbell_romanian_deadlift": [
      [
        "Hüfte nach hinten schieben, Knie leicht gebeugt",
        "Stange eng an den Beinen führen",
        "Rücken bleibt gerade, Dehnung hinten im Oberschenkel",
      ],
      ["Push the hips back, knees soft", "Keep the bar close to the legs", "Flat back, stretch in the hamstrings"],
      "Runder Rücken beim Absenken",
      "Rounding the back on the way down",
    ],
    "str.romanian_deadlift": [
      ["Hüfte nach hinten schieben, Knie leicht gebeugt", "Hanteln eng an den Beinen führen", "Rücken bleibt gerade"],
      ["Push the hips back, knees soft", "Keep the weights close to the legs", "Flat back throughout"],
      "Aus den Knien statt aus der Hüfte beugen",
      "Bending at the knees instead of the hips",
    ],
    "cond.kettlebell_swings": [
      ["Bewegung kommt aus der Hüfte, nicht aus den Armen", "Oben Po fest anspannen", "Glocke schwingt bis Brusthöhe"],
      ["Drive from the hips, not the arms", "Squeeze the glutes at the top", "Bell swings to chest height"],
      "Kniebeuge statt Hüftstreckung",
      "Squatting instead of hinging",
    ],
    "str.bench_press": [
      ["Schulterblätter zusammen und nach unten", "Stange zur unteren Brust führen", "Füße fest am Boden"],
      ["Shoulder blades back and down", "Lower the bar to the lower chest", "Feet planted"],
      "Ellbogen stehen 90° zur Seite ab",
      "Elbows flared straight out at 90°",
    ],
    "str.dumbbell_press": [
      [
        "Schulterblätter fest auf der Bank",
        "Hanteln kontrolliert seitlich der Brust absenken",
        "Nach oben drücken, nicht zusammenschlagen",
      ],
      ["Shoulder blades set on the bench", "Lower the dumbbells beside the chest", "Press up without clanging them"],
      "Hohlkreuz und Po hebt ab",
      "Arching hard and lifting the hips",
    ],
    "str.lat_pulldown": [
      ["Brust raus, leicht zurücklehnen", "Stange zur oberen Brust ziehen", "Ellbogen nach unten und hinten"],
      ["Chest up, lean back slightly", "Pull the bar to the upper chest", "Drive the elbows down and back"],
      "Mit dem ganzen Körper nach hinten reißen",
      "Yanking with the whole body",
    ],
    "str.seated_cable_row": [
      ["Aufrecht sitzen, Knie leicht gebeugt", "Griff zum Bauch ziehen", "Schulterblätter zusammenführen"],
      ["Sit tall, knees slightly bent", "Pull the handle to the belly", "Squeeze the shoulder blades"],
      "Oberkörper schaukelt vor und zurück",
      "Rocking the torso back and forth",
    ],
    "str.band_rows": [
      ["Band auf Brusthöhe befestigen", "Ellbogen eng am Körper nach hinten", "Kurz halten, langsam zurück"],
      ["Anchor the band at chest height", "Elbows close, drive them back", "Pause briefly, return slowly"],
      "Schultern ziehen zu den Ohren hoch",
      "Shrugging the shoulders up",
    ],
    "str.cable_face_pulls": [
      ["Seil auf Gesichtshöhe", "Zum Gesicht ziehen, Hände auseinander", "Ellbogen bleiben hoch"],
      ["Rope at face height", "Pull towards the face, hands apart", "Keep the elbows high"],
      "Zu viel Gewicht und Ziehen aus dem Rücken",
      "Too much weight, pulling with the lower back",
    ],
    "str.band_face_pulls": [
      ["Band auf Gesichtshöhe befestigen", "Zum Gesicht ziehen, Hände auseinander", "Ellbogen bleiben hoch"],
      ["Anchor the band at face height", "Pull towards the face, hands apart", "Keep the elbows high"],
      "Ellbogen sinken ab, es wird ein Rudern",
      "Elbows drop and it turns into a row",
    ],
    "str.pallof_press": [
      ["Seitlich zum Band stehen", "Hände vor der Brust gerade nach vorn drücken", "Oberkörper darf nicht mitdrehen"],
      ["Stand side-on to the band", "Press the hands straight out from the chest", "Don't let the torso rotate"],
      "Zu nah am Ankerpunkt, keine Spannung",
      "Standing too close, no tension",
    ],
    "str.cable_woodchop": [
      ["Bewegung startet aus Hüfte und hinterem Fuß", "Arme fast gestreckt, diagonal ziehen", "Kontrolliert zurück"],
      ["Start the move from hips and back foot", "Arms almost straight, pull diagonally", "Return under control"],
      "Nur aus den Armen ziehen",
      "Pulling only with the arms",
    ],
    "str.seated_dumbbell_shoulder_press": [
      [
        "Rücken an der Lehne, Bauch fest",
        "Hanteln auf Schulterhöhe starten",
        "Nach oben drücken, nicht ganz einrasten",
      ],
      [
        "Back against the pad, abs tight",
        "Start with the dumbbells at shoulder height",
        "Press up without locking hard",
      ],
      "Hohlkreuz beim Drücken",
      "Arching the lower back to press",
    ],
    "str.leg_press": [
      ["Füße schulterbreit mittig auf der Platte", "Unterer Rücken bleibt am Polster", "Knie oben nicht durchdrücken"],
      ["Feet shoulder-width, centred on the plate", "Lower back stays on the pad", "Don't lock the knees at the top"],
      "Zu tief, sodass sich das Becken einrollt",
      "Going so deep the pelvis tucks under",
    ],
    "str.barbell_hip_thrust": [
      ["Schulterblätter an der Bankkante", "Kinn zur Brust, Rippen unten", "Oben Po fest, Körper waagrecht"],
      ["Shoulder blades on the bench edge", "Chin tucked, ribs down", "Squeeze glutes at the top, body level"],
      "Oben ins Hohlkreuz überstrecken",
      "Overarching the lower back at the top",
    ],
    "str.glute_bridges": [
      ["Füße hüftbreit nah am Po", "Becken leicht einrollen, dann heben", "Oben 2 Sekunden Po anspannen"],
      ["Feet hip-width close to the butt", "Tilt the pelvis slightly, then lift", "Squeeze the glutes for 2 seconds"],
      "Druck aus dem Rücken statt aus dem Po",
      "Pushing from the back instead of the glutes",
    ],
    "str.dead_bugs": [
      ["Rücken bleibt flach am Boden", "Gegengleich Arm und Bein strecken", "Langsam, mit der Ausatmung"],
      ["Lower back stays flat on the floor", "Extend opposite arm and leg", "Move slowly as you exhale"],
      "Hohlkreuz, wenn das Bein nach unten geht",
      "Back arches as the leg lowers",
    ],
    "str.russian_twists": [
      [
        "Leicht zurücklehnen, Rücken gerade",
        "Drehung aus dem Oberkörper, nicht nur Arme",
        "Füße am Boden, wenn es zu schwer wird",
      ],
      ["Lean back slightly, straight back", "Rotate the torso, not just the arms", "Feet down if it gets too hard"],
      "Runder Rücken und nur Arme bewegen",
      "Rounded back, moving only the arms",
    ],
    "str.lunges": [
      ["Großer Schritt, Oberkörper aufrecht", "Hinteres Knie Richtung Boden", "Vorderes Knie über dem Fuß"],
      ["Long step, upright torso", "Back knee towards the floor", "Front knee over the foot"],
      "Vorderes Knie knickt nach innen",
      "Front knee caves in",
    ],
    "str.bulgarian_split_squats": [
      ["Hinterer Fuß auf der Bank", "Gewicht auf dem vorderen Bein", "Gerade nach unten sinken"],
      ["Back foot on the bench", "Weight on the front leg", "Sink straight down"],
      "Vorderer Fuß zu nah an der Bank",
      "Front foot too close to the bench",
    ],
    "str.step_ups": [
      ["Ganzer Fuß auf die Kiste", "Mit dem oberen Bein hochdrücken", "Langsam wieder absteigen"],
      ["Whole foot on the box", "Drive up with the top leg", "Step down slowly"],
      "Mit dem unteren Bein abstoßen",
      "Pushing off the bottom leg",
    ],
    "str.single_leg_calf_raises": [
      ["Ballen auf der Kante, Ferse frei", "Ganz hoch auf die Zehen", "Unten volle Dehnung"],
      ["Ball of the foot on the edge, heel free", "Rise all the way onto the toes", "Full stretch at the bottom"],
      "Kleine, schnelle Wipp-Bewegungen",
      "Short, bouncy reps",
    ],
    "str.copenhagen_plank": [
      [
        "Oberes Bein auf der Bank, Ellbogen unter der Schulter",
        "Hüfte hoch, Körper gerade",
        "Einsteiger: Knie statt Fuß auflegen",
      ],
      [
        "Top leg on the bench, elbow under the shoulder",
        "Hips up, body straight",
        "Beginners: rest the knee, not the foot",
      ],
      "Hüfte sackt ab",
      "Hips sag",
    ],
    "str.single_leg_kick_hold": [
      ["Standbein leicht gebeugt", "Kick auf Hüfthöhe halten, Deckung oben", "Oberkörper ruhig"],
      ["Standing knee soft", "Hold the kick at hip height, guard up", "Keep the torso still"],
      "Deckung fällt beim Halten",
      "Guard drops while holding",
    ],
    "cond.burpees": [
      ["Hände schulterbreit aufsetzen", "Kurz sauber in den Stütz", "Weich landen, aufrecht abspringen"],
      ["Hands shoulder-width on the floor", "Hit a clean plank briefly", "Land softly, jump up tall"],
      "Hüfte hängt im Stütz durch",
      "Hips sag in the plank",
    ],
    "cond.mountain_climbers": [
      ["Hände unter den Schultern", "Hüfte tief, Rücken gerade", "Knie schnell Richtung Brust"],
      ["Hands under the shoulders", "Hips low, back flat", "Drive the knees fast to the chest"],
      "Po schiebt sich nach oben",
      "Butt pushes up into the air",
    ],
    "cond.skater_jumps": [
      ["Seitlich abspringen", "Auf einem Bein weich landen", "Knie über dem Fuß halten"],
      ["Push off sideways", "Land softly on one leg", "Keep the knee over the foot"],
      "Landung mit gestrecktem Knie",
      "Landing on a locked knee",
    ],
    "cond.bear_crawl": [
      ["Knie knapp über dem Boden", "Rücken flach wie ein Tisch", "Diagonal Hand und Fuß bewegen"],
      ["Knees just off the floor", "Back flat like a table", "Move opposite hand and foot"],
      "Hüfte schaukelt hin und her",
      "Hips sway side to side",
    ],
    "cond.band_punches": [
      ["Band hinten fixiert, Kampfstellung", "Schnelle Geraden, sofort zurück zur Deckung", "Hüfte dreht mit"],
      ["Band anchored behind, fight stance", "Fast straights, snap back to guard", "Rotate the hips with each punch"],
      "Hand bleibt nach dem Schlag vorne",
      "Hand stays out after the punch",
    ],
    "cond.shadow_sprints": [
      [
        "Kampfstellung, locker auf den Ballen",
        "Gerade Schläge so schnell wie möglich",
        "Hände schnell zurück zur Deckung",
      ],
      [
        "Fight stance, light on the balls of the feet",
        "Straight punches as fast as you can",
        "Snap the hands back to guard",
      ],
      "Deckung fällt mit zunehmender Müdigkeit",
      "Guard drops as fatigue sets in",
    ],
    "cond.bag_sprints": [
      ["Nah am Sack, Kampfstellung halten", "Kurze, schnelle Geraden im Wechsel", "Faust fest, Handgelenk gerade"],
      ["Stay close to the bag in fight stance", "Short, fast alternating straights", "Tight fist, straight wrist"],
      "Mit offener Hand oder abgeknicktem Handgelenk schlagen",
      "Hitting with a loose fist or bent wrist",
    ],
    "cond.rope_intervals": [
      ["Locker auf den Fußballen springen", "Seil aus den Handgelenken drehen", "Ellbogen nah am Körper"],
      ["Bounce lightly on the balls of the feet", "Turn the rope from the wrists", "Elbows close to the body"],
      "Zu hoch springen und schwer landen",
      "Jumping too high and landing hard",
    ],
    "cond.kick_intervals": [
      ["Auf dem Ballen des Standbeins drehen", "Mit dem Schienbein treffen, Körperhöhe", "Deckung bleibt oben"],
      ["Pivot on the ball of the standing foot", "Strike with the shin at body height", "Keep the guard up"],
      "Arme fallen beim Kick nach unten",
      "Arms drop during the kick",
    ],
    "cond.stair_or_bench_runs": [
      ["Ganzer Fuß auf die Stufe", "Arme schwingen aktiv mit", "Runter immer kontrolliert gehen"],
      ["Whole foot on each step", "Swing the arms actively", "Always walk down under control"],
      "Nach unten rennen",
      "Running down the stairs",
    ],
    "str.neck_iso_hold": [
      ["Hand an Stirn, Hinterkopf, dann seitlich", "Kopf und Hand drücken gegeneinander, der Kopf bewegt sich kaum", "Sanft starten, gleichmäßig steigern"],
      ["Hand on forehead, back of head, then the sides", "Head and hand push against each other, the head barely moves", "Start gently, build up steadily"],
      "Ruckartig mit voller Kraft drücken",
      "Pushing jerkily at full force",
    ],
  };
  const hasSketch = (id) => !!(EX[id] && SKETCH[EX[id].key]);
  function exInfoHtml(id) {
    const e = EX[id],
      tp = EXTIPS[e.key],
      lg = S.profile.lang,
      k = SKETCH[e.key];
    let h = `<div class="skwrap">${sketchSvg(e.key)}${k.hold ? `<span class="skhold">${t("skHold")}</span>` : ""}</div>`;
    if (tp)
      h += `<ul class="cues">${tp[lg === "de" ? 0 : 1].map((c) => `<li>${esc(c)}</li>`).join("")}</ul><div class="note warn"><b>${t("skErr")}</b> ${esc(tp[lg === "de" ? 2 : 3])}</div>`;
    else h += `<p class="sub" style="margin:0">${esc(lg === "de" ? e.dde : e.den)}</p>`;
    return h;
  }
  const exName = (id, name) =>
    hasSketch(id)
      ? `<button type="button" class="exn" data-exinfo="${id}"><b>${esc(name)}</b><span class="exi" aria-hidden="true">i</span></button>`
      : `<b>${esc(name)}</b>`;
