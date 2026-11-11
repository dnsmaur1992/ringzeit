  /* ============ Winter Arc (7n): an optional autumn/winter challenge built from chosen building blocks ============
     Start only from October to January (a running arc may end later); length 6–12 weeks from the next Monday.
     The user picks the blocks (training, recovery, mindset, discipline, body, look); Today shows only those.
     No extremes: rest days and deload weeks stay, no diet or weight goals (weight is a curve only), paused
     weeks (sickness, breaks) neither count nor break the streak. Stored in S.profile.arc / .arcs / .relaxLog
     so the normal save and the backup keep it. */
  const ARC_WEEKS = [6, 8, 10, 12];
  /* building blocks: k = kind (goal: weekly number, daily/weekly: tick, once: test, look: display) */
  const ARC_BLOCKS = {
    train: [
      ["train", "goal"],
      ["test", "once"],
      ["mob", "daily"],
      ["walk", "daily"],
    ],
    rest: [
      ["relax", "goal"],
      ["sleep23", "daily"],
      ["sleep7", "daily"],
      ["breath", "daily"],
      ["phone", "daily"],
    ],
    mind: [
      ["impulse", "look"],
      ["strong", "weekly"],
      ["grat", "daily"],
      ["read", "daily"],
    ],
    disc: [
      ["wake", "daily"],
      ["cold", "daily"],
      ["water", "daily"],
      ["alc", "daily"],
      ["social", "daily"],
    ],
    body: [["weight", "weekly"]],
    look: [["winter", "look"]],
  };
  const ARC_KIND = Object.fromEntries(Object.values(ARC_BLOCKS).flat());
  const ARC_DEFAULT = ["train", "relax", "test", "impulse", "mob", "sleep23", "winter"];
  const ARCT = {
    de: {
      name: "Winter Arc",
      tag: "❄ Challenge",
      intro: "Die dunkle Jahreszeit als eigener Abschnitt: dranbleiben, still arbeiten, im Frühjahr stärker sein. Ohne Extreme – Ruhetage und Entlastungswochen bleiben.",
      offer: "Herbst und Winter sind da. Lust auf deinen Winter Arc?",
      offerBtn: "Ansehen",
      len: "Länge",
      wk: (n) => `${n} Wo`,
      when: (a, b) => `Start ${a} · Ende ${b}`,
      pickH: "Was gehört zu deinem Arc?",
      pickSub: "Tipp an, was du willst. Auf Heute erscheint nur das, was du gewählt hast.",
      groups: { train: "Training", rest: "Erholung", mind: "Mindset", disc: "Disziplin", body: "Körper", look: "Optik" },
      blocks: {
        train: "Wochenziel Trainings",
        test: "Fitnesstest am Start und am Ende",
        mob: "10 Min Mobility",
        walk: "Spaziergang draußen",
        relax: "Wochenziel Entspannen",
        sleep23: "Schlaf vor 23 Uhr",
        sleep7: "7 Stunden Schlaf",
        breath: "Atemübung",
        phone: "Handy weg 30 Min vor dem Schlaf",
        impulse: "Impuls der Woche",
        strong: "Meditation „Stärken“ 1× pro Woche",
        grat: "3 gute Dinge des Tages",
        read: "10 Min lesen",
        wake: "Feste Weckzeit",
        cold: "Kalt duschen (30 Sek.)",
        water: "2 Liter Wasser",
        alc: "Kein Alkohol",
        social: "Social-Media-Pause",
        weight: "Gewicht 1× pro Woche eintragen",
        winter: "Winter-Design",
      },
      trainN: "Trainings pro Woche",
      relaxN: "Entspannen pro Woche",
      goalNote: "Gezählt wird jedes eingetragene Training – Ringzeit oder Verein. Vorausgewählt ist deine geplante Zahl pro Woche. In Wochen mit Krankheit oder Pause ruht das Ziel, die Serie bleibt.",
      sleepNote: "Zählt für die letzte Nacht.",
      mobGo: "▶ 10 Min",
      mobGoA: "Geführte Mobility (ca. 10 Minuten) ansehen und starten",
      mobH: "Mobility",
      mobIntro: "Etwa zehn Minuten Mobility. Ich sage dir jede Übung und jeden Seitenwechsel an. Bewege dich ruhig und ohne Schmerz.",
      mobReady: "Gleich geht's los",
      mobPrev: (n) => `Deine Mobility heute · ca. ${n} Min.`,
      mobAbout: (n) => `ca. ${n} Min.`,
      mobStart: "Mobility starten",
      mobRepsH: "In deinem Tempo – dann „Weiter“",
      mobRepsSay: "In deinem Tempo. Tippe auf Weiter, wenn du fertig bist.",
      mobNextBtn: "Weiter",
      mobPaused: "Pausiert",
      mobNext: "Danach",
      mobDone: "Geschafft. Etwas für deine Beweglichkeit getan. Stark.",
      mobFin: "Mobility geschafft – abgehakt.",
      mobStopped: "Mobility beendet.",
      stop: "Beenden",
      coldNote: "Kalt duschen langsam steigern; nicht bei Herz-Kreislauf-Problemen oder wenn du krank bist.",
      weightNote: "Nur als Verlauf – ohne Zielgewicht. Ein Gewichtslimit für einen Kampf trägst du bei den Terminen ein.",
      start: "Winter Arc starten",
      startsOn: (d) => `Dein Winter Arc startet ${d}${d.endsWith(".") ? "" : "."}`,
      testFirst: "Mach vorher den Fitnesstest – am Ende siehst du, was der Winter gebracht hat.",
      testEnd: "Letzte Woche: Zeit für den Endtest.",
      toTest: "Zum Fitnesstest",
      week: (w, n) => `Winter Arc · Woche ${w} von ${n}`,
      day: (d, n, l) => `Tag ${d} von ${n} · noch ${l} ${l === 1 ? "Tag" : "Tage"}`,
      unitsWk: "Trainings diese Woche",
      relaxWk: "Entspannen diese Woche",
      today: "Heute",
      thisWeek: "Diese Woche",
      of7: (n) => `${n} von 7`,
      more: "Woche, Nachtragen & Optionen ▾",
      less: "Weniger ▴",
      last7: "Letzte 7 Tage",
      backNote: "Vergessen oder vertippt? Heute und die 3 Tage davor kannst du ändern.",
      kgPh: "kg",
      kgSave: "Eintragen",
      kgDone: (kg) => `Eingetragen: ${kg} kg`,
      kgBad: "Bitte ein Gewicht zwischen 25 und 200 kg eingeben.",
      strongGo: "Meditation „Stärken“ starten",
      go: "Start",
      impulseH: "Impuls der Woche",
      streak: (n) => (n ? `Serie: ${n} ${n === 1 ? "Woche" : "Wochen"} am Stück ❄` : "Die Serie beginnt mit deiner ersten vollen Woche."),
      rests: "Diese Woche ruht das Ziel (Pause).",
      pause: "Pausieren",
      resume: "Weiter",
      paused: (d) => `Winter Arc pausiert seit ${d}${d.endsWith(".") ? "" : "."} Das Ziel ruht, die Serie bleibt.`,
      end: "Beenden",
      endAsk: "Winter Arc wirklich beenden? Dein Fortschritt bleibt in der Bilanz.",
      endYes: "Ja, beenden",
      endNo: "Weitermachen",
      cancel: "Nicht starten",
      edit: "Anpassen",
      done: "Winter Arc geschafft",
      doneCard: "Dein Winter Arc ist vorbei. Schau dir an, was du geschafft hast.",
      doneBtn: "Bilanz ansehen",
      sumH: "Stärker aus dem Winter.",
      sumLine: (u, r, g, n) => `${u} Einheiten · ${r} × Entspannen · Wochenziel in ${g} von ${n} Wochen`,
      testH: "Fitnesstest vorher → nachher",
      testTotal: "Gesamt",
      testMissing: "Für den Vergleich fehlt der Start- oder Endtest.",
      habitsH: "Gewohnheiten",
      habitLine: (n, d) => `${n} von ${d} Tagen`,
      weekLine: (n, w) => `${n} von ${w} Wochen`,
      weightH: "Gewicht (Verlauf)",
      share: "Teilen",
      shareTx: (n, u) => `Mein Winter Arc: ${n} Wochen, ${u} Einheiten. Ringzeit`,
      close: "Schließen",
      newArc: "Neuer Arc",
      archive: "Abschließen",
      offSeason: "Den Winter Arc startest du von Oktober bis Januar.",
      history: "Frühere Arcs",
      histLine: (a, n, g) => `${a} · ${n} Wochen · Ziel in ${g} Wochen`,
      profRun: (w, n) => `Läuft · Woche ${w} von ${n}`,
      profStart: "Winter Arc starten",
      impulses: [
        "Dranbleiben, wenn es keiner sieht.",
        "Disziplin ist kein Gefühl, sondern eine Entscheidung, die du jeden Tag neu triffst.",
        "Klein anfangen zählt. Zehn Minuten sind mehr als null.",
        "Erholung ist Training. Schlaf ist kein Luxus, sondern dein Fortschritt.",
        "Du musst dich nicht motiviert fühlen, um anzufangen. Fang an – die Motivation kommt nach.",
        "Vergleich dich nur mit dem, der du letzte Woche warst.",
        "Ein schlechter Tag ist kein schlechter Arc. Morgen geht es weiter.",
        "Stärke wächst im Stillen. Im Frühjahr sieht man sie.",
        "Halte deine Versprechen an dich selbst – auch die kleinen.",
        "Ruhig bleiben, wenn es hart wird. Dein Atem ist dein Anker.",
        "Du bist weiter, als du denkst. Schau zurück, wo du gestartet bist.",
        "Die letzten Wochen entscheiden nicht alles – aber sie zeigen, wer du geworden bist.",
      ],
    },
    en: {
      name: "Winter Arc",
      tag: "❄ Challenge",
      intro: "The dark season as a chapter of its own: keep going, work quietly, be stronger in spring. No extremes – rest days and deload weeks stay.",
      offer: "Autumn and winter are here. Fancy your Winter Arc?",
      offerBtn: "Take a look",
      len: "Length",
      wk: (n) => `${n} wk`,
      when: (a, b) => `Start ${a} · End ${b}`,
      pickH: "What belongs to your arc?",
      pickSub: "Tap what you want. Today only shows what you picked.",
      groups: { train: "Training", rest: "Recovery", mind: "Mindset", disc: "Discipline", body: "Body", look: "Look" },
      blocks: {
        train: "Weekly session goal",
        test: "Fitness test at start and end",
        mob: "10 min mobility",
        walk: "Walk outside",
        relax: "Weekly relax goal",
        sleep23: "Asleep before 11 pm",
        sleep7: "7 hours of sleep",
        breath: "Breathing exercise",
        phone: "Phone away 30 min before sleep",
        impulse: "Thought of the week",
        strong: "Meditation “Strengthen” once a week",
        grat: "3 good things of the day",
        read: "Read 10 min",
        wake: "Fixed wake-up time",
        cold: "Cold shower (30 s)",
        water: "2 litres of water",
        alc: "No alcohol",
        social: "Social media break",
        weight: "Log weight once a week",
        winter: "Winter look",
      },
      trainN: "Sessions per week",
      relaxN: "Relax per week",
      goalNote: "Every logged training counts – Ringzeit or club. Your planned number per week is preselected. In weeks with sickness or a break the goal rests, the streak stays.",
      sleepNote: "Counts for last night.",
      mobGo: "▶ 10 min",
      mobGoA: "See and start guided mobility (about 10 minutes)",
      mobH: "Mobility",
      mobIntro: "About ten minutes of mobility. I'll call out each exercise and every side change. Move calmly and without pain.",
      mobReady: "Starting in a moment",
      mobPrev: (n) => `Your mobility today · about ${n} min`,
      mobAbout: (n) => `about ${n} min`,
      mobStart: "Start mobility",
      mobRepsH: "At your own pace – then “Next”",
      mobRepsSay: "At your own pace. Tap next when you're done.",
      mobNextBtn: "Next",
      mobPaused: "Paused",
      mobNext: "Next",
      mobDone: "Done. Ten minutes for your mobility. Strong.",
      mobFin: "10 min mobility done – ticked.",
      mobStopped: "Mobility stopped.",
      stop: "Stop",
      coldNote: "Build cold showers up slowly; not with heart or circulation problems or when you're ill.",
      weightNote: "As a curve only – no target weight. A weight limit for a fight goes under your dates.",
      start: "Start Winter Arc",
      startsOn: (d) => `Your Winter Arc starts ${d}.`,
      testFirst: "Do the fitness test first – at the end you'll see what winter brought.",
      testEnd: "Last week: time for the final test.",
      toTest: "To the fitness test",
      week: (w, n) => `Winter Arc · week ${w} of ${n}`,
      day: (d, n, l) => `Day ${d} of ${n} · ${l} ${l === 1 ? "day" : "days"} to go`,
      unitsWk: "Sessions this week",
      relaxWk: "Relax this week",
      today: "Today",
      thisWeek: "This week",
      of7: (n) => `${n} of 7`,
      more: "Week, catch up & options ▾",
      less: "Less ▴",
      last7: "Last 7 days",
      backNote: "Forgot or mistapped? You can change today and the 3 days before.",
      kgPh: "kg",
      kgSave: "Log",
      kgDone: (kg) => `Logged: ${kg} kg`,
      kgBad: "Please enter a weight between 25 and 200 kg.",
      strongGo: "Start meditation “Strengthen”",
      go: "Start",
      impulseH: "Thought of the week",
      streak: (n) => (n ? `Streak: ${n} ${n === 1 ? "week" : "weeks"} in a row ❄` : "The streak starts with your first full week."),
      rests: "The goal rests this week (break).",
      pause: "Pause",
      resume: "Resume",
      paused: (d) => `Winter Arc paused since ${d}. The goal rests, the streak stays.`,
      end: "End",
      endAsk: "Really end your Winter Arc? Your progress stays in the review.",
      endYes: "Yes, end it",
      endNo: "Keep going",
      cancel: "Don't start",
      edit: "Edit",
      done: "Winter Arc done",
      doneCard: "Your Winter Arc is over. See what you achieved.",
      doneBtn: "See review",
      sumH: "Stronger out of winter.",
      sumLine: (u, r, g, n) => `${u} sessions · ${r} × relax · weekly goal in ${g} of ${n} weeks`,
      testH: "Fitness test before → after",
      testTotal: "Total",
      testMissing: "The start or final test is missing for the comparison.",
      habitsH: "Habits",
      habitLine: (n, d) => `${n} of ${d} days`,
      weekLine: (n, w) => `${n} of ${w} weeks`,
      weightH: "Weight (curve)",
      share: "Share",
      shareTx: (n, u) => `My Winter Arc: ${n} weeks, ${u} sessions. Ringzeit`,
      close: "Close",
      newArc: "New arc",
      archive: "Finish",
      offSeason: "You can start the Winter Arc from October to January.",
      history: "Earlier arcs",
      histLine: (a, n, g) => `${a} · ${n} weeks · goal in ${g} weeks`,
      profRun: (w, n) => `Running · week ${w} of ${n}`,
      profStart: "Start Winter Arc",
      impulses: [
        "Keep going when nobody is watching.",
        "Discipline isn't a feeling, it's a decision you make again every day.",
        "Starting small counts. Ten minutes beat zero.",
        "Recovery is training. Sleep is not a luxury, it's your progress.",
        "You don't have to feel motivated to start. Start – motivation follows.",
        "Only compare yourself with who you were last week.",
        "One bad day isn't a bad arc. Tomorrow you carry on.",
        "Strength grows in silence. Spring will show it.",
        "Keep the promises you make to yourself – the small ones too.",
        "Stay calm when it gets hard. Your breath is your anchor.",
        "You've come further than you think. Look back at where you started.",
        "The last weeks don't decide everything – but they show who you've become.",
      ],
    },
  };
  const arcT = () => ARCT[S.profile.lang] || ARCT.de;
  /* season: starting is possible from October to January */
  const arcSeason = (d = today()) => [9, 10, 11, 0].includes(d.getMonth());
  const arcSeasonKey = (d = today()) => String(d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear());
  const arcNextMon = (d = today()) => {
    const m = monday(d);
    return iso(m) === iso(d) ? d : addDays(m, 7);
  };
  const arcOf = () => (S.profile.arc && S.profile.arc.start ? S.profile.arc : null);
  const arcEnd = (a) => a.endedEarly || iso(addDays(parse(a.start), a.weeks * 7 - 1));
  const arcHas = (a, id) => a.pick.includes(id);
  function arcPausedOn(a, ds) {
    return (a.paused || []).some((p) => ds >= p.from && (!p.to || ds <= p.to)) || !!pausedOn(ds);
  }
  /* relax sessions finished (kept small); written by the relax module when a session runs to its end */
  function relaxLogAdd(r) {
    const L = (S.profile.relaxLog = Array.isArray(S.profile.relaxLog) ? S.profile.relaxLog : []);
    L.push({ d: iso(today()), m: r.mode, k: r.mode === "med" ? r.kind : r.pat });
    S.profile.relaxLog = L.slice(-300);
    store.save();
  }
  const relaxOnDays = (a, b, f = () => true) => (S.profile.relaxLog || []).filter((x) => x.d >= a && x.d <= b && f(x)).length;
  /* per week: sessions (own and club, with minutes), relax sessions, paused, reached */
  function arcWeek(a, i) {
    const m = addDays(parse(a.start), i * 7),
      from = iso(m),
      to = iso(addDays(m, 6)),
      units = S.log.filter((e) => e.date >= from && e.date <= to && (e.minutes || 0) > 0).length,
      relax = relaxOnDays(from, to),
      days = Array.from({ length: 7 }, (_, k) => iso(addDays(m, k))),
      rest = days.filter((d) => arcPausedOn(a, d)).length >= 3,
      ok = (!arcHas(a, "train") || units >= a.train) && (!arcHas(a, "relax") || relax >= a.relax);
    return { from, to, units, relax, rest, ok };
  }
  /* streak: full weeks in a row up to the last finished one; resting weeks are skipped, never broken */
  function arcStreak(a, upTo) {
    let n = 0;
    for (let i = upTo; i >= 0; i--) {
      const w = arcWeek(a, i);
      if (w.rest) continue;
      if (!w.ok) break;
      n++;
    }
    return n;
  }
  /* a tick: daily ones per day, weekly ones once in the week; some come by themselves */
  function arcTicked(a, id, ds) {
    if (id === "breath" && relaxOnDays(ds, ds, (x) => x.m === "breath")) return true;
    if (ARC_KIND[id] === "weekly") {
      const m = monday(parse(ds)),
        from = iso(m),
        to = iso(addDays(m, 6));
      if (id === "strong" && relaxOnDays(from, to, (x) => x.m === "med" && x.k === "strong")) return true;
      if (id === "weight") return S.weights.some((w) => w.date >= from && w.date <= to);
      return Object.keys(a.checks || {}).some((d) => d >= from && d <= to && a.checks[d].includes(id));
    }
    return !!(a.checks && a.checks[ds] && a.checks[ds].includes(id));
  }
  /* ticks can be changed for today and the three days before (honest, but forgiving) – also across the start
     of a new week, but not before the arc's start */
  const ARC_BACK = 3;
  const arcCanTick = (a, ds) => ds <= iso(today()) && ds >= iso(addDays(today(), -ARC_BACK)) && ds >= a.start;
  function arcToggle(id, day) {
    const a = arcOf();
    if (!a) return;
    const ds = day || iso(today());
    if (!arcCanTick(a, ds)) return;
    a.checks = a.checks || {};
    const cur = new Set(a.checks[ds] || []);
    cur.has(id) ? cur.delete(id) : cur.add(id);
    a.checks[ds] = [...cur];
    store.save();
    render();
  }
  /* fitness tests: the first around the start, the last around the end */
  function arcTests(a) {
    const s0 = iso(addDays(parse(a.start), -14)),
      s1 = iso(addDays(parse(a.start), 13)),
      e = arcEnd(a),
      e0 = iso(addDays(parse(e), -13)),
      e1 = iso(addDays(parse(e), 14)),
      ok = (x) => x.scores && x.total != null,
      first = S.tests.find((x) => ok(x) && x.date >= s0 && x.date <= s1) || null,
      last = [...S.tests].reverse().find((x) => ok(x) && x.date >= e0 && x.date <= e1 && (!first || x.id !== first.id)) || null;
    return { first, last };
  }
  function arcSummary(a) {
    const end = arcEnd(a),
      upto = iso(today()) < end ? iso(today()) : end,
      weeks = Array.from({ length: a.weeks }, (_, i) => arcWeek(a, i)).filter((w) => w.from <= upto),
      days = Math.max(1, daysBetween(parse(a.start), parse(upto)) + 1),
      habits = a.pick
        .filter((id) => ARC_KIND[id] === "daily" || ARC_KIND[id] === "weekly")
        .map((id) => {
          if (ARC_KIND[id] === "weekly") return { id, n: weeks.filter((w) => arcTicked(a, id, w.from)).length, of: weeks.length, wk: true };
          let n = 0;
          for (let k = 0; k < days; k++) if (arcTicked(a, id, iso(addDays(parse(a.start), k)))) n++;
          return { id, n, of: days };
        }),
      wts = S.weights.filter((w) => w.date >= a.start && w.date <= end);
    return {
      units: weeks.reduce((s, w) => s + w.units, 0),
      relax: weeks.reduce((s, w) => s + w.relax, 0),
      goal: weeks.filter((w) => w.ok && !w.rest).length,
      weeks: weeks.length,
      habits,
      weight: wts.length ? { first: wts[0].kg, last: wts[wts.length - 1].kg, n: wts.length } : null,
      tests: arcTests(a),
    };
  }
  /* ---------- Today ---------- */
  function arcCardHtml() {
    const A = arcT(),
      a = arcOf(),
      td = iso(today());
    if (!a) {
      const P = S.profile;
      if (!arcSeason() || P.arcHide === arcSeasonKey()) return "";
      return `<div class="note act arcoffer"><span>❄ ${A.offer}</span><span class="minirow"><button type="button" class="btn ghost" data-arc="setup">${A.offerBtn}</button><button type="button" class="btn ghost" data-arc="hide" aria-label="✕">✕</button></span></div>`;
    }
    const end = arcEnd(a),
      win = arcHas(a, "winter") ? " wawin" : "";
    if (td > end || a.endedEarly) return `<div class="arcard${win}"><span class="eb">${A.tag}</span><div class="big">${A.done}</div><p class="sub">${A.doneCard}</p><button type="button" class="btn" data-arc="summary">${A.doneBtn}</button></div>`;
    if (td < a.start) {
      const T = arcTests(a);
      return `<div class="arcard${win}"><span class="eb">${A.tag}</span><div class="big">${esc(A.startsOn(fmtDate(a.start)))}</div>${arcHas(a, "test") && !T.first ? `<p class="sub">${A.testFirst}</p><button type="button" class="btn sec" data-tab="test">${A.toTest}</button>` : ""}<div class="minirow"><button type="button" class="btn ghost" data-arc="setup">✎ ${A.edit}</button><button type="button" class="btn ghost" data-arc="cancel">${A.cancel}</button></div></div>`;
    }
    const day = daysBetween(parse(a.start), today()) + 1,
      n = a.weeks * 7,
      wi = Math.floor((day - 1) / 7),
      w = arcWeek(a, wi),
      pz = (a.paused || []).find((p) => !p.to);
    let h = `<div class="arcard arcmain${win}"><span class="eb">${esc(A.week(wi + 1, a.weeks))}</span>`;
    h += arcHas(a, "impulse") ? `<div class="big quote">${esc(A.impulses[wi % A.impulses.length])}</div>` : `<div class="big">${esc(A.name)}</div>`;
    h += `<div class="arcbar"><i style="width:${Math.round((day / n) * 100)}%"></i></div><span class="sub">${esc(A.day(day, n, n - day))}</span>`;
    if (pz) return h + `<p class="sub">${esc(A.paused(fmtDate(pz.from)))}</p><button type="button" class="btn" data-arc="resume">${A.resume}</button></div>`;
    const dots = (k, of) => `<div class="arcdots">${Array.from({ length: of }, (_, i) => `<span class="${i < k ? "on" : ""}"></span>`).join("")}</div>`;
    // weekly goals: one slim line each (the calendar below already lists the sessions themselves)
    const goals = [];
    if (arcHas(a, "train")) goals.push(`<div class="g${w.units >= a.train ? " ok" : ""}"><b class="num">${w.units}/${a.train}</b><small>${A.unitsWk}</small>${dots(w.units, a.train)}</div>`);
    if (arcHas(a, "relax")) goals.push(`<div class="g${w.relax >= a.relax ? " ok" : ""}"><b class="num">${w.relax}/${a.relax}</b><small>${A.relaxWk}</small>${dots(w.relax, a.relax)}</div>`);
    if (goals.length) h += `<div class="arcgoals">${goals.join("")}</div>`;
    if (w.rest) h += `<p class="sub">${A.rests}</p>`;
    // Today shows only today's ticks; the last 7 days (changes up to three days back), weight entry, notes, streak,
    // pause and end open on demand – so the plan below stays in reach
    const open = !!ui.arcWk,
      daily = a.pick.filter((id) => ARC_KIND[id] === "daily"),
      weekly = a.pick.filter((id) => ARC_KIND[id] === "weekly"),
      days = Array.from({ length: 7 }, (_, k) => iso(addDays(parse(w.from), k))),
      cnt = (id) => days.filter((ds) => ds <= td && arcTicked(a, id, ds)).length,
      lw = S.weights.find((x) => x.date >= w.from && x.date <= w.to);
    if (daily.length || weekly.length) {
      h += `<div class="arcticks">`;
      h += daily
        .map((id) => {
          const on = arcTicked(a, id, td),
            auto = id === "breath";
          return `<div class="arch"><button type="button" class="arck${on ? " on" : ""}" data-arcchk="${id}" aria-pressed="${on}" ${auto && on ? "disabled" : ""}>${on ? "✓" : ""}</button><span class="an">${esc(A.blocks[id])}</span><span class="sub num">${cnt(id)}/7</span>${auto && !on ? `<button type="button" class="btn ghost" data-rx="open" data-rv="breath">🌬️</button>` : ""}${id === "mob" && !on ? `<button type="button" class="btn ghost" data-arc="mob" aria-label="${A.mobGoA}">${A.mobGo}</button>` : ""}</div>`;
        })
        .join("");
      h += weekly
        .map((id) => {
          const on = arcTicked(a, id, td);
          if (id === "weight")
            return `<div class="arch"><span class="arck${on ? " on" : ""}" aria-hidden="true">${on ? "✓" : ""}</span><span class="an">${esc(A.blocks.weight)}</span>${lw ? `<span class="sub">${numF(lw.kg)} kg</span>` : open ? "" : `<button type="button" class="btn ghost" data-arc="wk">${A.kgSave} ›</button>`}</div>`;
          return `<div class="arch"><span class="arck${on ? " on" : ""}" aria-hidden="true">${on ? "✓" : ""}</span><span class="an">${esc(A.blocks[id])}</span>${on ? "" : `<button type="button" class="btn ghost" data-arc="strong" aria-label="${A.strongGo}">🌙 ${A.go}</button>`}</div>`;
        })
        .join("");
      h += `</div>`;
    }
    if (open) {
      h += `<div class="arcwk">`;
      if (daily.length)
        // the last 7 days up to today (not Mon–Sun), so the days that can still be changed are always in view
        h += `<span class="lab">${A.last7}</span><span class="sub">${A.backNote}</span>${daily
          .map((id) => {
            const auto = id === "breath",
              pills = Array.from({ length: 7 }, (_, k) => iso(addDays(today(), k - 6)))
                .map((ds) => {
                  // breathing ticks itself on days with a breathing exercise in the app; other days can be ticked by hand
                  const done = arcTicked(a, id, ds),
                    byApp = auto && relaxOnDays(ds, ds, (x) => x.m === "breath"),
                    can = !byApp && arcCanTick(a, ds),
                    wd = t("weekday")[(parse(ds).getDay() + 6) % 7].slice(0, 2),
                    lbl = `${wd}<small>${parse(ds).getDate()}.</small>`,
                    cls = `ad${done ? " on" : ""}${ds === td ? " td" : ""}${can ? "" : " fut"}`;
                  return can
                    ? `<button type="button" class="${cls}" data-arcchk="${id}" data-ad="${ds}" aria-pressed="${done}" aria-label="${esc(fmtDate(ds))}">${lbl}</button>`
                    : `<span class="${cls}" aria-hidden="true">${lbl}</span>`;
                })
                .join("");
            const note = id === "sleep23" || id === "sleep7" ? A.sleepNote : id === "cold" ? A.coldNote : "";
            return `<div class="awk"><span class="an">${esc(A.blocks[id])}${note ? `<small class="sub">${note}</small>` : ""}</span><span class="adays">${pills}</span></div>`;
          })
          .join("")}`;
      if (weekly.includes("weight"))
        h += `<div class="awk"><span class="an">${esc(A.blocks.weight)}<small class="sub">${lw ? esc(A.kgDone(numF(lw.kg))) : A.weightNote}</small></span>${lw ? "" : `<span class="arkg"><input id="arcKg" class="wc" type="text" inputmode="decimal" placeholder="${A.kgPh}" aria-label="${A.kgPh}"><button type="button" class="btn ghost" data-arc="kg">${A.kgSave}</button></span>`}</div>`;
      h += `<div class="arcfoot"><span class="sub">${esc(A.streak(arcStreak(a, wi - 1)))}</span><span class="minirow"><button type="button" class="btn ghost" data-arc="pause">${A.pause}</button><button type="button" class="btn ghost" data-arc="endask">${A.end}</button></span></div>`;
      if (ui.arcEndAsk) h += `<div class="arcnote"><b>${A.endAsk}</b><div class="inline"><button type="button" class="btn" data-arc="end">${A.endYes}</button><button type="button" class="btn sec" data-arc="endno">${A.endNo}</button></div></div>`;
      h += `</div>`;
    }
    if (arcHas(a, "test") && wi === a.weeks - 1 && !arcTests(a).last) h += `<div class="arcnote"><span>${A.testEnd}</span><button type="button" class="btn ghost" data-tab="test">${A.toTest}</button></div>`;
    h += `<button type="button" class="arcmore" data-arc="wk" aria-expanded="${open}">${open ? A.less : A.more}</button>`;
    return h + `</div>`;
  }

  /* ---------- 10-minute mobility (7n+, reworked after the external review 05.11.2026) ----------
     Exercises come from the plan generator (type mobility, 10 min, home, no equipment) for the main sport and the
     limitations. Each step uses the SAME dose as the guided training: timed exercises run the phases of
     exerciseTiming() (prescriptions from core/prescription.js: both sides with a change, hold/rest passes …),
     exercises dosed in repetitions (DOSE_TXT) run without a clock and continue with "Next" – no invented time.
     The routine aims at about 10 minutes (9–12, shown before the start; a rep step counts ≈ 1 min like DOSE_MIN).
     It never touches the plan or the log; only a routine finished to the end ticks "10 min mobility". */
  const MOB_AIM = [540, 720],
    MOB_REP_SEC = 60;
  const mobDose = (id) => (DOSE_FIX[id] ? DOSE_FIX[id][S.profile.lang === "de" ? 0 : 1] : "");
  function mobStep(sess, bi, ni) {
    const id = sess.blocks[bi].items[ni].id;
    if (!RX[id] && DOSE_TXT[id]) return { id, kind: "reps", dose: mobDose(id), sec: MOB_REP_SEC, phases: [] };
    const tm = RX[id] ? exerciseTiming(sess, bi, ni, undefined, 0) : null;
    if (!tm) return null;
    return { id, kind: "timed", dose: mobDose(id), phases: tm.phases, sec: tm.phases.reduce((x, p) => x + p.seconds, 0) };
  }
  function arcMobPlan() {
    const fits = (id) => EX[id] && !(S.profile.limits || []).some((l) => AV[l] && (EX[id].avoid || "").includes(AV[l])) && (!EX[id].eq || EX[id].eq === "none") && /h/.test(EX[id].locs || "h");
    const usable = (id) => fits(id) && (RX[id] || DOSE_TXT[id]) && (EX[id].cat === "mob" || EX[id].cat === "cool" || /dynamic|joint/.test(id)) && !/breath|jog/.test(id);
    let steps = [],
      sum = 0;
    const add = (st) => {
      if (!st || steps.some((x) => x.id === st.id) || sum + st.sec > MOB_AIM[1]) return;
      steps.push(st);
      sum += st.sec;
    };
    try {
      const sess = buildSession(iso(today()), "M", "home", [], { min: 10 });
      sess.blocks.forEach((b, bi) => b.items.forEach((it, ni) => usable(it.id) && sum < MOB_AIM[0] && add(mobStep(sess, bi, ni))));
    } catch (e) {}
    // top up from the mobility catalogue (same limits) until about 9 minutes are reached
    const pool = shuffle(Object.keys(EX).filter((id) => /^mob\./.test(id) && usable(id)));
    for (const id of pool) {
      if (sum >= MOB_AIM[0]) break;
      const blk = { key: "mob", min: 10, items: [{ id }] };
      add(mobStep({ blocks: [blk] }, 0, 0));
    }
    return { steps, sec: sum };
  }
  const mobRunning = () => !!(ui.mob && ui.mob.run);
  const mobSpeak = (lbl) => (S.profile.lang === "de" ? lbl.replace(/(\d+)\/(\d+)/g, "$1 von $2") : lbl.replace(/(\d+)\/(\d+)/g, "$1 of $2"));
  function mobSay(tx) {
    if (S.profile.relax && S.profile.relax.voice === false) return;
    try {
      if (canSpeak()) speechSynthesis.speak(speakUtterance(tx, 0.95, [], Date.now()));
    } catch (e) {}
  }
  function arcMobOpen() {
    ui.mob = Object.assign(arcMobPlan(), { run: false, paused: false, i: -1 });
    ui.arc = { view: "mob" };
    renderArc();
  }
  function arcMobStart() {
    const m = ui.mob;
    if (!m || !m.steps.length) return;
    pauseOtherTimer("mob");
    unlockAudio();
    Object.assign(m, { run: true, paused: false, done: false, i: -1 });
    mobSay(arcT().mobIntro);
    mobGo(0, 3000);
    syncTimers();
    clearInterval(arcMobStart.iv);
    arcMobStart.iv = setInterval(arcMobTick, 250);
  }
  /* go to step i (after an optional lead-in): announce name, dose and the first phase */
  function mobGo(i, lead = 0) {
    const m = ui.mob;
    if (i >= m.steps.length) return arcMobStop(true);
    const st = m.steps[i],
      e = exText(st.id);
    Object.assign(m, { i, p: 0, at: Date.now() + lead, spoke: -1 });
    if (i) rxTone(440);
    mobSay(`${e.name}. ${st.dose ? st.dose + ". " : ""}${st.kind === "reps" ? arcT().mobRepsSay : ""}`);
    renderArc();
  }
  /* One clock position for live ticks, paused views and redraws after a phase change. */
  function mobPosition(m) {
    const st = m?.steps[m.i];
    if (!st || st.kind !== "timed") return null;
    let elapsed = ((m.paused ? m.pausedAt : Date.now()) - m.at) / 1000;
    if (elapsed < 0) return { p: 0, seconds: Math.ceil(-elapsed), lead: true };
    let p = 0;
    while (p < st.phases.length && elapsed >= st.phases[p].seconds) elapsed -= st.phases[p++].seconds;
    return { p, seconds: p < st.phases.length ? Math.ceil(st.phases[p].seconds - elapsed) : 0, done: p >= st.phases.length };
  }
  function arcMobTick() {
    const m = ui.mob;
    if (!m || !m.run) return clearInterval(arcMobStart.iv);
    const st = m.steps[m.i];
    if (!st || st.kind === "reps") return;
    const pos = mobPosition(m), k = pos.p;
    if (pos.lead) return mobClock(pos.seconds);
    if (pos.done) return mobGo(m.i + 1);
    if (k !== m.p || m.spoke !== k) {
      const changed = k !== m.p;
      m.p = k;
      m.spoke = k;
      // every phase change is shown and said (side 2/2, change, hold 3/5 …) – the timer and the words are the same plan
      if (st.phases.length > 1) {
        if (changed) rxTone(st.phases[k].label === workoutText().change ? 330 : 440);
        mobSay(mobSpeak(st.phases[k].label));
      }
      renderArc();
    }
    mobClock(pos.seconds);
  }
  function mobClock(sec) {
    const el = document.getElementById("mobclk");
    if (el) el.textContent = fmt(sec);
  }
  function arcMobPause() {
    const m = ui.mob;
    if (!m || !m.run) return;
    clearInterval(arcMobStart.iv);
    m.run = false;
    m.paused = true;
    m.pausedAt = Date.now();
    try {
      if (canSpeak()) speechSynthesis.cancel();
    } catch (e) {}
    syncTimers();
    renderArc();
  }
  function arcMobResume() {
    const m = ui.mob;
    if (!m || !m.paused) return;
    pauseOtherTimer("mob");
    m.at += Date.now() - m.pausedAt; // the phase continues where it stopped
    m.run = true;
    m.paused = false;
    syncTimers();
    clearInterval(arcMobStart.iv);
    arcMobStart.iv = setInterval(arcMobTick, 250);
    renderArc();
  }
  function arcMobStop(done) {
    clearInterval(arcMobStart.iv);
    const m = ui.mob;
    if (!m) return;
    const wasOn = m.run || m.paused;
    m.run = false;
    m.paused = false;
    m.done = !!done;
    if (done) {
      const a = arcOf(),
        ds = iso(today());
      if (a && ds >= a.start) {
        a.checks = a.checks || {};
        a.checks[ds] = [...new Set([...(a.checks[ds] || []), "mob"])];
        store.save();
      }
      mobSay(arcT().mobDone);
      rxTone(528);
    } else if (wasOn)
      try {
        if (canSpeak()) speechSynthesis.cancel();
      } catch (e) {}
    m.ended = wasOn || done;
    syncTimers();
    renderArc();
    render();
  }
  function arcMobHtml() {
    const A = arcT(),
      m = ui.mob;
    if (!m) return "";
    if (m.ended && !m.run && !m.paused)
      return `<div class="arcard wawin" style="text-align:center"><div class="arcbadge">🤸</div><div class="big">${m.done ? A.mobFin : A.mobStopped}</div></div><button type="button" class="btn" data-arc="close">${A.close}</button>`;
    if (!m.run && !m.paused)
      // preview: the exercises with their doses and the actual length
      return `<div class="panel wapan"><span class="lab">${esc(A.mobPrev(Math.round(m.sec / 60)))}</span>${m.steps
        .map((st, k) => `<div class="row between mobli"><span class="n num">${k + 1}</span><span class="nm">${esc(exText(st.id).name)}</span><span class="sub">${esc(st.dose)}</span></div>`)
        .join("")}</div><button type="button" class="btn" data-arc="mobstart" ${m.steps.length ? "" : "disabled"}>${A.mobStart}</button>`;
    const st = m.steps[Math.max(0, m.i)],
      e = exText(st.id),
      pos = mobPosition(m),
      ph = st.kind === "timed" ? st.phases[Math.min(pos.p, st.phases.length - 1)] : null,
      illustration = hasSketch(st.id) ? `<div class="mobdemo skwrap${m.paused ? " is-paused" : ""}">${sketchSvg(EX[st.id].key)}${SKETCH[EX[st.id].key].hold ? `<span class="skhold">${t("skHold")}</span>` : ""}</div>` : "",
      nx = m.steps[m.i + 1] ? exText(m.steps[m.i + 1].id).name : "";
    const bar = `<div class="mobsteps" aria-hidden="true">${m.steps.map((_, k) => `<i class="${k < m.i ? "on" : k === m.i ? "cur" : ""}"></i>`).join("")}</div>`;
    return `<div class="mobrun"><div class="rxtop"><span>${A.mobH} · ${m.i + 1}/${m.steps.length}</span><span class="num">${esc(A.mobAbout(Math.round(m.sec / 60)))}</span></div>${bar}
      ${st.kind === "timed" ? `<div class="mobclk num" id="mobclk">${fmt(pos.seconds)}</div><p class="mobph">${esc(ph.label)}</p>` : `<div class="mobclk mobreps">${esc(st.dose)}</div><p class="mobph">${A.mobRepsH}</p>`}
      ${illustration}<h2>${esc(e.name)}</h2><p class="sub">${esc(st.dose)} · ${esc(e.desc)}</p>
      ${nx ? `<p class="sub">${A.mobNext}: ${esc(nx)}</p>` : ""}
      ${m.paused ? `<p class="mobph">${A.mobPaused}</p><button type="button" class="btn" data-arc="mobresume">${A.resume}</button>` : st.kind === "reps" ? `<button type="button" class="btn" data-arc="mobnext">${A.mobNextBtn}</button>` : ""}
      <div class="inline">${m.paused ? "" : `<button type="button" class="btn ghost" data-arc="mobpause">${A.pause}</button>`}<button type="button" class="btn ghost" data-arc="mobstop">${A.stop}</button></div></div>`;
  }
  /* ---------- profile (Dates & goals) ---------- */
  function arcProfileHtml() {
    const A = arcT(),
      a = arcOf(),
      hist = (S.profile.arcs || []).slice().reverse();
    let h = `<div class="panel"><div class="field"><span class="lab">❄ ${A.name}</span>`;
    if (a) {
      const day = daysBetween(parse(a.start), today()) + 1,
        wi = Math.min(a.weeks, Math.max(1, Math.ceil(day / 7)));
      h += `<span class="sub">${esc(iso(today()) < a.start ? A.startsOn(fmtDate(a.start)) : A.profRun(wi, a.weeks))}</span><button type="button" class="btn sec" data-tab="week" style="align-self:flex-start">${A.today} ›</button>`;
    } else if (arcSeason()) h += `<span class="sub">${A.intro}</span><button type="button" class="btn" data-arc="setup" style="align-self:flex-start">${A.profStart}</button>`;
    else h += `<span class="sub">${A.offSeason}</span>`;
    if (hist.length) h += `<span class="lab" style="margin-top:8px">${A.history}</span>${hist.map((x) => `<span class="sub">${esc(A.histLine(fmtDate(x.start), x.weeks, x.goal))}</span>`).join("")}`;
    return h + `</div></div>`;
  }
  /* ---------- setup and review overlay ---------- */
  /* planned trainings per week: own days plus club days (both count when entered) */
  const arcPlanned = () => Math.max(1, Math.min(7, (S.profile.days || []).length + ((S.profile.club && S.profile.club.days) || []).length));
  function arcOpen(view) {
    const a = arcOf();
    ui.arc = view === "summary" ? { view } : { view: "setup", weeks: a ? a.weeks : 8, pick: a ? [...a.pick] : [...ARC_DEFAULT], train: a ? a.train : arcPlanned(), relax: a ? a.relax : 2 };
    renderArc();
  }
  function renderArc() {
    const el = document.getElementById("arcov"),
      r = ui.arc;
    if (!el) return;
    if (!r) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    el.hidden = false;
    const A = arcT(),
      a = arcOf();
    let h = `<div class="fbar"><button type="button" class="x" data-arc="close" aria-label="×">✕</button><span>${A.name}</span><span style="width:40px"></span></div>`;
    if (r.view === "mob") {
      el.className = "relax arcov" + (mobRunning() || (ui.mob && ui.mob.paused) ? " run" : "");
      el.innerHTML = h.replace('data-arc="close"', 'data-arc="mobclose"') + arcMobHtml();
      return;
    }
    el.className = "relax arcov";
    if (r.view === "summary" && a) {
      const s = arcSummary(a),
        T = s.tests;
      h += `<div class="arcard wawin" style="text-align:center"><div class="arcbadge">❄</div><div class="big">${A.sumH}</div><p class="sub">${esc(A.sumLine(s.units, s.relax, s.goal, s.weeks))}</p></div>`;
      if (arcHas(a, "test"))
        h += `<div class="panel wapan"><span class="lab">${A.testH}</span>${
          T.first && T.last
            ? `<table class="arctab"><tr><td>${A.testTotal}</td><td>${T.first.total}</td><td class="${T.last.total > T.first.total ? "up" : ""}">${T.last.total}${T.last.total > T.first.total ? " ↑" : ""}</td></tr>${TCATS.filter((k) => T.first.scores[k] != null && T.last.scores[k] != null)
                .map((k) => `<tr><td>${t("cats")[k]}</td><td>${T.first.scores[k]}</td><td class="${T.last.scores[k] > T.first.scores[k] ? "up" : ""}">${T.last.scores[k]}${T.last.scores[k] > T.first.scores[k] ? " ↑" : ""}</td></tr>`)
                .join("")}</table>`
            : `<span class="sub">${A.testMissing}</span>`
        }</div>`;
      if (s.habits.length) h += `<div class="panel wapan"><span class="lab">${A.habitsH}</span>${s.habits.map((x) => `<div class="row between"><span>${esc(A.blocks[x.id])}</span><span class="sub">${esc(x.wk ? A.weekLine(x.n, x.of) : A.habitLine(x.n, x.of))}</span></div>`).join("")}</div>`;
      if (s.weight && arcHas(a, "weight")) h += `<div class="panel wapan"><span class="lab">${A.weightH}</span><span class="sub" style="display:block">${numF(s.weight.first)} kg → ${numF(s.weight.last)} kg · ${s.weight.n}×</span></div>`;
      h += `<div class="inline"><button type="button" class="btn" data-arc="archive">${A.archive}</button>${navigator.share ? `<button type="button" class="btn sec" data-arc="share">${A.share}</button>` : ""}</div>`;
    } else {
      const st = arcNextMon(),
        en = addDays(st, r.weeks * 7 - 1);
      h += `<div class="arcard wawin"><span class="eb">${A.tag}</span><div class="big">${A.name}</div><p class="sub">${A.intro}</p></div>`;
      h += `<div class="panel"><div class="field"><span class="lab">${A.len}</span><div class="seg">${ARC_WEEKS.map((n) => `<button type="button" data-arc="set" data-ak="weeks" data-av="${n}" aria-pressed="${r.weeks === n}">${A.wk(n)}</button>`).join("")}</div><span class="sub">${esc(A.when(fmtDate(iso(st)), fmtDate(iso(en))))}</span></div></div>`;
      h += `<div class="panel"><div class="field"><span class="lab">${A.pickH}</span><span class="sub">${A.pickSub}</span></div>`;
      for (const [g, items] of Object.entries(ARC_BLOCKS)) {
        h += `<div class="field"><span class="lab">${A.groups[g]}</span><div class="chips">${items.map(([id]) => `<button type="button" class="chip" data-arcpick="${id}" aria-pressed="${r.pick.includes(id)}">${esc(A.blocks[id])}</button>`).join("")}</div>`;
        if (g === "train" && r.pick.includes("train")) h += `<div class="row" style="gap:10px;align-items:center"><span style="flex:1">${A.trainN}</span><div class="seg">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<button type="button" data-arc="set" data-ak="train" data-av="${n}" aria-pressed="${r.train === n}">${n}</button>`).join("")}</div></div>`;
        if (g === "rest" && r.pick.includes("relax")) h += `<div class="row" style="gap:10px;align-items:center"><span style="flex:1">${A.relaxN}</span><div class="seg">${[1, 2, 3].map((n) => `<button type="button" data-arc="set" data-ak="relax" data-av="${n}" aria-pressed="${r.relax === n}">${n}</button>`).join("")}</div></div>`;
        if (g === "train" && (r.pick.includes("train") || r.pick.includes("relax"))) h += `<span class="sub">${A.goalNote}</span>`;
        if (g === "disc" && r.pick.includes("cold")) h += `<span class="sub">${A.coldNote}</span>`;
        if (g === "body" && r.pick.includes("weight")) h += `<span class="sub">${A.weightNote}</span>`;
        h += `</div>`;
      }
      h += `</div><button type="button" class="btn" data-arc="start" ${r.pick.length ? "" : "disabled"}>${A.start}</button>`;
    }
    el.innerHTML = h;
  }
  function arcAction(act, ds) {
    const a = arcOf(),
      r = ui.arc;
    if (act === "setup") return arcOpen("setup");
    if (act === "summary") return arcOpen("summary");
    if (act === "mob") return arcMobOpen();
    if (act === "wk") {
      ui.arcWk = !ui.arcWk;
      if (!ui.arcWk) ui.arcEndAsk = false;
      return render();
    }
    if (act === "mobstart") return arcMobStart();
    if (act === "mobpause") return arcMobPause();
    if (act === "mobresume") return arcMobResume();
    if (act === "mobnext") return ui.mob && ui.mob.run ? mobGo(ui.mob.i + 1) : undefined;
    if (act === "mobstop") return arcMobStop(false);
    if (act === "mobclose") {
      if (ui.mob && (ui.mob.run || ui.mob.paused)) arcMobStop(false);
      return arcAction("close");
    }
    if (act === "close") {
      ui.mob = null;
      ui.arc = null;
      return renderArc();
    }
    if (act === "hide") {
      S.profile.arcHide = arcSeasonKey();
      store.save();
      return render();
    }
    if (act === "set" && r) {
      r[ds.ak] = +ds.av;
      return renderArc();
    }
    if (act === "start" && r && r.pick.length) {
      const keep = a && iso(today()) < a.start ? a : null; // editing before the start keeps the date
      S.profile.arc = { start: keep ? a.start : iso(arcNextMon()), weeks: r.weeks, pick: r.pick, train: r.train, relax: r.relax, checks: keep ? a.checks || {} : {}, paused: [] };
      ui.arc = null;
      store.save();
      renderArc();
      ui.tab = "week";
      ui.wk = 0;
      render(true);
      window.scrollTo(0, 0);
      return;
    }
    if (!a) return;
    if (act === "cancel") {
      S.profile.arc = null;
      store.save();
      return render();
    }
    if (act === "kg") {
      const el = document.getElementById("arcKg");
      if (el && saveWeight(el.value) === false) toast(arcT().kgBad);
      return;
    }
    if (act === "strong") return relaxOpen({ mode: "med", kind: "strong", mlen: 10 });
    if (act === "pause") {
      a.paused = (a.paused || []).concat([{ from: iso(today()) }]);
      store.save();
      return render();
    }
    if (act === "resume") {
      const p = (a.paused || []).find((x) => !x.to);
      if (p) p.to = iso(addDays(today(), -1)) < p.from ? p.from : iso(addDays(today(), -1));
      store.save();
      return render();
    }
    if (act === "endask") {
      ui.arcEndAsk = true;
      return render();
    }
    if (act === "endno") {
      ui.arcEndAsk = false;
      return render();
    }
    if (act === "end") {
      // ends today: the review shows what was done so far
      ui.arcEndAsk = false;
      a.endedEarly = iso(today()) < a.start ? a.start : iso(today());
      store.save();
      render();
      return arcOpen("summary");
    }
    if (act === "share") {
      const s = arcSummary(a);
      try {
        navigator.share({ text: arcT().shareTx(a.weeks, s.units), url: location.href.split("#")[0] });
      } catch (e) {}
      return;
    }
    if (act === "archive") {
      const s = arcSummary(a);
      S.profile.arcs = (S.profile.arcs || []).concat([{ start: a.start, weeks: s.weeks, goal: s.goal, units: s.units, relax: s.relax }]).slice(-10);
      S.profile.arc = null;
      ui.arc = null;
      store.save();
      renderArc();
      return render();
    }
  }
