  /* ============ Guide: boxing topics + sport filter (shared topics stay, kickbox-only ones hide for boxers) ============
     Sources: DBV Wettkampfbestimmungen (linked, not copied), Olympedia, general training practice. Trainer review recommended. */
  const isBoxMain = () => mainSport() === "boxing";
  const BOX_ICO = {
    bag: '<path d="M12 3v3"/><rect x="7" y="6" width="10" height="14" rx="3"/><path d="M7 11h10"/>',
    hist: '<path d="M4 6h7a3 3 0 0 1 3 3v10a2 2 0 0 0-2-2H4z"/><path d="M20 6h-3a3 3 0 0 0-3 3"/>',
    rules: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>',
    gear: '<path d="M7 20h9v-3c2.2-.9 3.5-2.9 3.5-5.3V9.5A5.5 5.5 0 0 0 14 4h-3.5A5.5 5.5 0 0 0 5 9.5v3.2c0 1.7.7 3.2 2 4.1z"/><path d="M7 16.8h9"/>',
  };
  const BOX_READS = [
    {
      k: "bgear",
      ico: BOX_ICO.gear,
      de: {
        t: "Boxen: Handschuhe & Bandagen",
        sub: "Was du fürs Training brauchst – und worauf du achtest",
        secs: [
          ["Bandagen zuerst", "Bandagen stützen Handgelenk und Mittelhandknochen und saugen Schweiß auf. Wickle sie bei jedem Training neu und lass sie nach dem Waschen aufgerollt trocknen. Die Schritt-für-Schritt-Anleitung findest du unter „Bandagieren“."],
          ["Handschuhgewicht", "Handschuhe werden in Unzen (oz) angegeben, 1 oz sind 28,35 g. Fürs Sandsack- und Partnertraining nehmen viele Vereine eher schwerere, gut gepolsterte Handschuhe. Welches Gewicht im Wettkampf vorgeschrieben ist, steht in den DBV-Bestimmungen oder der Ausschreibung – frag zusätzlich deinen Trainer."],
          ["Passform", "Die Faust soll im Handschuh fest, aber nicht eingeklemmt sitzen. Der Daumen liegt am Handschuh an, das Klett schließt das Handgelenk sicher."],
          ["Pflege", "Nach dem Training lüften, innen mit Textilerfrischer einsprühen und offen trocknen lassen – nicht auf der Heizung. Mehr dazu unter „Materialpflege“."],
        ],
        src: "Allgemeine Trainingspraxis; Wettkampfgewichte: DBV-Wettkampfbestimmungen (nicht kopiert, nur verlinkt). Trainerprüfung empfohlen.",
      },
      en: {
        t: "Boxing: gloves & hand wraps",
        sub: "What you need for training – and what to look for",
        secs: [
          ["Wraps first", "Wraps support the wrist and the knuckle bones and soak up sweat. Wrap fresh every session and let them dry rolled up after washing. Step by step: see “Hand wraps”."],
          ["Glove weight", "Gloves are rated in ounces (oz); 1 oz is 28.35 g. For bag and partner work many clubs prefer heavier, well-padded gloves. The weight required in competition is set in the DBV rules or the invitation – also ask your coach."],
          ["Fit", "Your fist should sit snugly in the glove without being squeezed. The thumb rests against the glove and the strap secures the wrist."],
          ["Care", "Air them after training, spray the inside with a textile freshener and dry them open – not on a radiator. More under “Equipment care”."],
        ],
        src: "General training practice; competition weights: DBV competition rules (linked, not copied). Coach review recommended.",
      },
    },
    {
      k: "bag",
      ico: BOX_ICO.bag,
      de: {
        t: "Sandsacktraining",
        sub: "Den Sack wie einen Partner behandeln",
        secs: [
          ["Distanz", "Stell dich so, dass du den Sack mit gestrecktem Arm gerade berührst. Der Jab misst die Entfernung – danach kommt der Rest."],
          ["Als Gegner denken", "Stell dir vor, der Sack greift an: Nach jeder Kombination aus der Linie gehen, eine Kopfbewegung machen oder die Deckung schließen, bevor du neu startest."],
          ["Treffen, nicht schieben", "Triff mit den ersten beiden Knöcheln, die Faust dreht erst kurz vor dem Ziel ein, die Hand geht sofort zurück in die Deckung."],
          ["Locker bleiben", "Schultern locker, Atem raus bei jedem Schlag. Ein verkrampfter Arm ist langsam und ermüdet schnell."],
          ["Handgelenk schützen", "Bandagen immer, Handschuhe passend, und bei Schmerzen im Handgelenk die Runde beenden."],
        ],
        src: "Allgemeine Trainingspraxis. Trainerprüfung empfohlen.",
      },
      en: {
        t: "Heavy-bag work",
        sub: "Treat the bag like a partner",
        secs: [
          ["Distance", "Stand so that your outstretched arm just touches the bag. The jab measures the distance – the rest follows."],
          ["Think of an opponent", "Imagine the bag attacks: after each combination leave the line, move your head or close your guard before starting again."],
          ["Hit, don’t push", "Land with the first two knuckles, turn the fist in just before the target and bring the hand straight back to guard."],
          ["Stay loose", "Loose shoulders, breathe out on every punch. A tense arm is slow and tires fast."],
          ["Protect the wrist", "Always wrap, wear fitting gloves and end the round if the wrist hurts."],
        ],
        src: "General training practice. Coach review recommended.",
      },
    },
    {
      k: "bhist",
      ico: BOX_ICO.hist,
      de: {
        t: "Amateurboxen – kurze Geschichte",
        sub: "Von den antiken Spielen bis zu den heutigen Regeln",
        secs: [
          ["Antike", "Boxen stand bereits bei den antiken Olympischen Spielen auf dem Programm; die Olympedia nennt 688 v. Chr. als frühes Datum."],
          ["Moderne Spiele", "Bei den modernen Olympischen Spielen ist Boxen seit 1904 (St. Louis) dabei. 1912 in Stockholm fehlte es, seit Antwerpen 1920 gehört es immer zum Programm."],
          ["Frauen", "Olympisches Frauenboxen gibt es seit London 2012."],
          ["Regelentwicklung", "Seit 2009 boxen Männer im olympischen Turnier 3 × 3 Minuten statt zuvor 4 × 2 Minuten. 1974 fand die erste Amateur-Weltmeisterschaft statt."],
          ["Heute in Deutschland", "Der Deutsche Boxsport-Verband (DBV) regelt den Amateurbereich. Die aktuellen Wettkampfbestimmungen findest du über den Regel-Link."],
        ],
        src: "Olympedia (olympedia.org), Wikipedia „Boxing at the Summer Olympics“, DBV (boxverband.de)",
      },
      en: {
        t: "Amateur boxing – a short history",
        sub: "From the ancient games to today’s rules",
        secs: [
          ["Antiquity", "Boxing was already part of the ancient Olympic Games; Olympedia gives 688 BCE as an early date."],
          ["Modern Games", "Boxing has been in the modern Olympics since 1904 (St. Louis). It was missing in Stockholm 1912 and has been on the programme every time since Antwerp 1920."],
          ["Women", "Olympic women’s boxing has existed since London 2012."],
          ["Rule changes", "Since 2009 men box 3 × 3 minutes in the Olympic tournament instead of 4 × 2. The first amateur World Championships took place in 1974."],
          ["Today in Germany", "The German Boxing Federation (DBV) governs the amateur side. Find the current competition rules via the rules link."],
        ],
        src: "Olympedia (olympedia.org), Wikipedia “Boxing at the Summer Olympics”, DBV (boxverband.de)",
      },
    },
    {
      k: "brules",
      ico: BOX_ICO.rules,
      de: {
        t: "Boxen: Regeln & Links",
        sub: "Offizielle Quelle statt Abschrift",
        secs: [
          ["Offizielles Regelwerk", "Die DBV-Wettkampfbestimmungen (WKB, Stand 01.09.2026, gültig ab 01.11.2026) sind die Grundlage. Ringzeit kopiert sie nicht, sondern verlinkt sie – im Zweifel gilt immer das Original."],
          ["Altersklassen", "Nach Kalenderjahr: U13 (10–12), U15 (13–14), U17 (15–16), U19 (17–18), Erwachsene ab 19 bis zum Jahr des 40. Geburtstags."],
          ["Runden", "Es sind immer 3 Runden mit 1 Minute Pause. Die Rundenlänge hängt von der Klasse ab (U13 60 s, U15 90 s, U17 120 s, U19 und Erwachsene 180 s)."],
          ["Nach einem K.o.", "Nach einem K.o. gilt in Ringzeit eine Sperre von 30 Tagen im Plan. Bei Verdacht auf Gehirnerschütterung gehst du zum Arzt."],
          ["Ab 40", "Das Training mit 3 × 2 Minuten ist hier ein Trainingsformat und kein offizielles DBV-Format."],
        ],
        src: "DBV-Wettkampfbestimmungen (WKB) Stand 01.09.2026 – boxverband.de",
        link: true,
      },
      en: {
        t: "Boxing: rules & links",
        sub: "Official source instead of a copy",
        secs: [
          ["Official rule book", "The DBV competition rules (WKB, version 01.09.2026, in force from 01.11.2026) are the basis. Ringzeit does not copy them but links them – the original always prevails."],
          ["Age classes", "By calendar year: U13 (10–12), U15 (13–14), U17 (15–16), U19 (17–18), adults from 19 until the year of the 40th birthday."],
          ["Rounds", "Always 3 rounds with a 1-minute break. Round length depends on the class (U13 60 s, U15 90 s, U17 120 s, U19 and adults 180 s)."],
          ["After a KO", "After a KO Ringzeit plans a 30-day break. See a doctor if you suspect a concussion."],
          ["Over 40", "Training with 3 × 2 minutes is a training format here and not an official DBV format."],
        ],
        src: "DBV competition rules (WKB) version 01.09.2026 – boxverband.de",
        link: true,
      },
    },
  ];
  const readsFor = () =>
    isTkdMain() ? [...tkdReads(), ...READS.filter((r) => !r.only && r.k !== "mistakes").map(tkdShared)] : isBoxMain() ? [...BOX_READS, ...READS.filter((r) => !r.only)] : READS.filter((r) => r.only !== "b");
  const BOX_CARE_SKIP = 2; // shin and foot guards
  function guideSecs(kind) {
    const G = t("guide");
    if (isTkdMain()) {
      // no gloves/wraps (care 0, 1) and no Thai oil (aid 1); the KO line names a pause instead of the WAKO suspension
      if (kind === "care")
        return G.careSecs
          .filter((_, i) => i > 1)
          .map(([a, b]) => [a, b.replace(/^Wie Handschuhe: (.)/, (_, c) => c.toUpperCase()).replace(/^Like gloves: (.)/, (_, c) => c.toUpperCase()).replace("Ein Wäschenetz für die Bandagen und ein Beutel für nasse Sachen halten Ordnung.", "Ein Beutel für nasse Sachen hält Ordnung.").replace("A laundry bag for the wraps and a pouch for wet things keep it tidy.", "A pouch for wet things keeps it tidy.")]);
      return G.aidSecs
        .filter((_, i) => i !== 1)
        .map(([a, b]) => [a, b.replace(/die WAKO-Sperre nach K\.o\. gilt\./, "danach ist eine Pause nötig.").replace(/the WAKO suspension after a KO applies\./, "a break is needed afterwards.")]);
    }
    if (!isBoxMain()) return kind === "care" ? G.careSecs : G.aidSecs;
    if (kind === "care") return G.careSecs.filter((_, i) => i !== BOX_CARE_SKIP);
    return G.aidSecs.map(([a, b]) => (a === G.aidSecs[3][0] ? [a, b.replace(/die WAKO-Sperre nach K\.o\. gilt\./, "die K.o.-Sperre gilt.").replace(/the WAKO suspension after a KO applies\./, "the KO suspension applies.")] : [a, b]));
  }
