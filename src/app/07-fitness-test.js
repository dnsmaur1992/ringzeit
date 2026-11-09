  /* ============ Fitness test ============ */
  const TCATS = ["str", "spd", "end", "flx", "tec"];
  /* Each area scores 1–5; thresholds are fixed so results stay comparable over time */
  /*
   * Fitness test thresholds (score 1–5). Female norms are lower for push-ups and the 2.4 km run;
   * "diverse" uses the male norms. Children 8–12 get estimated, age-adjusted norms.
   */
  function testNorms(prof = S.profile) {
    const f = prof.sex === "f",
      ka = kidAge(prof);
    let str = f ? [5, 10, 17, 25] : [10, 20, 30, 40],
      spd = f ? [13, 18, 23, 28] : [15, 20, 25, 30],
      end = f ? [960, 840, 780, 720] : [840, 720, 660, 600];
    if (ka != null) {
      str = str.map((x) => Math.max(1, Math.round(x * 0.6)));
      spd = spd.map((x) => x - 3);
      end = end.map((x) => x + (ka <= 9 ? 180 : 120));
    }
    return { str, spd, end };
  }
  function scoreTest(raw) {
    const up = (v, th) => (v == null || isNaN(v) ? null : 1 + th.filter((x) => v >= x).length),
      N = testNorms();
    const s = {
      str: up(raw.str, N.str),
      spd: up(raw.spd, N.spd),
      end: raw.end == null ? null : 1 + N.end.filter((x) => raw.end <= x).length,
      flx: raw.flx ?? null,
      tec: raw.tec ?? null,
    };
    const vals = TCATS.map((k) => s[k]),
      complete = vals.every((v) => v != null);
    return {
      scores: s,
      total: vals.reduce((a, v) => a + (v || 0), 0),
      complete,
      min: complete ? Math.min(...vals) : 0,
    };
  }
  // Technical familiarity is chosen per sport/style; never inferred from fitness or transferred between sports.
  const trainingKey = (sport, style, p = S.profile) => techKey(sport, sport === "taekwondo" ? style || (p.tkd?.style === "itf" ? "itf" : "wt") : undefined);
  function techniqueLevel(sport = sportNow(), style, p = S.profile) {
    const key = trainingKey(sport, style || (sport === "taekwondo" ? tkdUnitStyle() : undefined), p);
    const main = trainingKey(p.sport || "kickboxing", undefined, p);
    const value = key === main ? p.level : p.techLevels?.[key];
    return [0,1,2].includes(value) ? value : 0;
  }
  function fitnessLevel() {
    const f = fitnessFor(S.tests).level;
    // Migration freezes the former physical dose independently of subsequent technical selections.
    return f ?? ([0,1,2].includes(S.profile.fitnessBase) ? S.profile.fitnessBase : S.profile.level || 0);
  }
  const doseLevel = (b) => [0,1,2].includes(b?.fitnessLevel) ? b.fitnessLevel : fitnessLevel();
  function maxLevel(sport = mainSport(), style) { return techniqueLevel(sport, style); }
  function techniqueChoices(sport, style, p = S.profile, onboarding = false) {
    const L = t("ability"), key = trainingKey(sport, style, p), current = techniqueLevel(sport, style, p);
    return `<div class="field"><span class="lab">${L.question}</span><div class="seg">${L.options.map((label, i) => `<button type="button" ${onboarding ? `data-otech="${i}"` : `data-techlevel="${i}" data-techkey="${key}"`} aria-pressed="${current === i}">${label}</button>`).join("")}</div><span class="sub">${L.details[sport][current]} ${L.hint}</span></div>`;
  }
  function fitnessSummaryHtml() {
    const f = fitnessFor(S.tests), L = t("ability");
    return `<div class="note"><b>${L.fitness}</b><div>${f.test ? `${L.doses[f.level]} · ${fmtDate(f.test.date)}` : L.noTest}</div><div>${L.separate}</div></div>`;
  }
  /* Effort with five faces instead of numbers; each face stands for a value on the 1–10 scale the planning uses */
  const effortFaces = () =>
    S.profile.lang === "de"
      ? [
          [2, "😌", "Sehr locker"],
          [4, "🙂", "Locker"],
          [6, "😤", "Fordernd"],
          [8, "😣", "Hart"],
          [10, "🥵", "Am Limit"],
        ]
      : [
          [2, "😌", "Very easy"],
          [4, "🙂", "Easy"],
          [6, "😤", "Challenging"],
          [8, "😣", "Hard"],
          [10, "🥵", "All-out"],
        ];
  // logged effort as text: the face in the simple view, the number otherwise
  const effortTxt = (rpe) => {
    if (!simpleView()) return `RPE ${rpe}`;
    const f = effortFaces().find(([n]) => n === faceOf(rpe));
    return f ? `${f[1]} ${f[2]}` : `RPE ${rpe}`;
  };
  const faceOf = (rpe) => (Number.isFinite(rpe) && rpe > 0 ? Math.min(10, Math.ceil(rpe / 2) * 2) : null);
  /* Simple view: only what's needed to train; statistics, test and history move into the profile */
  const simpleView = () => S.profile.simple === true;
  // the simple view doesn't ask for extra equipment, so it plans without any (only the partner/bag answer counts)
  const defaultEq = () => (simpleView() ? ["bag"] : ["bag", "rope"]);
  /* under 15 (or a child without year of birth): no weight reminders */
  const under15 = () => {
    const a = ageAt();
    return a != null ? a < 15 : ageGroup() === "kids";
  };
  /* average of the weigh-ins of the last 14 days (needs two), so single-day swings don't count */
  function weightTrend() {
    const cut = iso(addDays(today(), -14)),
      w = S.weights.filter((x) => x.date >= cut);
    return w.length >= 2 ? Math.round((w.reduce((a, x) => a + x.kg, 0) / w.length) * 10) / 10 : null;
  }
  function saveWeight(raw) {
    const v = parseFloat(String(raw || "").replace(",", "."));
    if (!(v >= 25 && v <= 200)) return false;
    const d = iso(today());
    S.weights = S.weights.filter((w) => w.date !== d);
    S.weights.push({ date: d, kg: Math.round(v * 10) / 10 });
    S.weights.sort((a, c) => a.date.localeCompare(c.date));
    store.save();
    toast(t("saved"));
    render();
    return true;
  }
  const nextComp = () =>
    (S.profile.comps || [])
      .filter((c) => (c.kind || "comp") === "comp" && parse(c.date) >= today())
      .sort((a, b) => a.date.localeCompare(b.date))[0];
  /* pre = baseline test 5–9 weeks before a tournament, post = comparison test in the recovery week */
  function testStatus() {
    const last = S.tests[S.tests.length - 1],
      age = last ? daysBetween(parse(last.date), today()) : null,
      nc = nextComp(),
      ph = phaseInfo();
    if (nc) {
      const n = daysBetween(today(), parse(nc.date));
      if (n >= 35 && n <= 63 && (age == null || age > 21)) return "pre";
    }
    if (ph.phase === "recover" && (!last || last.date < ph.comp)) return "post";
    if (!last) return S.log.length >= 3 ? "first" : null;
    if (age >= 42 && ph.phase !== "taper") return "due";
    return null;
  }

