  /* ============ Guide: Taekwondo topics (6d) ============
     Style-dependent (WT / ITF-D), built on demand from the sport modules so that grades, waiting times, forms and terms
     can never drift from the plans. Sources: DTU Prüfungsordnung (R3c), ITF-D Prüfungsordnung (R4a), Kukkiwon
     terminology (R3d), ITF Tournament Rules (R4c); history: Wikipedia, taekwondonation.com, Olympedia. Trainer review recommended. */
  const isTkdMain = () => mainSport() === "taekwondo";
  const TKD_ICO = {
    belt: '<path d="M3 10h18v4H3z"/><path d="M11 14l-2 6M13 14l2 6"/>',
    grade: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h4"/>',
    terms: '<path d="M4 5h16v10H9l-4 4v-4H4z"/><path d="M8 9h8M8 12h5"/>',
    hist: '<path d="M4 6h7a3 3 0 0 1 3 3v10a2 2 0 0 0-2-2H4z"/><path d="M20 6h-3a3 3 0 0 0-3 3"/>',
  };
  function tkdReads() {
    const st = tkdStyle(),
      itf = st === "itf",
      T = itf ? ITFT.TECH : TKDT.TECH,
      gt = (code, lg) => TKDT.gradeText(code, lg),
      codes = ["k9", "k8", "k7", "k6", "k5", "k4", "k3", "k2", "k1", "d1"],
      waits = (lg) => codes.map((c) => `${gt(c, lg)} ${TKDT.WAIT[st][c]}`).join(" · "),
      forms = (lg) =>
        itf
          ? Object.entries(TKDT.ITF_TUL).map(([c, n]) => `${gt(c, lg)}: ${n}`).join(" · ")
          : Object.entries(TKDT.WT_FORM)
              .filter(([c]) => c !== "p1")
              .map(([c, f]) => `${gt(c, lg)}: ${f[1]}`)
              .join(" · "),
      terms = (lg) =>
        Object.values(T)
          .filter((x) => x[2] && !/\(Kopf\)|→/.test(x[0] + x[2]))
          .map((x) => `${lg === "de" ? x[0] : x[1]} – ${x[2]}`)
          .join("; "),
      lnkWt = [
        { u: "https://www.dtu.de/downloads/regelwerke-co", de: "DTU-Regelwerke (Prüfungsordnung, Wettkampfordnung)", en: "DTU rule books (grading and competition regulations)" },
      ],
      lnkItf = [
        { u: "https://www.itf-d.de/api/public/res/file-manager/downloads/rules/67b44df9564df.pdf", de: "ITF-D Prüfungsordnung (PDF)", en: "ITF-D grading regulations (PDF)" },
        { u: "https://www.itf-d.de/api/public/res/file-manager/downloads/rules/63a9cc9056659.pdf", de: "ITF-D Wettkampfordnung (PDF)", en: "ITF-D competition rules (PDF)" },
      ];
    return [
      {
        k: "tbelt",
        ico: TKD_ICO.belt,
        de: {
          t: "Gürtel binden & Dobok",
          sub: "So sitzt der Gürtel – und so bleibt der Anzug in Form",
          secs: [
            ["Gürtel binden", "Gürtelmitte auf den Bauchnabel legen, einmal um den Körper führen, hinten kreuzen und vorn wieder zusammenführen. Ein Ende unter beiden Lagen durchziehen und mit einem Flachknoten schließen. Beide Enden sollen am Ende gleich lang sein."],
            ["Respekt vor dem Gürtel", "In vielen Schulen wird der Gürtel mit Respekt behandelt und nicht achtlos auf den Boden geworfen. Frag deinen Trainer nach den Gepflogenheiten im Verein."],
            ["Dobok richtig tragen", "Die Jacke schließen und mit dem Gürtel auf Hüfthöhe halten; die Hose darf nicht über den Boden schleifen. Ein Dobok sitzt locker genug für hohe Tritte, aber nicht so weit, dass du dich darin verfängst."],
            ["Pflege", "Nach dem Training lüften und nach Pflegeetikett waschen, Farbgürtel getrennt von hellen Teilen. Nicht heiß trocknen – die Baumwolle läuft sonst ein."],
            ["Schutzausrüstung", itf ? "Welche Schutzausrüstung bei ITF-D-Turnieren vorgeschrieben ist, steht in der Wettkampfordnung des ITF-D und in der Ausschreibung. Die Packliste im Turnierbereich ist daran angelehnt." : "Welche Schutzausrüstung bei WT-Turnieren vorgeschrieben ist, regeln die Wettkampfregeln der WT und die DTU-Wettkampfordnung (Rumpfschutz, Kopfschutz, Tiefschutz, Mundschutz, Schienbein- und Unterarmschutz). Die Packliste im Turnierbereich ist daran angelehnt."],
          ],
          src: "Allgemeine Trainingspraxis; Ausrüstung: " + (itf ? "ITF-D Wettkampfordnung" : "DTU Wettkampfordnung Zweikampf") + ". Trainerprüfung empfohlen.",
          links: itf ? lnkItf : lnkWt,
        },
        en: {
          t: "Tying the belt & the dobok",
          sub: "How the belt sits – and how to look after the uniform",
          secs: [
            ["Tying the belt", "Put the middle of the belt on your navel, take it once around the body, cross it behind and bring it to the front again. Pull one end under both layers and close it with a square knot. Both ends should end up the same length."],
            ["Respect for the belt", "In many schools the belt is treated with respect and not thrown on the floor. Ask your coach what is customary in your club."],
            ["Wearing the dobok", "Close the jacket and keep it at hip height with the belt; the trousers must not drag on the floor. A dobok should be loose enough for high kicks but not so wide that you catch yourself in it."],
            ["Care", "Air it after training and wash by the care label, coloured belts apart from light items. Don't tumble-dry hot – cotton shrinks."],
            ["Protective gear", itf ? "Which protective gear is required at ITF-D tournaments is set in the ITF-D competition rules and the invitation. The packing list in the tournament area follows it." : "Which protective gear is required at WT tournaments is set by the WT competition rules and the DTU competition regulations (trunk, head, groin and mouth guard, shin and forearm guards). The packing list in the tournament area follows it."],
          ],
          src: "General training practice; equipment: " + (itf ? "ITF-D competition rules" : "DTU competition regulations (two-person sparring)") + ". Coach review recommended.",
          links: itf ? lnkItf : lnkWt,
        },
      },
      {
        k: "tgrade",
        ico: TKD_ICO.grade,
        de: {
          t: "Grade & Prüfung",
          sub: itf ? "Kup, Dan und Tul beim ITF-D" : "Kup, Poom/Dan und Taegeuk bei der DTU",
          secs: [
            ["Wie die Grade laufen", itf ? "Die Schülergrade (Kup) zählen vom 9. bis zum 1. Kup abwärts, danach folgt der 1. Dan. Jeder Grad hat eine eigene Gürtelfarbe." : "Die Schülergrade (Kup) zählen vom 9. bis zum 1. Kup abwärts. Danach folgt der Poom (für Kinder und Jugendliche) oder der Dan. Jeder Grad hat eine eigene Gürtelfarbe."],
            ["Mindestwartezeiten", "Vor der Prüfung zum jeweiligen Grad gilt eine Mindestzeit seit der letzten Prüfung (in Monaten): " + waits("de") + "."],
            [itf ? "Tul (Formen)" : "Formen (Taegeuk)", forms("de") + (itf ? "." : ". Die Prüfungsordnung nummeriert die Formen nur; die hier gezeigte Reihenfolge ist die übliche Kukkiwon-Folge.")],
            ["Was geprüft wird", "Die Prüfungsteile je Grad findest du unter Tests → Gürtelprüfung zum Abhaken. Ringzeit plant daraus keine Prüfungsinhalte neu – der Prüfer und deine Schule legen den genauen Ablauf fest."],
          ],
          src: itf ? "ITF-D Prüfungsordnung (PO) § 2, 3, 7, 8" : "DTU Prüfungsordnung (PO) Nr. 10.1; Kukkiwon-Formenfolge",
          links: itf ? lnkItf : lnkWt,
        },
        en: {
          t: "Grades & examination",
          sub: itf ? "Kup, dan and tul at the ITF-D" : "Kup, poom/dan and taegeuk at the DTU",
          secs: [
            ["How the grades run", itf ? "The student grades (kup) count down from 9th to 1st kup, followed by 1st dan. Each grade has its own belt colour." : "The student grades (kup) count down from 9th to 1st kup. After that comes poom (for children and youth) or dan. Each grade has its own belt colour."],
            ["Minimum waiting times", "Before the exam for each grade a minimum time since the last exam applies (in months): " + waits("en") + "."],
            [itf ? "Tul (patterns)" : "Forms (taegeuk)", forms("en") + (itf ? "." : ". The grading regulations only number the forms; the order shown here is the usual Kukkiwon sequence.")],
            ["What is examined", "You find the exam parts per grade under Tests → Belt exam to tick off. Ringzeit does not plan exam content for you – the examiner and your school set the exact course."],
          ],
          src: itf ? "ITF-D grading regulations (PO) §§ 2, 3, 7, 8" : "DTU grading regulations (PO) no. 10.1; Kukkiwon forms sequence",
          links: itf ? lnkItf : lnkWt,
        },
      },
      {
        k: "tterms",
        ico: TKD_ICO.terms,
        de: {
          t: "Begriffe",
          sub: itf ? "Die Namen der Techniken im ITF-Taekwon-Do" : "Die Namen der Techniken im WT-Taekwondo",
          secs: [
            ["Wortbausteine", "Chagi heißt Tritt, Jirugi Stoß oder Schlag mit der Faust, Makgi Block. Der Dojang ist die Trainingshalle, der Dobok der Anzug, Ti der Gürtel."],
            ["Die Techniken in Ringzeit", terms("de") + "."],
            ["Schreibweisen", itf ? "Hier gilt die Schreibweise der ITF-D-Prüfungsordnung. Was die Ordnung nicht benennt, steht nur auf Deutsch oder Englisch – Ringzeit erfindet keine Namen." : "Hier gilt die Umschrift der Kukkiwon-Fachbegriffe. In den Einstellungen wählst du, ob koreanische Namen oder App-Namen angezeigt werden; Ansagen sind immer in der App-Sprache."],
          ],
          src: itf ? "ITF-D Prüfungsordnung (PO), ITF Tournament Rules" : "Kukkiwon Taekwondo Technical Terminology (2012)",
        },
        en: {
          t: "Terms",
          sub: itf ? "The names of the techniques in ITF Taekwon-Do" : "The names of the techniques in WT Taekwondo",
          secs: [
            ["Word parts", "Chagi means kick, jirugi a punch or strike with the fist, makgi a block. The dojang is the training hall, the dobok the uniform, ti the belt."],
            ["Techniques in Ringzeit", terms("en") + "."],
            ["Spelling", itf ? "The spelling of the ITF-D grading regulations applies here. What the regulations do not name is given in German or English only – Ringzeit does not invent names." : "The romanisation of the Kukkiwon terminology applies here. In the settings you choose between Korean names and app names; announcements are always in the app language."],
          ],
          src: itf ? "ITF-D grading regulations (PO), ITF Tournament Rules" : "Kukkiwon Taekwondo Technical Terminology (2012)",
        },
      },
      {
        k: "thist",
        ico: TKD_ICO.hist,
        de: {
          t: "Geschichte & Verbände",
          sub: "Zwei Linien, ein Name – kurz und neutral",
          secs: [
            ["Der Name", "Taekwondo setzt sich aus tae (Fuß), kwon (Faust) und do (Weg) zusammen; der Name wurde in den 1950er-Jahren festgelegt."],
            ["ITF-Linie", "Die International Taekwon-Do Federation wurde am 22. März 1966 in Seoul von General Choi Hong-hi gegründet, ihr Sitz ist seit 1985 Wien. Der ITF-D vertritt sie in Deutschland."],
            ["WT-Linie", "Die World Taekwondo Federation wurde 1973 gegründet, im selben Jahr fanden die ersten Weltmeisterschaften in Seoul statt; seit 2017 heißt sie World Taekwondo (WT). Das IOC erkannte sie 1980 an, seit 2000 ist Taekwondo olympische Medaillendisziplin. Die Deutsche Taekwondo Union (DTU) gehört der WT an."],
            ["Welche Linie ist richtig?", "Beide sind gewachsene Wege des Taekwondo mit eigenen Regeln. Ringzeit plant nach dem Stil, den du im Profil wählst – und du kannst ihn pro Einheit wechseln."],
          ],
          src: "Wikipedia (Taekwondo; ITF; DTU); taekwondonation.com; Olympedia",
        },
        en: {
          t: "History & federations",
          sub: "Two lines, one name – short and neutral",
          secs: [
            ["The name", "Taekwondo combines tae (foot), kwon (fist) and do (way); the name was settled in the 1950s."],
            ["The ITF line", "The International Taekwon-Do Federation was founded on 22 March 1966 in Seoul by General Choi Hong-hi; its seat has been Vienna since 1985. The ITF-D represents it in Germany."],
            ["The WT line", "The World Taekwondo Federation was founded in 1973, and the first World Championships took place in Seoul the same year; since 2017 it has been called World Taekwondo (WT). The IOC recognised it in 1980, and taekwondo has been an Olympic medal sport since 2000. The German Taekwondo Union (DTU) belongs to WT."],
            ["Which line is right?", "Both are grown paths of taekwondo with their own rules. Ringzeit plans by the style you choose in your profile – and you can switch it per session."],
          ],
          src: "Wikipedia (Taekwondo; ITF; DTU); taekwondonation.com; Olympedia",
        },
      },
    ];
  }
  /* shared reads for taekwondo: the few kickboxing words in them are swapped (hand wrapping -> belt) */
  function tkdShared(r) {
    const fix = (x) => x.replace("Bandagieren, Aufwärmen", "Gürtel binden, Aufwärmen").replace("wrapping, warm-up", "tying your belt, warm-up");
    const lang = (o) => ({ ...o, secs: o.secs.map(([a, b]) => [fix(a), fix(b)]) });
    return { ...r, de: lang(r.de), en: lang(r.en) };
  }
