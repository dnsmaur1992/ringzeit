  /* ============ Fun facts & technique tips ============ */
  const FACTS = [
    {
      de: "Die WAKO wurde am 26. Februar 1977 in Berlin offiziell gegründet – von Georg Brückner.",
      en: "WAKO was officially founded in Berlin on 26 February 1977 by Georg Brückner.",
      s: "wako.sport",
    },
    {
      de: "WAKO stand ursprünglich für „World All-Style Karate Organization“. Kickboxen hieß anfangs noch Semi- und Full-Contact-Karate.",
      en: "WAKO originally stood for “World All-Style Karate Organization”. Early on, the sport was still called semi- and full-contact karate.",
      s: "wako.sport",
    },
    {
      de: "Georg Brückner gilt als „Vater des europäischen Kickboxens“. Ab 1974 veranstaltete er die ersten Kickbox-Shows in Europa.",
      en: "Georg Brückner is known as the “father of European kickboxing”. From 1974 he promoted the first kickboxing shows in Europe.",
      s: "Wikipedia",
    },
    {
      de: "Brückner erfand und patentierte Schutzausrüstung, damit Kämpfer verschiedener Stile ohne schwere Verletzungen gegeneinander antreten konnten.",
      en: "Brückner invented and patented protective gear so fighters from different styles could compete without serious injuries.",
      s: "Wikipedia",
    },
    {
      de: "Als erster „Kickbox-Kampf“ gilt für die WAKO das Duell Joe Lewis gegen Greg Baines 1970 in den USA – erstmals mit Boxhandschuhen.",
      en: "WAKO regards Joe Lewis vs. Greg Baines (USA, 1970) as the first “kickboxing fight” – the first time boxing gloves were worn.",
      s: "wako.sport",
    },
    {
      de: "1974 fand in Los Angeles die erste „Weltmeisterschaft im Full Contact“ statt. Erste Weltmeister: Bill Wallace, Jeff Smith und Joe Lewis.",
      en: "The first “World Championship in Full Contact” took place in Los Angeles in 1974. First champions: Bill Wallace, Jeff Smith and Joe Lewis.",
      s: "wako.sport",
    },
    {
      de: "Die ersten WAKO-Europameisterschaften fanden 1977 in Wien statt – alle Kämpfe nach Full-Contact-Regeln.",
      en: "The first WAKO European Championships were held in Vienna in 1977 – every bout under Full Contact rules.",
      s: "Wikipedia",
    },
    {
      de: "Bei der ersten WAKO-Weltmeisterschaft 1978 traten 110 Athleten aus 18 Ländern an.",
      en: "The first WAKO World Championships in 1978 had 110 competitors from 18 countries.",
      s: "WAKO India",
    },
    {
      de: "Am 20. Juli 2021 erkannte das IOC die WAKO auf seiner 138. Session in Tokio vollständig an.",
      en: "On 20 July 2021, the 138th IOC Session in Tokyo granted WAKO full recognition.",
      s: "wako.sport",
    },
    {
      de: "Die vorläufige IOC-Anerkennung für Kickboxen kam bereits am 30. November 2018.",
      en: "Kickboxing received provisional IOC recognition on 30 November 2018.",
      s: "WAKO India",
    },
    {
      de: "Die WAKO hat 7 Wettkampfdisziplinen: 3 im Ring (Full Contact, Low Kick, K1) und 4 auf der Tatami (Point Fighting, Light Contact, Kick Light, Musical Forms).",
      en: "WAKO has 7 competitive disciplines: 3 in the ring (Full Contact, Low Kick, K1) and 4 on the tatami (Point Fighting, Light Contact, Kick Light, Musical Forms).",
      s: "wako.sport",
    },
    {
      de: "Ein Kampf im Ring dauert drei Runden à zwei Minuten, mit einer Minute Pause dazwischen.",
      en: "A ring bout is three two-minute rounds with a one-minute break between them.",
      s: "wako.sport",
    },
    {
      de: "Im Full Contact müssen pro Runde mindestens 6 Kicks geschlagen werden – sonst drohen Punktabzüge.",
      en: "In Full Contact you must throw at least 6 kicks per round, or the referee may deduct points.",
      s: "Wikipedia",
    },
    {
      de: "Fußfeger sind im Full Contact erlaubt – aber nur Fuß gegen Fuß.",
      en: "Foot sweeps are legal in Full Contact – but only foot against foot.",
      s: "USA Kickboxing",
    },
    {
      de: "Full-Contact-Kämpfer tragen lange Hosen, Low-Kick- und K1-Kämpfer kurze Shorts.",
      en: "Full Contact fighters compete in long pants; Low Kick and K1 fighters wear shorts.",
      s: "Ontario Kickboxing Rules",
    },
    {
      de: "Light Contact liegt zwischen Point Fighting und Full Contact: gleiche Techniken, aber jeder Treffer muss kontrolliert sein.",
      en: "Light Contact sits between Point Fighting and Full Contact: the same techniques, but every hit must be controlled.",
      s: "WAKO Technical Book",
    },
    {
      de: "Laut WAKO trainieren weltweit über 4 Millionen Menschen Kickboxen – in mehr als 40.000 Vereinen.",
      en: "According to WAKO, over 4 million people practise kickboxing in more than 40,000 clubs worldwide.",
      s: "wako.sport",
    },
    {
      de: "135 Nationen auf fünf Kontinenten sind Mitglied der WAKO.",
      en: "135 nations across five continents are WAKO members.",
      s: "wako.sport",
    },
    {
      de: "Seit der Regelreform heißt die Disziplin „K1 Rules“ offiziell „K1 Style“.",
      en: "Since the rules reform, the discipline “K1 Rules” is officially called “K1 Style”.",
      s: "wako.sport",
    },
    {
      de: "Der Hauptsitz der WAKO liegt heute in Monza, Italien.",
      en: "WAKO's headquarters are in Monza, Italy.",
      s: "Wikipedia",
    },
    {
      de: "Das Wort „Kickboxing“ wurde in den 1960er-Jahren in Japan geprägt – vom Box-Promoter Osamu Noguchi.",
      en: "The word “kickboxing” was coined in Japan in the 1960s – by boxing promoter Osamu Noguchi.",
      s: "Wikipedia: Kickboxing",
    },
    {
      de: "K-1 wurde 1993 in Japan von Kazuyoshi Ishii gegründet. Das „K“ steht für Kampfkünste wie Karate, Kickboxen und Kung-Fu, die „1“ für den einen Sieger.",
      en: "K-1 was founded in Japan in 1993 by Kazuyoshi Ishii. The “K” stands for styles like karate, kickboxing and kung fu, the “1” for the one champion.",
      s: "Wikipedia: K-1",
    },
    {
      de: "Muay Thai heißt „Kunst der acht Gliedmaßen“: zwei Fäuste, zwei Ellbogen, zwei Knie, zwei Schienbeine.",
      en: "Muay Thai is called “the art of eight limbs”: two fists, two elbows, two knees, two shins.",
      s: "Wikipedia: Muay Thai",
    },
    {
      de: "Bill Wallace bekam den Spitznamen „Superfoot“ – er kickte fast nur mit dem linken Bein, weil sein rechtes Knie verletzt war.",
      en: "Bill Wallace was nicknamed “Superfoot” – he kicked almost only with his left leg because his right knee was injured.",
      s: "Wikipedia: Bill Wallace",
    },
    {
      de: "Die Queensberry-Regeln von 1867 machten Handschuhe im Boxen zur Pflicht und führten Runden à 3 Minuten mit 1 Minute Pause ein.",
      en: "The Queensberry Rules of 1867 made gloves mandatory in boxing and introduced 3-minute rounds with a 1-minute break.",
      s: "Wikipedia: Marquess of Queensberry Rules",
    },
    {
      de: "Handschuhe werden in Unzen gewogen: Ein 10-oz-Handschuh wiegt rund 283 Gramm.",
      en: "Gloves are weighed in ounces: a 10 oz glove weighs about 283 grams.",
      s: "1 oz = 28,35 g",
    },
    {
      de: "Savate ist französisches „Fußboxen“ – gekämpft wird dort mit Schuhen.",
      en: "Savate is French “foot boxing” – it is fought wearing shoes.",
      s: "Wikipedia: Savate",
    },
    {
      de: "Sanda (Sanshou) ist chinesisches Kickboxen: Schläge, Tritte – und Würfe sind erlaubt.",
      en: "Sanda (Sanshou) is Chinese kickboxing: punches, kicks – and throws are allowed.",
      s: "Wikipedia: Sanda",
    },
    {
      de: "Im burmesischen Lethwei sind sogar Kopfstöße erlaubt – traditionell kämpft man mit Bandagen, aber ohne Handschuhe.",
      en: "In Burmese Lethwei even headbutts are allowed – traditionally fought with wraps but no gloves.",
      s: "Wikipedia: Lethwei",
    },
    {
      de: "„Dojo“ bedeutet „Ort des Weges“ – der Raum, in dem man den Weg einer Kampfkunst übt.",
      en: "“Dojo” means “place of the way” – the room where you practise the way of a martial art.",
      s: "Wikipedia: Dojo",
    },
    {
      de: "Der häufigste Bruch beim Schlagen ist der „Boxerbruch“ am fünften Mittelhandknochen. Bandagen und Treffen mit den ersten beiden Knöcheln schützen davor.",
      en: "The most common fracture from punching is the “boxer's fracture” of the fifth metacarpal. Hand wraps and hitting with the first two knuckles protect against it.",
      s: "DocCheck Flexikon: Boxerfraktur",
    },
    {
      de: "Muskelkater entsteht durch winzige Risse in den Muskelfasern – nicht durch Milchsäure, wie man lange dachte.",
      en: "Muscle soreness comes from tiny tears in the muscle fibres – not from lactic acid, as was long believed.",
      s: "Sportmedizin",
    },
    {
      de: "Knochen passen sich der Belastung an (Wolffsches Gesetz) – deshalb wird das Schienbein durch langsames, regelmäßiges Training belastbarer.",
      en: "Bones adapt to the load placed on them (Wolff's law) – which is why the shin gets tougher with slow, regular training.",
      s: "Wikipedia: Wolffsches Gesetz",
    },
    {
      de: "Schon rund 2 % Flüssigkeitsverlust (gemessen am Körpergewicht) können die Leistung messbar senken.",
      en: "Losing as little as about 2 % of body weight in fluid can measurably reduce performance.",
      s: "ACSM Position Stand",
    },
    {
      de: "Im Tiefschlaf schüttet der Körper besonders viel Wachstumshormon aus – Schlaf ist Teil deines Trainings.",
      en: "In deep sleep the body releases most of its growth hormone – sleep is part of your training.",
      s: "Schlafmedizin",
    },
    {
      de: "Die Reaktionszeit auf einen Sehreiz liegt meist bei rund 0,2 Sekunden – deshalb sind Finten so wirksam.",
      en: "Reaction time to something you see is usually around 0.2 seconds – that's why feints work so well.",
      s: "Physiologie",
    },
    {
      de: "Im Profiboxen ist der Jab laut Schlagstatistiken der am häufigsten geschlagene Schlag.",
      en: "In pro boxing, punch statistics show the jab is the most frequently thrown punch.",
      s: "CompuBox",
    },
    {
      de: "Im Ring gibt es eine rote und eine blaue Ecke für die Kämpfer – die zwei übrigen heißen „neutrale Ecken“.",
      en: "A ring has a red and a blue corner for the fighters – the other two are called “neutral corners”.",
      s: "Wettkampfregeln",
    },
    {
      de: "Im Point Fighting wird nach jedem Treffer unterbrochen und gewertet – im Light Contact läuft der Kampf weiter.",
      en: "In Point Fighting the bout stops after every hit to score it – in Light Contact the fight keeps going.",
      s: "WAKO-Regeln",
    },
    {
      de: "„Float like a butterfly, sting like a bee“ – der berühmte Spruch von Muhammad Ali stammt aus dem Jahr 1964.",
      en: "“Float like a butterfly, sting like a bee” – Muhammad Ali's famous line dates from 1964.",
      s: "Wikipedia: Muhammad Ali",
    },
    {
      de: "Seilspringen trainiert Rhythmus, Fußarbeit und Ausdauer zugleich – darum gehört es seit Generationen zum Box-Training.",
      en: "Skipping rope trains rhythm, footwork and stamina at once – that's why it has been part of boxing training for generations.",
      s: "Trainingslehre",
    },
    {
      de: "Die Kraft eines Schlags kommt aus der ganzen Kette: Fuß, Bein, Hüfte, Rumpf, Schulter, Arm – nicht aus dem Arm allein.",
      en: "The power of a punch comes from the whole chain: foot, leg, hip, trunk, shoulder, arm – not from the arm alone.",
      s: "Biomechanik",
    },
    {
      de: "Bei den World Games 2022 in Birmingham (USA) war Kickboxen erstmals offizielle Sportart – gekämpft wurde nach K1-Regeln. 2017 war es dort noch Einladungssportart.",
      en: "At the 2022 World Games in Birmingham (USA) kickboxing was an official sport for the first time – fought under K1 rules. In 2017 it had been an invitational sport.",
      s: "Wikipedia: Kickboxing at the 2022 World Games",
    },
    {
      de: "2023 war Kickboxen zum ersten Mal Teil der European Games: 16 Wettbewerbe in Point Fighting, Light Contact und Full Contact, ausgetragen in Myślenice (Polen).",
      en: "In 2023 kickboxing was part of the European Games for the first time: 16 events in point fighting, light contact and full contact, held in Myślenice (Poland).",
      s: "Wikipedia: Kickboxing at the 2023 European Games",
    },
    {
      de: "Ernesto Hoost hieß „Mr. Perfect“ – wegen seiner fast maschinenhaft präzisen Kombinationen. Er gewann den K-1 World Grand Prix 1997, 1999, 2000 und 2002.",
      en: "Ernesto Hoost was called “Mr. Perfect” for his almost machine-like precise combinations. He won the K-1 World Grand Prix in 1997, 1999, 2000 and 2002.",
      s: "Wikipedia: Ernesto Hoost",
    },
    {
      de: "Semmy Schilt ist 2,12 m groß und gewann den K-1 World Grand Prix viermal – 2005, 2006, 2007 und 2009.",
      en: "Semmy Schilt is 2.12 m tall and won the K-1 World Grand Prix four times – 2005, 2006, 2007 and 2009.",
      s: "Wikipedia: Semmy Schilt",
    },
    {
      de: "Peter Aerts, „The Dutch Lumberjack“, gewann den K-1 World Grand Prix 1994, 1995 und 1998 – und gilt vielen als „Mr. K-1“.",
      en: "Peter Aerts, “The Dutch Lumberjack”, won the K-1 World Grand Prix in 1994, 1995 and 1998 – many call him “Mr. K-1”.",
      s: "Wikipedia: Peter Aerts",
    },
    {
      de: "Das Rajadamnern-Stadion in Bangkok wurde ab 1941 gebaut, der Krieg stoppte den Bau. Der erste Kampf fand am 23. Dezember 1945 statt.",
      en: "Construction of Bangkok's Rajadamnern Stadium began in 1941 and was halted by the war. The first fight took place on 23 December 1945.",
      s: "WMC: Rajadamnern Stadium History",
    },
    {
      de: "Vor der ersten Runde zeigen Muay-Thai-Kämpfer den Wai Khru Ram Muay – ein Ritual, das Lehrer und Training ehrt. Gewertet wird er nicht.",
      en: "Before the first round, Muay Thai fighters perform the Wai Khru Ram Muay – a ritual honouring their teachers and training. It isn't scored.",
      s: "Muay Thai Records: Wai Kru Ram Muay",
    },
    {
      de: "Wie schnell dein Puls in der ersten Minute Pause fällt, zeigt deine Ausdauer: Je schneller er sinkt, desto besser erholst du dich zwischen den Runden.",
      en: "How fast your pulse drops in the first minute of rest shows your endurance: the faster it falls, the better you recover between rounds.",
      s: "Sportmedizin",
    },
    // boxing (b: 1)
    {
      b: 1,
      de: "Boxen gehörte schon zu den antiken Olympischen Spielen. Der erste bekannte Sieger war Onomastos von Smyrna im Jahr 688 v. Chr.",
      en: "Boxing was part of the ancient Olympic Games. The first known champion was Onomastos of Smyrna in 688 BCE.",
      s: "Olympedia",
    },
    {
      b: 1,
      de: "Bei den modernen Olympischen Spielen war Boxen erstmals 1904 in St. Louis dabei – alle Teilnehmer waren Amerikaner.",
      en: "Boxing first appeared at the modern Olympic Games in 1904 in St. Louis – all entrants were American.",
      s: "Olympedia",
    },
    {
      b: 1,
      de: "1912 in Stockholm fehlte Boxen, weil der Sport in Schweden damals eine Sondergenehmigung brauchte. Seit Antwerpen 1920 ist es bei jeder Austragung dabei.",
      en: "Boxing was missing in Stockholm in 1912 because the sport needed special permits in Sweden at that time. It has been on the programme at every Games since Antwerp 1920.",
      s: "Olympedia",
    },
    {
      b: 1,
      de: "Olympisches Frauenboxen gab es erstmals 2012 in London.",
      en: "Women's boxing was first contested at the Olympic Games in London in 2012.",
      s: "Olympedia",
    },
    {
      b: 1,
      de: "Die Amateur Boxing Association of England wurde 1880 von zwölf Vereinen gegründet, die ersten Meisterschaften folgten 1881.",
      en: "The Amateur Boxing Association of England was formed in 1880 by twelve clubs; its first championships followed in 1881.",
      s: "Wikipedia",
    },
    {
      b: 1,
      de: "Seit 2009 boxen Männer im internationalen Amateurboxen drei Runden zu je drei Minuten, vorher waren es vier Runden zu je zwei Minuten.",
      en: "Since 2009 men in international amateur boxing fight three rounds of three minutes; before that it was four rounds of two minutes.",
      s: "Wikipedia",
    },
    {
      b: 1,
      de: "Die ersten Amateurbox-Weltmeisterschaften fanden 1974 statt.",
      en: "The first World Amateur Boxing Championships were held in 1974.",
      s: "Wikipedia",
    },
    {
      tk: true,
      de: "Taekwondo setzt sich aus drei Silben zusammen: tae (Fuß), kwon (Faust) und do (Weg). Der Name wurde in den 1950er-Jahren festgelegt.",
      en: "Taekwondo is made of three syllables: tae (foot), kwon (fist) and do (way). The name was settled in the 1950s.",
      s: "Wikipedia",
    },
    {
      tk: true,
      de: "Die Schülergrade heißen Gup (Kup) und zählen abwärts bis zum 1. Gup; danach folgen die Meistergrade (Dan), die aufwärts gezählt werden.",
      en: "The student grades are called gup (kup) and count down to 1st gup; the master grades (dan) that follow count upwards.",
      s: "Wikipedia",
    },
    {
      tk: "wt",
      de: "Die World Taekwondo Federation wurde 1973 gegründet, im selben Jahr fanden in Seoul die ersten Weltmeisterschaften statt. Seit 2017 heißt der Verband World Taekwondo (WT).",
      en: "The World Taekwondo Federation was founded in 1973, and the first World Championships took place in Seoul the same year. Since 2017 the federation has been called World Taekwondo (WT).",
      s: "taekwondonation.com",
    },
    {
      tk: "wt",
      de: "Das IOC erkannte die WT 1980 an. Bei den Spielen 1988 in Seoul und 1992 in Barcelona war Taekwondo Demonstrationssport, seit 2000 ist es olympische Medaillendisziplin.",
      en: "The IOC recognised WT in 1980. Taekwondo was a demonstration sport at the 1988 Seoul and 1992 Barcelona Games and has been an Olympic medal sport since 2000.",
      s: "Olympedia; taekwondonation.com",
    },
    {
      tk: "wt",
      de: "Die Deutsche Taekwondo Union (DTU) ist Mitglied der World Taekwondo, der European Taekwondo Union und des DOSB.",
      en: "The German Taekwondo Union (DTU) is a member of World Taekwondo, the European Taekwondo Union and the DOSB.",
      s: "Wikipedia",
    },
    {
      tk: "itf",
      de: "Die International Taekwon-Do Federation wurde am 22. März 1966 in Seoul von General Choi Hong-hi gegründet. Ihr Sitz ist seit 1985 Wien.",
      en: "The International Taekwon-Do Federation was founded on 22 March 1966 in Seoul by General Choi Hong-hi. Its seat has been Vienna since 1985.",
      s: "Wikipedia",
    },
    {
      tk: "itf",
      de: "Der ITF-D vertritt die International Taekwon-Do Federation in Deutschland.",
      en: "The ITF-D represents the International Taekwon-Do Federation in Germany.",
      s: "Wikipedia",
    },
  ];
  const TIPS = [
    {
      k: 1,
      de: "Low Kick: Mit dem Schienbein treffen, nicht mit dem Fuß – und die Hüfte ganz durchdrehen.",
      en: "Low kick: hit with the shin, not the foot – and turn the hip all the way through.",
    },
    {
      de: "Nach jeder Kombi bewegen: raus aus der Linie oder zurück in Deckung – nie stehen bleiben.",
      en: "Move after every combo: off the line or back into guard – never stand still.",
    },
    {
      nt: 1,
      de: "Haken: Ellbogen auf Schulterhöhe, die Faust dreht mit – die Kraft kommt aus der Drehung des vorderen Fußes.",
      en: "Hook: elbow at shoulder height, the fist turns with it – power comes from pivoting on the front foot.",
    },
    {
      k: 1,
      de: "Atmen nicht vergessen: Bei jedem Schlag und Kick kurz und scharf ausatmen.",
      en: "Don't forget to breathe: a short, sharp exhale with every punch and kick.",
    },
    {
      k: 1,
      de: "Sidekick: Ferse führt, Fußkante zeigt zum Ziel – und das Knie erst hoch anziehen, dann strecken.",
      en: "Side kick: heel leads, the edge of the foot points at the target – chamber the knee high first, then extend.",
    },
    {
      de: "Kinn runter, Augen hoch: So trifft dich weniger, und du siehst trotzdem alles.",
      en: "Chin down, eyes up: you get hit less and still see everything.",
    },
    {
      de: "Abstand ist Verteidigung: Bleib knapp außerhalb der Reichweite und komm nur zum Treffen rein.",
      en: "Distance is defence: stay just outside range and only step in to hit.",
    },
    {
      nt: 1,
      de: "Uppercut: Erst leicht in die Knie, dann aus Beinen und Hüfte nach oben – nicht ausholen.",
      en: "Uppercut: dip the knees slightly, then drive up from legs and hips – don't wind up.",
    },
    {
      nt: 1,
      de: "Jab: Die Schulter schützt das Kinn, und die Hand kommt auf derselben Linie zurück, auf der sie rausging.",
      en: "Jab: your shoulder covers your chin, and the hand returns on the same line it went out.",
    },
    {
      nt: 1,
      de: "Cross: Die Kraft kommt aus Hüfte und hinterem Fuß – die Ferse dreht mit nach außen.",
      en: "Cross: power comes from the hip and rear foot – turn the heel out with it.",
    },
    {
      nt: 1,
      de: "Haken: Ellbogen auf Fausthöhe, Rotation aus dem Rumpf. Nicht ausholen, sonst sieht man ihn kommen.",
      en: "Hook: elbow level with the fist, rotate from the trunk. Don't wind up, or they'll see it coming.",
    },
    {
      k: 1,
      de: "Roundhouse: Standfuß eindrehen, bis die Ferse zum Gegner zeigt – sonst fehlt die Hüfte.",
      en: "Roundhouse: pivot the standing foot until the heel points at your opponent – otherwise the hip is missing.",
    },
    {
      k: 1,
      de: "Sidekick: Erst das Knie hoch zur Brust ziehen, dann die Ferse auf gerader Linie rausstoßen.",
      en: "Side kick: chamber the knee to your chest first, then drive the heel out in a straight line.",
    },
    {
      k: 1,
      de: "Frontkick: Knie anheben, Hüfte nach vorn schieben, mit dem Ballen treffen und schnell zurückziehen.",
      en: "Front kick: lift the knee, push the hip forward, hit with the ball of the foot and retract fast.",
    },
    {
      k: 1,
      de: "Nach jedem Kick sofort die Hände zurück ans Kinn – die meisten Treffer kassiert man beim Absetzen.",
      en: "After every kick, hands straight back to the chin – most hits land while you're putting the foot down.",
    },
    {
      de: "Bei jedem Schlag kurz ausatmen. Das stabilisiert den Rumpf und verhindert, dass dir in Runde 3 die Luft ausgeht.",
      en: "Exhale sharply with every strike. It braces your core and keeps you from gassing out in round 3.",
    },
    {
      nt: 1,
      de: "Beinarbeit: Niemals die Füße kreuzen. Der Fuß in Bewegungsrichtung geht immer zuerst.",
      en: "Footwork: never cross your feet. The foot nearest the direction of travel always moves first.",
    },
    {
      k: 1,
      de: "Gedrehter Backkick: Erst dreht der Kopf, der Blick geht über die Schulter – dann löst du den Kick.",
      en: "Spinning back kick: turn your head first and look over your shoulder – then release the kick.",
    },
    {
      k: 1,
      de: "Fußfeger klappen über Timing, nicht über Kraft: fegen, wenn der Gegner das Gewicht auf den vorderen Fuß verlagert.",
      en: "Sweeps are about timing, not power: sweep as your opponent shifts weight onto the front foot.",
    },
    {
      de: "Kontrolle ist Technik: treffen und sofort zurückziehen, statt durchzuschlagen.",
      en: "Control is technique: touch and retract instantly instead of punching through.",
      d: ["lc", "kl"],
    },
    {
      de: "Plane deine 6 Kicks früh in der Runde ein. Wer am Ende nachzählt, verliert den Rhythmus.",
      en: "Get your 6 kicks in early in the round. Counting at the end breaks your rhythm.",
      d: ["fc"],
    },
    {
      de: "Low Kick: mit dem Schienbein treffen, nicht mit dem Fuß, und mit einer Hand vorher abdecken.",
      en: "Low kick: land with the shin, not the foot, and set it up behind a hand.",
      d: ["kl", "k1"],
    },
    {
      de: "Knie: Hüfte nach vorn schieben, Oberkörper aufrecht, beide Hände bleiben am Kopf.",
      en: "Knee: drive the hip forward, stay upright, both hands stay at your head.",
      d: ["k1"],
    },
    // boxing (b: 1): reminders of known basics, always with a reason for every defence; coach check recommended
    {
      b: 1,
      de: "Nach jedem Schlag die Hand auf demselben Weg zurück ans Kinn – die meisten Treffer fängt man beim Zurückziehen.",
      en: "After every punch bring the hand back to your chin along the same path – most hits land while you pull back.",
    },
    {
      b: 1,
      de: "Kopfbewegung braucht einen Grund: Stell dir den Jab des Gegners vor, dann erst abtauchen oder wegpendeln.",
      en: "Head movement needs a reason: picture the opponent's jab first, then slip or roll away.",
    },
    {
      b: 1,
      de: "Der Jab misst die Distanz. Triff mit ihm, bevor du eine Kombination startest, und geh danach seitlich aus der Linie.",
      en: "The jab measures the distance. Land it before you start a combination, then step off the line.",
    },
    {
      b: 1,
      de: "Wer meidet, kontert: Nach dem Abtauchen sofort mit Cross oder Körperhaken antworten und wieder aus der Linie gehen.",
      en: "Slip, then counter: after the slip answer straight away with a cross or body hook and leave the line again.",
    },
    {
      b: 1,
      de: "Bandagen: erst die Daumenschlaufe, dann das Handgelenk – fest, aber nicht abschnürend. Sie stützen das Handgelenk am Sandsack.",
      en: "Hand wraps: thumb loop first, then the wrist – firm, but not cutting off the blood. They support the wrist on the bag.",
    },
    {
      b: 1,
      de: "Sandsack wie Partner: Nach jeder Serie zurück in die Deckung und raus aus der Linie – kein Dauerfeuer ohne Rückkehr.",
      en: "Treat the bag like a partner: after every set back into your guard and off the line – no non-stop firing without returning.",
    },
    {
      b: 1,
      de: "Schultern locker lassen, bis du schlägst: Verspannte Schultern kosten Tempo und lassen dich in Runde 3 früher müde werden.",
      en: "Keep your shoulders loose until you punch: tight shoulders cost speed and tire you out sooner in round 3.",
    },
    {
      b: 1,
      de: "Körperhaken zuerst, dann zum Kopf: Der Körper zieht die Deckung des Gegners nach unten – das öffnet den Weg nach oben.",
      en: "Body hook first, then the head: the body pulls the opponent's guard down and opens the way upstairs.",
    },
    {
      b: 1,
      de: "Der Treffer kommt auf den ersten beiden Knöcheln, das Handgelenk bleibt gerade – locker bis zum Aufprall, dann fest schließen.",
      en: "Land on the first two knuckles with a straight wrist – relaxed until impact, then close the fist firmly.",
    },
    {
      tk: true,
      de: "Kicks beginnen in der Hüfte: Erst die Hüfte öffnen, dann das Bein werfen – so wird der Tritt schneller und schont das Knie.",
      en: "Kicks start at the hip: open the hip first, then throw the leg – faster, and easier on the knee.",
    },
    {
      tk: true,
      de: "Beim Rundkick dreht das Standbein mit: Ferse in Richtung Ziel drehen, sonst bremst die Hüfte.",
      en: "On a round kick the standing foot turns with it: rotate the heel towards the target or the hip gets blocked.",
    },
    {
      tk: true,
      de: "Bein nach dem Treffer sofort zurückziehen: Knie einziehen, dann absetzen – nicht fallen lassen.",
      en: "Pull the leg back right after impact: knee in first, then set down – don't let it drop.",
    },
    {
      tk: true,
      de: "Hände oben lassen, auch beim Treten. Eine fallende Deckung ist der häufigste Fehler bei Kicks.",
      en: "Keep your hands up while kicking. A dropping guard is the most common mistake on kicks.",
    },
    {
      tk: true,
      de: "Technik vor Höhe: Saubere Mittelhöhe schlägt wacklige Kopfhöhe. Die Höhe kommt mit der Beweglichkeit von selbst.",
      en: "Technique before height: a clean mid-level kick beats a wobbly head kick. Height follows flexibility.",
    },
    {
      tk: true,
      de: "Ausatmen beim Treffer: Das spannt die Körpermitte an und hält dich stabil.",
      en: "Breathe out on impact: it braces your core and keeps you stable.",
    },
    {
      tk: "wt",
      de: "Kicks starten aus der Bewegung, nicht aus dem Stand: Mit federnden Schritten auf dem Fußballen bleibst du ständig schussbereit.",
      en: "Kicks start from movement, not from standing still: bouncy steps on the balls of your feet keep you ready to fire.",
    },
    {
      tk: "wt",
      de: "Bei Doppelkicks das Knie zwischen den Tritten nicht absetzen – das spart Zeit und hält die Balance.",
      en: "On double kicks don't set the knee down between kicks – it saves time and keeps your balance.",
    },
    {
      tk: "wt",
      de: "Im WT-Kampf zählen saubere Treffer auf erlaubten Flächen: lieber zielgenau als wild.",
      en: "In WT sparring clean hits on legal target areas count: be accurate rather than wild.",
    },
    {
      tk: "wt",
      de: "Schneller Seitenwechsel (Wechselschritt) öffnet neue Winkel: Wer die Beinseite wechselt, kann mit Vorder- und Hinterbein gleich gut treten.",
      en: "A quick switch of leading leg opens new angles: if you can change sides, you kick equally well with front and back leg.",
    },
    {
      tk: "itf",
      de: "Im ITF-Training zählen auch Handtechniken: Faust, Handkante und Fingerspitzen gehören zur Kombi wie die Kicks.",
      en: "In ITF training hand techniques count too: fist, knife-hand and fingertips are part of the combination just like kicks.",
    },
    {
      tk: "itf",
      de: "Sinuswelle: Körper beim Schritt kurz anheben und beim Treffer senken – das Körpergewicht geht so in die Technik.",
      en: "Sine wave: rise slightly while stepping and sink on impact – this puts your body weight into the technique.",
    },
    {
      tk: "itf",
      de: "In den Tul zählen Rhythmus, Blickrichtung, Standtiefe und Genauigkeit – lieber langsam und exakt als schnell und schlampig.",
      en: "In the tul rhythm, facing, stance depth and precision count – slow and exact beats fast and sloppy.",
    },
    {
      tk: "itf",
      de: "Kontrolle vor Kraft: Im ITF-Sparring zählt die kontrolliert platzierte Technik, nicht der härteste Schlag.",
      en: "Control before power: in ITF sparring the well-placed, controlled technique counts, not the hardest blow.",
    },
  ];

