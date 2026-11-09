  /* ============ Guide: hand wraps (animated), gear care, care & first aid ============ */
  /* back of a left hand, thumb on the right; each wrapping step adds bandage strokes */
  const WRAP_HAND = `<g fill="#F2EEE7" stroke="#111318" stroke-width="3" stroke-linejoin="round">
      <rect x="98" y="196" width="64" height="62" rx="10"/>
      <rect x="76" y="58" width="22" height="58" rx="11"/><rect x="99" y="38" width="23" height="72" rx="11.5"/><rect x="123" y="32" width="23" height="78" rx="11.5"/><rect x="147" y="44" width="22" height="68" rx="11"/>
      <path d="M168 150 Q196 132 204 108 Q208 96 197 92 Q186 90 180 104 L166 128 Z"/>
      <path d="M78 104 Q74 160 92 196 L168 196 Q176 150 170 104 Z"/></g>`;
  const WRAP_STEPS = [
    ["M190 102 Q206 112 196 126 Q186 138 172 132 M172 132 L106 206"],
    ["M94 206 Q130 214 166 206", "M94 218 Q130 226 166 218", "M94 230 Q130 238 166 230"],
    ["M166 210 L82 120", "M76 112 Q124 120 172 112", "M76 124 Q124 132 172 124", "M76 136 Q124 144 172 136"],
    ["M98 108 L162 212", "M122 106 L98 212", "M146 108 L162 212"],
    ["M168 140 Q196 128 200 112 Q192 104 180 112 Q172 124 168 140"],
    ["M82 118 L160 196", "M168 118 L92 196", "M94 242 Q130 250 166 242", "M94 252 Q130 258 166 252"],
  ];
  /* the video the club recommends; it opens outside the app, nothing is embedded or loaded in advance */
  const WRAP_VIDEO = "https://youtube.com/shorts/A1avKDWZ5JQ";
  function wrapSvg(step) {
    let h = `<svg class="wrapsvg" viewBox="40 20 190 248" role="img" aria-label="${esc(t("guide").wrap)}">${WRAP_HAND}`;
    WRAP_STEPS.forEach((paths, i) => {
      if (i > step) return;
      const now = i === step;
      paths.forEach((d, k) => {
        h += `<path d="${d}" pathLength="1" class="${now ? "wnew" : ""}" style="${now ? `animation-delay:${(k * 0.35).toFixed(2)}s` : ""}" fill="none" stroke="${now ? "#E0525C" : "#9E2F38"}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="${now ? 0.95 : 0.8}"/>`;
      });
    });
    return h + `</svg>`;
  }
  function guideSheetHtml(o) {
    const G = t("guide"),
      secs = (list) =>
        list.map(([a, b]) => `<div class="gsec"><b>${esc(a)}</b><p>${esc(b)}</p></div>`).join("");
    if (o.id === "wrap") {
      const n = WRAP_STEPS.length,
        st = Math.max(0, Math.min(n - 1, o.step || 0));
      return `<h3>${G.wrap}</h3>${st === 0 ? `<p class="sub">${G.wrapIntro}</p>` : ""}<div class="wrapbox">${wrapSvg(st)}</div><div class="wstep"><small>${G.step(st + 1, n)}</small><p>${esc(G.wrapSteps[st])}</p></div><a class="vlink" href="${WRAP_VIDEO}" target="_blank" rel="noopener">▶ ${G.video}</a><div class="acts2"><button type="button" class="btn sec" data-wstep="${st - 1}" ${st === 0 ? "disabled" : ""}>${G.prev}</button>${st < n - 1 ? `<button type="button" class="btn" data-wstep="${st + 1}">${G.next}</button>` : `<button type="button" class="btn" data-wstep="0">${G.again}</button>`}</div>`;
    }
    const RL = readsFor(),
      rd = RL.findIndex((r) => r.k === o.id);
    if (rd >= 0) {
      const R = RL[rd][S.profile.lang === "de" ? "de" : "en"],
        nx = RL[(rd + 1) % RL.length];
      return `<h3>${esc(R.t)}</h3><p class="sub">${esc(R.sub)}</p>${secs(R.secs)}<p class="sub gsrc">${t("src")}: ${esc(R.src)}</p>${(R.links || []).map((l) => `<a class="vlink" href="${l.u}" target="_blank" rel="noopener">▶ ${esc(l[S.profile.lang === "de" ? "de" : "en"])}</a>`).join("")}${R.link ? `<a class="vlink" href="${WKB_URL}" target="_blank" rel="noopener">▶ ${S.profile.lang === "de" ? "DBV-Wettkampfbestimmungen (PDF, Stand 01.09.2026)" : "DBV competition rules (PDF, version 01.09.2026)"}</a>` : ""}<div class="acts2"><button type="button" class="btn sec" data-sx="close">${t("close")}</button><button type="button" class="btn" data-guide="${nx.k}">${G.nextRead}</button></div>`;
    }
    if (o.id === "care")
      return `<h3>${G.care}</h3>${secs(guideSecs("care"))}<div class="acts2"><button type="button" class="btn" data-sx="close">${t("close")}</button></div>`;
    return `<h3>${G.aid}</h3>${secs(guideSecs("aid"))}<div class="note warn">${G.aidNote}</div><div class="acts2"><button type="button" class="btn" data-sx="close">${t("close")}</button></div>`;
  }
  /* ============ Guide: articles to read (short sections, readable in a set rest) ============
     Rules: WAKO Ring Sports General Rules (ch. 2), WAKO K1 Style rules (ch. 10), WAKO Deutschland Ringsport Low Kick and
     Ringsport allgemeine Grundlagen (2021), WAKO Tatami General Rules; the theory cards (Point Fighting, LC/FC) above.
     Training science: general consensus of training theory and sports medicine; sleep: AASM recommendations. */
  const READS = [
    {
      k: "myths",
      ico: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.6"/><path d="M12 16.6h.01"/>',
      de: {
        t: "Mythen-Check",
        sub: "Muskelkater, Dehnen, Schwitzen – was stimmt wirklich?",
        secs: [
          [
            "„Muskelkater zeigt, dass das Training gut war.“ – Falsch",
            "Muskelkater kommt vor allem von ungewohnter Belastung, besonders beim Abbremsen von Bewegungen. Wer regelmäßig trainiert, bekommt weniger davon – und wird trotzdem stärker. Er ist kein Maßstab für Qualität.",
          ],
          [
            "„Dehnen vorher schützt vor Verletzungen.“ – Kaum belegt",
            "Langes, ruhiges Dehnen direkt vor dem Training kann die Schnellkraft sogar kurz senken. Besser ist ein dynamisches Aufwärmen mit Bewegungen aus dem Training. Ruhiges Dehnen passt danach oder in eine eigene Mobility-Einheit.",
          ],
          [
            "„Schwitzen verbrennt Fett.“ – Falsch",
            "Schweiß kühlt den Körper. Was nach dem Training auf der Waage fehlt, ist Wasser – nach dem Trinken ist es wieder da.",
          ],
          [
            "„Bauchtraining macht einen flachen Bauch.“ – Falsch",
            "Fett lässt sich nicht gezielt an einer Stelle abbauen. Rumpftraining lohnt sich trotzdem: Ein starker Rumpf überträgt die Kraft aus den Beinen in Schlag und Tritt und hält dich stabil.",
          ],
          [
            "„Viel hilft viel.“ – Falsch",
            "Stärker wirst du in der Erholung, nicht im Training selbst. Wer ohne Pausen immer mehr macht, wird langsamer, öfter krank und verletzt sich leichter. Deshalb plant Ringzeit Ruhetage und Entlastungswochen ein.",
          ],
          [
            "„Hanteln machen langsam.“ – Falsch",
            "Richtig dosiertes Krafttraining macht Schläge und Tritte eher schneller, weil du mehr Kraft in kurzer Zeit abrufen kannst. Entscheidend ist, die Technik weiter zu trainieren.",
          ],
        ],
        src: "Trainingslehre und Sportmedizin (allgemeiner Konsens)",
      },
      en: {
        t: "Myth check",
        sub: "Soreness, stretching, sweating – what's actually true?",
        secs: [
          [
            "“Sore muscles mean it was a good workout.” – False",
            "Soreness mostly comes from unfamiliar loads, especially when muscles brake a movement. If you train regularly you get less of it – and still get stronger. It is no measure of quality.",
          ],
          [
            "“Stretching beforehand prevents injuries.” – Hardly proven",
            "Long, static stretching right before training can even briefly reduce explosive power. A dynamic warm-up with movements from the session works better. Calm stretching fits afterwards or in a separate mobility session.",
          ],
          [
            "“Sweating burns fat.” – False",
            "Sweat cools the body. What's missing on the scale after training is water – it's back once you drink.",
          ],
          [
            "“Ab workouts give you a flat stomach.” – False",
            "You can't burn fat from one specific spot. Core training is still worth it: a strong trunk transfers power from the legs into punches and kicks and keeps you stable.",
          ],
          [
            "“More is always better.” – False",
            "You get stronger during recovery, not during training itself. Doing more and more without breaks makes you slower, ill more often and more prone to injury. That's why Ringzeit plans rest days and deload weeks.",
          ],
          [
            "“Weights make you slow.” – False",
            "Well-dosed strength training tends to make punches and kicks faster, because you can produce more force in a short time. What matters is that you keep training technique.",
          ],
        ],
        src: "Training theory and sports medicine (general consensus)",
      },
    },
    {
      k: "round",
      ico: '<path d="M3 12h3.5l2-5 3.5 10 2.5-7 1.5 2H21"/>',
      de: {
        t: "Was passiert in einer Runde?",
        sub: "Warum die zweite Minute härter ist als die erste",
        secs: [
          [
            "Die ersten Sekunden",
            "Für explosive Aktionen nutzt der Muskel einen kleinen Sofort-Speicher (Kreatinphosphat). Er reicht nur für Sekunden Vollgas, füllt sich in kurzen Pausen aber schnell wieder auf – deshalb wirken Finten und kurze Bewegungspausen.",
          ],
          [
            "Ab der zweiten Minute",
            "Dann kommt mehr Energie aus dem schnellen Zuckerabbau ohne Sauerstoff. Dabei sammelt sich Säure im Muskel an: Arme und Beine werden schwer, die Deckung sinkt. Das ist der Moment, in dem gute Kondition Kämpfe entscheidet.",
          ],
          [
            "Laktat ist kein Abfall",
            "Laktat wurde lange als Ursache für Müdigkeit und Muskelkater gesehen. Heute weiß man: Herz und Muskeln verwerten es als Brennstoff. Müde machen vor allem die Säure und der leere Sofort-Speicher.",
          ],
          [
            "Der Puls",
            "In einer harten Runde steigt er bis nahe ans Maximum. Wie fit du bist, zeigt sich in der Pause: Je schneller er in der ersten Minute fällt, desto besser erholst du dich.",
          ],
          [
            "Warum Grundlagenausdauer zählt",
            "Auch wenn eine Runde kurz und intensiv ist: Ein gutes Ausdauer-Fundament beschleunigt die Erholung in der Pause und zwischen den Kämpfen eines Turniertags. Deshalb stehen auch ruhige Läufe und Intervalle im Plan.",
          ],
        ],
        src: "Sportphysiologie (allgemeiner Konsens)",
      },
      en: {
        t: "What happens in a round?",
        sub: "Why the second minute is harder than the first",
        secs: [
          [
            "The first seconds",
            "For explosive actions the muscle uses a small instant store (creatine phosphate). It only lasts for seconds of all-out effort but refills quickly in short breaks – that's why feints and short movement pauses work.",
          ],
          [
            "From the second minute",
            "Then more energy comes from fast sugar breakdown without oxygen. Acid builds up in the muscle: arms and legs get heavy, the guard drops. This is where good conditioning decides fights.",
          ],
          [
            "Lactate is not waste",
            "Lactate was long blamed for fatigue and soreness. Today we know heart and muscles use it as fuel. What tires you is mainly the acid and the empty instant store.",
          ],
          [
            "Your pulse",
            "In a hard round it climbs close to your maximum. Fitness shows in the break: the faster it drops in the first minute, the better you recover.",
          ],
          [
            "Why base endurance matters",
            "Even though a round is short and intense, a good endurance base speeds up recovery in the break and between the bouts of a tournament day. That's why easy runs and intervals are in the plan too.",
          ],
        ],
        src: "Exercise physiology (general consensus)",
      },
    },
    {
      k: "shin",
      only: "k",
      ico: '<path d="M10 3c-.6 4-.6 8 0 12l-1.5 5h7l-1.5-5c.6-4 .6-8 0-12"/><path d="M9.6 8h4.8"/>',
      de: {
        t: "Warum Schienbeine härter werden",
        sub: "Was beim Abhärten passiert – und was Legende ist",
        secs: [
          [
            "Knochen passt sich an",
            "Knochen baut sich dort auf, wo er regelmäßig belastet wird (Wolffsches Gesetz). Das geht langsam: Es dauert Wochen bis Monate, nicht Tage.",
          ],
          [
            "Ein Teil ist Gewöhnung",
            "Am Anfang gewöhnen sich vor allem Haut, Gewebe und dein Empfinden an den Kontakt. Deshalb fühlt sich der Sandsack nach ein paar Wochen weniger schlimm an, lange bevor der Knochen sich verändert hat.",
          ],
          [
            "Pausen sind Teil davon",
            "Jede harte Belastung hinterlässt winzige Schäden, die in der Pause repariert werden. Wer zu früh zu viel will, riskiert Knochenhautreizungen oder Ermüdungsbrüche. Langsam steigern schlägt jeden Abkürzungsversuch.",
          ],
          [
            "Legende: Bäume und Flaschen",
            "Gegen Bäume treten oder mit Flaschen auf das Schienbein schlagen macht vor allem Prellungen und reizt die Knochenhaut. Sandsack und Pratzen mit sauberer Technik reichen völlig.",
          ],
          [
            "Warnzeichen",
            "Ein Schmerz genau an einer Stelle am Knochen, eine Schwellung oder Schmerzen in Ruhe oder nachts: Pause machen und ärztlich abklären lassen.",
          ],
          [
            "Kinder und Jugendliche",
            "Im Wachstum sind Knochen und Wachstumsfugen empfindlicher. Gezieltes Abhärten gehört nicht in diese Phase – Ringzeit lässt es bei Kindern deshalb weg.",
          ],
        ],
        src: "Wolffsches Gesetz; Sportmedizin (allgemeiner Konsens)",
      },
      en: {
        t: "Why shins get harder",
        sub: "What conditioning does – and what's legend",
        secs: [
          [
            "Bone adapts",
            "Bone builds up where it is loaded regularly (Wolff's law). That is slow: it takes weeks to months, not days.",
          ],
          [
            "Part of it is getting used to it",
            "At first it's mainly skin, tissue and your perception that get used to the contact. That's why the bag hurts less after a few weeks, long before the bone has changed.",
          ],
          [
            "Rest is part of it",
            "Every hard load leaves tiny damage that is repaired during rest. Wanting too much too soon risks shin splints or stress fractures. Building up slowly beats any shortcut.",
          ],
          [
            "Legend: trees and bottles",
            "Kicking trees or hitting your shins with bottles mostly causes bruises and irritates the bone lining. Bag and pads with clean technique are all you need.",
          ],
          [
            "Warning signs",
            "Pain at one exact spot on the bone, swelling, or pain at rest or at night: take a break and get it checked by a doctor.",
          ],
          [
            "Children and teenagers",
            "While growing, bones and growth plates are more sensitive. Targeted conditioning doesn't belong in this phase – that's why Ringzeit leaves it out for children.",
          ],
        ],
        src: "Wolff's law; sports medicine (general consensus)",
      },
    },
    {
      k: "judge",
      only: "k",
      ico: '<path d="M12 4v16"/><path d="M5 8h14"/><path d="M5 8l-3 6h6z"/><path d="M19 8l-3 6h6z"/><path d="M8 20h8"/>',
      de: {
        t: "Wie Punktrichter werten",
        sub: "Warum ein sauberer Jab mehr zählt als ein wilder Schwinger",
        secs: [
          [
            "Point Fighting",
            "Nach jedem Treffer wird unterbrochen. Die Seitenrichter zeigen an, ob und für wen es einen Punkt gibt: Schlag, Tritt zum Körper und Fußfeger 1, Tritt zum Kopf und gesprungener Tritt zum Körper 2, gesprungener Tritt zum Kopf 3.",
          ],
          [
            "Light Contact und Kick Light",
            "Es wird durchgekämpft. Drei Seitenrichter zählen die Treffer laufend elektronisch mit, nach denselben Punktwerten wie im Point Fighting.",
          ],
          [
            "Im Ring: die fünf Kriterien",
            "Mindestens drei Punktrichter werten. Ein Treffer zählt nur, wenn alles stimmt: saubere Technik, Kraft, Wachsamkeit (Deckung, Blick), Timing und Distanz und sportliche Haltung. Geblockte, gestreifte oder geschobene Techniken zählen nicht.",
          ],
          [
            "Extrapunkte und Abzüge",
            "Ein Niederschlag gibt im Ring einen zusätzlichen Punkt. Ein Minuspunkt wiegt drei Trefferpunkte auf. Im Full Contact zählt ein Kickzähler mit: Wer weniger als 6 Kicks pro Runde schafft, bekommt einen Minuspunkt. Auf der Tatami kostet jedes Verlassen der Fläche einen Punkt.",
          ],
          [
            "Was das fürs Training heißt",
            "Klare, saubere Techniken mit Kontakt sind mehr wert als viele halbe. Nach dem Treffer sofort zurück in die Deckung – Wachsamkeit wird mitbewertet. Und: Kombinationen gezielt beenden, statt sich festzuschlagen.",
          ],
        ],
        src: "WAKO-Regelwerke (Ringsport allgemein, Tatami, Point Fighting, Light Contact)",
      },
      en: {
        t: "How judges score",
        sub: "Why a clean jab counts for more than a wild swing",
        secs: [
          [
            "Point fighting",
            "After every hit the bout is stopped. The judges signal whether and for whom a point is awarded: punch, kick to the body and foot sweep 1, kick to the head and jumping kick to the body 2, jumping kick to the head 3.",
          ],
          [
            "Light contact and kick light",
            "The fight is continuous. Three judges count hits live on electronic devices, using the same point values as in point fighting.",
          ],
          [
            "In the ring: the five criteria",
            "At least three judges score. A hit only counts if everything is right: clean technique, power, awareness (guard, focus), timing and distance, and sporting attitude. Blocked, brushed or pushing techniques don't score.",
          ],
          [
            "Extra points and deductions",
            "In the ring a knockdown gives an extra point. A minus point outweighs three scoring points. In full contact a kick counter keeps track: fewer than 6 kicks in a round means a minus point. On the tatami, every exit costs a point.",
          ],
          [
            "What that means for training",
            "Clear, clean techniques with contact are worth more than many half ones. After a hit, get your guard back at once – awareness is scored too. And finish combinations deliberately instead of getting stuck brawling.",
          ],
        ],
        src: "WAKO rules (ring sports general, tatami, point fighting, light contact)",
      },
    },
    {
      k: "disc",
      only: "k",
      ico: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
      de: {
        t: "Die Disziplinen im Vergleich",
        sub: "Von Point Fighting bis K1 – welcher Typ passt wohin?",
        secs: [
          [
            "Point Fighting · Tatami",
            "Stop-and-go wie beim Fechten: kontrollierte, blitzschnelle Treffer, nach jedem wird unterbrochen. Gekämpft wird mit offenen Handschuhen. Für Schnelle und Taktiker.",
          ],
          [
            "Light Contact · Tatami",
            "Durchkämpfen mit leichtem, kontrolliertem Kontakt und 10-oz-Handschuhen. Schläge und Tritte zu Kopf und Körper, keine Tritte gegen die Beine. Für alle, die fließende Schlagabtausche mögen.",
          ],
          [
            "Kick Light · Tatami",
            "Wie Light Contact, zusätzlich mit Low Kicks gegen den Oberschenkel. Ein guter Schritt Richtung K1, ohne volle Härte.",
          ],
          [
            "Full Contact · Ring",
            "Volle Kraft, ein K. o. ist möglich. Treffer nur oberhalb des Gürtels, keine Tritte gegen die Beine, mindestens 6 Kicks pro Runde. Gekämpft wird in langen Hosen.",
          ],
          [
            "Low Kick · Ring",
            "Wie Full Contact, dazu Tritte gegen Oberschenkel innen, außen und hinten. Keine Knie. Gekämpft wird in Shorts.",
          ],
          [
            "K1 Style · Ring",
            "Low Kicks, Knie zu Beinen, Körper und Kopf, ein kurzer Clinch für einen einzelnen Kniestoß, auch der gedrehte Backfist ist erlaubt. Ellbogen sind verboten. Die härteste WAKO-Disziplin.",
          ],
          [
            "Musical Forms",
            "Choreografierte Formen zur Musik, mit oder ohne Waffe. Bewertet werden Technik, Schwierigkeit und Ausdruck – ganz ohne Gegner.",
          ],
          [
            "In Ringzeit",
            "Ringzeit plant für Light Contact, Kick Light, Full Contact und K1 Style. Die Ring-Disziplinen sind – wie bei der WAKO – erst ab 15 Jahren wählbar. Technikniveau und körperliche Dosierung werden getrennt eingestellt.",
          ],
        ],
        src: "WAKO-Regelwerke (Tatami allgemein, Ringsport allgemein, Low Kick, K1 Style)",
      },
      en: {
        t: "The disciplines compared",
        sub: "From point fighting to K1 – which type fits where?",
        secs: [
          [
            "Point fighting · tatami",
            "Stop-and-go like fencing: controlled, lightning-fast hits, the bout stops after each one. Fought with open-hand gloves. For the quick and the tacticians.",
          ],
          [
            "Light contact · tatami",
            "Continuous fighting with light, controlled contact and 10 oz gloves. Punches and kicks to head and body, no kicks to the legs. For everyone who likes flowing exchanges.",
          ],
          [
            "Kick light · tatami",
            "Like light contact, plus low kicks to the thigh. A good step towards K1 without full power.",
          ],
          [
            "Full contact · ring",
            "Full power, a KO is possible. Hits only above the belt, no kicks to the legs, at least 6 kicks per round. Fought in long trousers.",
          ],
          [
            "Low kick · ring",
            "Like full contact, plus kicks to the inside, outside and back of the thigh. No knees. Fought in shorts.",
          ],
          [
            "K1 style · ring",
            "Low kicks, knees to legs, body and head, a short clinch for a single knee, and the spinning backfist is allowed. Elbows are banned. The hardest WAKO discipline.",
          ],
          [
            "Musical forms",
            "Choreographed forms to music, with or without a weapon. Technique, difficulty and expression are judged – no opponent at all.",
          ],
          [
            "In Ringzeit",
            "Ringzeit plans for light contact, kick light, full contact and K1 style. As at WAKO, the ring disciplines unlock only from age 15 ; technical experience is selected separately from fitness.",
          ],
        ],
        src: "WAKO rules (tatami general, ring sports general, low kick, K1 style)",
      },
    },
    {
      k: "day",
      only: "k",
      ico: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17"/><path d="M8 3v4M16 3v4"/><path d="M8 14.5h3"/>',
      de: {
        t: "Der Turniertag von innen",
        sub: "Vom Wiegen bis zur Siegerehrung – was beim ersten Mal keiner weiß",
        secs: [
          [
            "Vorher",
            "Lies die Ausschreibung genau: Zeiten, Ort und Ablauf des Wiegens, erlaubte Ausrüstung. Für WAKO-Turniere brauchst du einen Sportpass mit gültiger ärztlicher Untersuchung – sie gilt jeweils ein Jahr. Die Packliste in Ringzeit hilft beim Einpacken.",
          ],
          [
            "Das Wiegen",
            "Es gibt keine Toleranz: Du musst auf oder unter dem Limit deiner Klasse liegen. Gewogen wird ohne Kleidung, je nach Turnier am Vortag oder am Morgen. Bei WAKO-Meisterschaften im Ringsport wird zusätzlich jeden Morgen gewogen. Wer drüber liegt, hat meist nur einen kurzen zweiten Versuch.",
          ],
          [
            "Arzt und Kontrolle",
            "Ein Arzt erklärt dich vor dem Wettkampf für kampffähig. Direkt vor dem Kampf prüfen die Kampfrichter Bandagen, Handschuhe und Schutzausrüstung – sie muss WAKO-zugelassen sein, und der Mundschutz muss richtig sitzen.",
          ],
          [
            "Warten gehört dazu",
            "Turniertage sind lang, Zeitpläne verschieben sich fast immer. Nimm Trinkflasche, leicht verdauliche Snacks und warme Kleidung mit. Wärm dich etwa 15–20 Minuten vor deinem Aufruf auf und bleib bei Verzögerungen locker in Bewegung.",
          ],
          [
            "Zwischen den Kämpfen",
            "Trinken, etwas Leichtes essen, warm halten. Kurz vor dem nächsten Kampf wieder aktivieren: ein paar Runden Schattenboxen, Puls hochbringen.",
          ],
          [
            "Danach",
            "Siegerehrungen sind oft erst am Ende des Tages. Trag dein Ergebnis in Ringzeit ein, mit dem, was gut lief und was du verbessern willst – das macht den nächsten Trainingsblock gezielter.",
          ],
        ],
        src: "WAKO-Regelwerke (Ringsport allgemein, Tatami allgemein, Ringsport Grundlagen WAKO Deutschland); im Zweifel gilt die Ausschreibung",
      },
      en: {
        t: "Tournament day from the inside",
        sub: "From weigh-in to medal ceremony – what nobody tells you the first time",
        secs: [
          [
            "Before",
            "Read the invitation carefully: times, place and procedure of the weigh-in, permitted equipment. For WAKO tournaments you need a sports pass with a valid medical exam – it is valid for one year. The packing list in Ringzeit helps you pack.",
          ],
          [
            "The weigh-in",
            "There is no tolerance: you must be on or below your class limit. Weighing is done undressed, the day before or in the morning depending on the event. At WAKO championships in ring sports there is also a weigh-in every morning. If you're over, you usually only get one short second attempt.",
          ],
          [
            "Doctor and checks",
            "A doctor declares you fit to fight before the competition. Right before the bout the officials check hand wraps, gloves and protective gear – it must be WAKO-approved, and the mouthguard must fit properly.",
          ],
          [
            "Waiting is part of it",
            "Tournament days are long and schedules almost always shift. Bring a water bottle, easily digestible snacks and warm clothes. Warm up about 15–20 minutes before your call and keep moving lightly if things are delayed.",
          ],
          [
            "Between bouts",
            "Drink, eat something light, stay warm. Shortly before the next bout, activate again: a few rounds of shadow boxing, bring your pulse up.",
          ],
          [
            "Afterwards",
            "Medal ceremonies are often at the end of the day. Log your result in Ringzeit with what went well and what you want to improve – it makes the next training block more targeted.",
          ],
        ],
        src: "WAKO rules (ring sports general, tatami general, WAKO Germany ring sports basics); the invitation always prevails",
      },
    },
    {
      k: "mistakes",
      ico: '<path d="M12 3.5 21 19H3z"/><path d="M12 9.5v4.5"/><path d="M12 16.8h.01"/>',
      de: {
        t: "Die häufigsten Anfängerfehler",
        sub: "Fünf Dinge, die fast jeder am Anfang macht",
        secs: [
          [
            "1. Die Hände fallen",
            "Nach dem Schlag oder Kick bleibt die Hand unten. Der Rückweg in die Deckung gehört zur Technik – genau dann kommt der Konter.",
          ],
          [
            "2. Stehenbleiben nach der Kombi",
            "Wer nach dem letzten Treffer auf der Stelle steht, ist das nächste Ziel. Danach immer bewegen: raus aus der Linie oder zurück in Deckung.",
          ],
          [
            "3. Luft anhalten",
            "Wer bei Schlägen die Luft anhält, ist nach einer Minute platt. Bei jedem Treffer kurz und scharf ausatmen – das gibt Spannung und hält dich frisch.",
          ],
          [
            "4. Alles mit voller Kraft",
            "Verkrampfte Schultern machen langsam und müde. Locker bleiben und erst im Treffpunkt fest werden – Schnelligkeit kommt aus Lockerheit.",
          ],
          [
            "5. Aufwärmen und Pausen auslassen",
            "Kalt ins Sparring oder ohne Ruhetage durchtrainieren führt zu Zerrungen und Leistungsknick. Aufwärmen und Erholung sind Teil des Trainings.",
          ],
          [
            "Bonus: nur die Lieblingstechnik",
            "Wer immer dasselbe macht, wird berechenbar. Gute Kämpfer variieren Höhe, Rhythmus und Seite.",
          ],
        ],
        src: "Trainerpraxis (allgemeiner Konsens)",
      },
      en: {
        t: "The most common beginner mistakes",
        sub: "Five things almost everyone does at first",
        secs: [
          [
            "1. Dropping the hands",
            "After the punch or kick the hand stays down. Returning to guard is part of the technique – that's exactly when the counter comes.",
          ],
          [
            "2. Standing still after the combo",
            "Whoever stands still after the last hit is the next target. Always move afterwards: off the line or back into guard.",
          ],
          [
            "3. Holding your breath",
            "Holding your breath while punching leaves you exhausted after a minute. Breathe out short and sharp with every strike – it gives tension and keeps you fresh.",
          ],
          [
            "4. Everything at full power",
            "Tense shoulders make you slow and tired. Stay loose and only tighten on impact – speed comes from being relaxed.",
          ],
          [
            "5. Skipping warm-up and rest",
            "Sparring cold or training without rest days leads to strains and a performance dip. Warm-up and recovery are part of training.",
          ],
          [
            "Bonus: only your favourite technique",
            "Doing the same thing every time makes you predictable. Good fighters vary height, rhythm and side.",
          ],
        ],
        src: "Coaching practice (general consensus)",
      },
    },
    {
      k: "mind",
      ico: '<path d="M12 20c-4.5 0-8-3.4-8-7.6C4 7.9 7.6 4 12 4s8 3.9 8 8.4c0 4.2-3.5 7.6-8 7.6z"/><path d="M8.5 12.5c1 1.4 2.2 2 3.5 2s2.5-.6 3.5-2"/><path d="M9 9.5h.01M15 9.5h.01"/>',
      de: {
        t: "Kopf und Nerven",
        sub: "Lampenfieber, Routinen und warum Profis atmen üben",
        secs: [
          [
            "Lampenfieber ist normal",
            "Herzklopfen, flaues Gefühl, ständig aufs Klo: Das ist Adrenalin. Es macht dich wach und schnell – dein Körper bereitet sich auf Leistung vor. Auch erfahrene Kämpfer haben es.",
          ],
          [
            "Routinen geben Halt",
            "Immer der gleiche Ablauf vor dem Kampf – Bandagieren, Aufwärmen, vielleicht dieselbe Musik – signalisiert dem Kopf: alles bekannt. Probier deine Routine schon im Training aus.",
          ],
          [
            "Atmen beruhigt",
            "Länger aus- als einatmen beruhigt den Puls, zum Beispiel 4 Sekunden ein, 6 Sekunden aus, ein paar Minuten lang. Das funktioniert auch in der Rundenpause.",
          ],
          [
            "Auf die Aufgabe schauen",
            "Nimm dir ein, zwei konkrete Punkte vor, etwa „nach jeder Kombi raus aus der Linie“. Wer nur ans Ergebnis denkt, verkrampft.",
          ],
          [
            "Nach dem Kampf",
            "Egal wie es ausging: Notier dir, was gut lief und was du verbessern willst. Ringzeit fragt nach dem Turnier danach – so wird jeder Kampf zur Trainingseinheit.",
          ],
        ],
        src: "Sportpsychologie (allgemeiner Konsens)",
      },
      en: {
        t: "Mind and nerves",
        sub: "Stage fright, routines and why pros practise breathing",
        secs: [
          [
            "Nerves are normal",
            "Pounding heart, queasy stomach, constant toilet trips: that's adrenaline. It makes you alert and fast – your body is getting ready to perform. Experienced fighters feel it too.",
          ],
          [
            "Routines give you footing",
            "The same sequence before every bout – wrapping, warm-up, maybe the same music – tells your mind: all familiar. Try your routine out in training.",
          ],
          [
            "Breathing calms you",
            "Breathing out longer than in calms your pulse, for example 4 seconds in, 6 seconds out for a few minutes. It also works in the break between rounds.",
          ],
          [
            "Focus on the task",
            "Set yourself one or two concrete points, like “move off the line after every combo”. Thinking only about the result makes you tense.",
          ],
          [
            "After the bout",
            "Whatever the result: note what went well and what you want to improve. Ringzeit asks about it after the tournament – so every bout becomes a training session.",
          ],
        ],
        src: "Sport psychology (general consensus)",
      },
    },
    {
      k: "sleep",
      ico: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
      de: {
        t: "Schlaf und Erholung",
        sub: "Warum der Fortschritt in der Pause passiert",
        secs: [
          [
            "Training ist der Reiz, Erholung der Fortschritt",
            "Im Training belastest du den Körper, stärker wird er danach: Er repariert und baut ein bisschen mehr auf als vorher. Ohne Erholung bleibt nur die Ermüdung.",
          ],
          [
            "Wie viel Schlaf?",
            "Empfohlen werden für Erwachsene mindestens 7 Stunden, für Jugendliche 8–10 Stunden. Im Tiefschlaf schüttet der Körper besonders viel Wachstumshormon aus.",
          ],
          [
            "Was zu wenig Schlaf kostet",
            "Reaktion, Koordination und Kraft lassen nach, das Verletzungsrisiko steigt, und du wirst leichter krank. Eine kurze Nacht vor dem Training ist kein Drama – viele hintereinander schon.",
          ],
          [
            "Besser schlafen",
            "Feste Zeiten, dunkles und kühles Zimmer, das Handy vor dem Einschlafen weglegen. Nach spätem Training hilft ein ruhiger Übergang: duschen, etwas essen, runterfahren.",
          ],
          [
            "Warnzeichen für zu viel",
            "Dauerhaft erhöhter Ruhepuls, schlechter Schlaf, keine Lust mehr, sinkende Leistung trotz Training: Das sind Zeichen, kürzerzutreten. Ringzeit fragt deshalb nach Tagesform und Anstrengung.",
          ],
        ],
        src: "Schlafmedizin (AASM-Empfehlungen); Trainingslehre",
      },
      en: {
        t: "Sleep and recovery",
        sub: "Why progress happens during rest",
        secs: [
          [
            "Training is the stimulus, recovery the progress",
            "Training stresses the body; it gets stronger afterwards by repairing and building up a little more than before. Without recovery, only fatigue remains.",
          ],
          [
            "How much sleep?",
            "Recommendations are at least 7 hours for adults and 8–10 hours for teenagers. During deep sleep the body releases a lot of growth hormone.",
          ],
          [
            "What too little sleep costs",
            "Reaction, coordination and strength drop, injury risk rises and you get ill more easily. One short night before training is no drama – many in a row are.",
          ],
          [
            "Sleeping better",
            "Fixed times, a dark and cool room, put the phone away before sleep. After late training, a calm transition helps: shower, eat something, wind down.",
          ],
          [
            "Signs of too much",
            "A resting pulse that stays raised, poor sleep, no motivation, performance dropping despite training: signs to ease off. That's why Ringzeit asks about your daily form and effort.",
          ],
        ],
        src: "Sleep medicine (AASM recommendations); training theory",
      },
    },
    {
      k: "gloves",
      only: "k",
      ico: '<path d="M7 20h9v-3c2.2-.9 3.5-2.9 3.5-5.3V9.5A5.5 5.5 0 0 0 14 4h-3.5A5.5 5.5 0 0 0 5 9.5v3.2c0 1.7.7 3.2 2 4.1z"/><path d="M7 16.8h9"/>',
      de: {
        t: "Handschuhe erklärt",
        sub: "Was 10, 12 oder 16 Unzen bedeuten",
        secs: [
          [
            "Was die Zahl heißt",
            "Handschuhe werden in Unzen (oz) angegeben: 1 oz sind 28,35 g, ein 10-oz-Handschuh wiegt also rund 283 g. Mehr Gewicht heißt vor allem mehr Polster.",
          ],
          [
            "Im Wettkampf",
            "Bei der WAKO gilt: Light Contact, Kick Light und alle Ring-Disziplinen mit geschlossenen 10-oz-Handschuhen, Point Fighting mit offenen Handschuhen. Sie müssen WAKO-zugelassen sein – im Zweifel steht es in der Ausschreibung.",
          ],
          [
            "Im Sparring",
            "Hier sind schwerere Handschuhe üblich, oft 12–16 oz je nach Körpergewicht. Das Mehr an Polster schützt vor allem deinen Partner. Was in deinem Verein gilt, sagt dir dein Trainer.",
          ],
          [
            "Am Sandsack",
            "Viele nutzen dafür eigene Handschuhe. Das Polster wird am Sack schneller hart und platt – im Sparring schützt so ein Handschuh dann schlechter.",
          ],
          [
            "Wann neue fällig sind",
            "Wenn du die Knöchel durchs Polster spürst, Nähte aufgehen oder das Polster eingedrückt bleibt. Gute Pflege verlängert das Leben deutlich – siehe Materialpflege.",
          ],
          [
            "Bandagen nicht vergessen",
            "Handschuhe schützen den Gegner und die Knöchel, Bandagen stabilisieren Mittelhand und Handgelenk. Beides gehört zusammen – im Wettkampf ist beides Pflicht.",
          ],
        ],
        src: "WAKO-Regelwerke (Ringsport allgemein, Tatami allgemein); 1 oz = 28,35 g",
      },
      en: {
        t: "Gloves explained",
        sub: "What 10, 12 or 16 ounces mean",
        secs: [
          [
            "What the number means",
            "Gloves are measured in ounces (oz): 1 oz is 28.35 g, so a 10 oz glove weighs about 283 g. More weight mainly means more padding.",
          ],
          [
            "In competition",
            "At WAKO: light contact, kick light and all ring disciplines use closed 10 oz gloves, point fighting uses open-hand gloves. They must be WAKO-approved – when in doubt, check the invitation.",
          ],
          [
            "In sparring",
            "Heavier gloves are common here, often 12–16 oz depending on body weight. The extra padding mainly protects your partner. Your coach will tell you what applies in your club.",
          ],
          [
            "On the bag",
            "Many use separate gloves for it. The padding gets hard and flat faster on the bag – such a glove then protects less in sparring.",
          ],
          [
            "When it's time for new ones",
            "When you feel your knuckles through the padding, seams open or the padding stays dented. Good care extends their life a lot – see equipment care.",
          ],
          [
            "Don't forget hand wraps",
            "Gloves protect the opponent and your knuckles, wraps stabilise hand and wrist. Both belong together – in competition both are mandatory.",
          ],
        ],
        src: "WAKO rules (ring sports general, tatami general); 1 oz = 28.35 g",
      },
    },
  ];
  const GUIDE_ICO = {
    wrap: '<circle cx="8" cy="12" r="4.5"/><circle cx="8" cy="12" r="1.6"/><path d="M8 7.5h10.5v9H8"/><path d="M13 7.5v9"/>',
    care: '<path d="M8 20h8v-3.2c2.4-.9 3.5-2.9 3.5-5.3V9a5 5 0 0 0-5-5H11a5 5 0 0 0-5 5v3.5c0 1.8.8 3.3 2 4.3z"/><path d="M8 16.8h8"/><path d="M10 11h3.5a2 2 0 0 0 2-2"/>',
    aid: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><path d="M12 8.5v7M8.5 12h7"/>',
  };
  function guidePanelHtml() {
    const G = t("guide"),
      row = (k) =>
        `<button type="button" class="grow" data-guide="${k}"><span class="gico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${GUIDE_ICO[k]}</svg></span><b>${G[k]}</b><span class="chev">›</span></button>`;
    const lg = S.profile.lang === "de" ? "de" : "en",
      read = (r) =>
        `<button type="button" class="grow" data-guide="${r.k}"><span class="gico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${r.ico}</svg></span><span class="gtx"><b>${esc(r[lg].t)}</b><small>${esc(r[lg].sub)}</small></span><span class="chev">›</span></button>`;
    return `<div class="panel"><div class="field"><span class="lab">${G.title}</span><span class="sub">${isBoxMain() ? G.hintBox : isTkdMain() ? G.hintTkd : G.hint}</span></div><span class="glab">${G.practical}</span><div class="glist">${isTkdMain() ? "" : row("wrap")}${row("care")}${row("aid")}</div><span class="glab">${G.reads}</span><div class="glist">${readsFor().map(read).join("")}</div></div>`;
  }
