  /* ============ Grundabdeckung Kickboxen (Betreiber 17.11.2026, E10/E11/E17–E20) ============
     Every kickboxing technique unit gets a range & exit round ("dist") and a defence round: from 4 rounds both, below
     that one of them in turn; technique & conditioning one of them in turn. A focus that already covers one kind
     (footwork / bounce → range, defence & counter / counter foci → defence) drops only that fixed round.
     Range round: entry – combo – exit, or (E20) exit first – combo from the new position; entries and exits fit the
     discipline (low-kick range in KL/K1, knee to close range without clinch in K1) and the level; knee/ankle limits
     drop the low-kick and knee entries. Defence round: solo = evade & counter (imagined attack, KL/K1 with check);
     with a partner = a partner round with a real attack → defence → counter on top of the usual counter actions. */
  const DIST_IN = [
    { id: "jab", de: "Schritt hinein mit Jab", en: "step in behind the jab" },
    { id: "slide", de: "Nachstellschritt hinein", en: "slide in", lvl: 1 },
    { id: "angle", de: "schräg hinein, neben die Linie", en: "step in at an angle, off the line", lvl: 1 },
    { id: "low", de: "seitlich in Lowkick-Distanz", en: "angle into low-kick range", lvl: 1, disc: ["kl", "k1"], need: "lowk" },
    { id: "knee", de: "hinein in die Nahdistanz – Knie, kein Clinch", en: "in to close range – knee, no clinch", lvl: 1, disc: ["k1"], need: "knee" },
  ];
  const DIST_OUT = [
    { id: "back", de: "zurück aus der Distanz", en: "back out of range" },
    { id: "side", de: "seitlich raus in den Winkel", en: "out to the side, at an angle" },
    { id: "pivot", de: "Pivot raus", en: "pivot out", lvl: 1 },
  ];
  /* exit first (E20): from the new position straight into the combo */
  const DIST_FIRST = [
    { id: "backIn", de: "erst zurück aus der Distanz, dann sofort wieder hinein", en: "first back out of range, then straight back in" },
    { id: "sideIn", de: "erst seitlich raus in den Winkel, dann aus dem Winkel angreifen", en: "first out to the side, then attack from the angle" },
    { id: "pivotIn", de: "erst Pivot raus, dann aus der neuen Linie angreifen", en: "first pivot out, then attack from the new line", lvl: 1 },
  ];
  const distOk = (x) =>
    (!x.lvl || techniqueLevel() >= x.lvl) &&
    !(x.disc && !x.disc.includes(discOf())) &&
    !(x.need && kneeAnk()) &&
    !(ageGroup() === "kids" && x.lvl);
  /* which fixed rounds a unit needs; the alternation follows the last kickboxing unit with technique rounds */
  function coverNeed(type, theme, n) {
    const covDist = !!(theme && (theme.kinds === "foot" || theme.kinds === "bounce")),
      covDef = !!(theme && (theme.kinds === "evade" || theme.counters || theme.id === "def"));
    if (type === "T" && n >= 4) return ["dist", "def"].filter((k) => !(k === "dist" ? covDist : covDef));
    if (type !== "T" && type !== "C") return [];
    let next = coverTurn();
    if (next === "dist" ? covDist : covDef) next = next === "dist" ? "def" : "dist";
    return (next === "dist" ? covDist : covDef) ? [] : [next];
  }
  function coverTurn() {
    const last = Object.values(S.sessions)
      .filter((s) => s && ["T", "C"].includes(s.type) && (s.sport || mainSport()) === "kickboxing" && s.blocks && s.blocks.some((b) => b.rounds))
      .sort((a, b) => (b.created || 0) - (a.created || 0))[0];
    if (!last) return "dist";
    const its = last.blocks.find((b) => b.rounds).items;
    return its.some((r) => r.k === "dist" || r.dist) ? "def" : "dist";
  }
  /* places the fixed rounds: range early (after the easy start), defence in the second half; never on the six-kick,
     rope or focus rounds. Returns the index of a partner defence round (cover.def) for the counter action. */
  function coverSlots(kinds, type, theme, easy, partner) {
    const n = kinds.length,
      need = coverNeed(type, theme, n),
      from = Math.min(Math.max(1, easy), n - 1),
      free = (i) => ["shadow", "bag", "partner"].includes(kinds[i]),
      out = { def: null, dist: null };
    const take = (start, dir) => {
      for (let i = start; i >= from && i < n; i += dir) if (free(i)) return i;
      for (let i = from; i < n; i++) if (free(i)) return i;
      // short units with a long easy start (and the six-kick round): an easy round takes it, never the very first
      for (let i = n - 1; i >= 1; i--) if (free(i)) return i;
      return -1;
    };
    if (need.includes("dist")) {
      const i = take(from, 1);
      if (i >= 0) {
        if (partner && kinds[i] === "partner") out.dist = i;
        else kinds[i] = "dist";
      }
    }
    if (need.includes("def")) {
      const i = take(Math.min(n - 1, Math.max(from + 1, Math.ceil(n * 0.6))), 1);
      if (i >= 0) {
        if (partner && kinds[i] === "partner") out.def = i;
        else kinds[i] = "evade";
      }
    }
    return out;
  }
  /* the content of a range & exit round: a short combo (2–3 techniques) with its entry and exit, or exit first */
  function distRound(theme) {
    // against a smaller opponent the focus keeps it long: no entry into close range
    const fits = (x) => distOk(x) && !(theme && theme.id === "shortOpp" && x.id === "knee"),
      first = techniqueLevel() >= 1 && ageGroup() !== "kids" && Math.random() < 0.35,
      entry = first ? rnd(DIST_FIRST.filter(fits)) : rnd(DIST_IN.filter(fits)),
      exit = first ? null : rnd(DIST_OUT.filter(distOk));
    // a combo by the movement rules (4–7, children 2–3), with the technique the entry needs (Teil 43)
    const c = isTkd() ? combo("shadow", theme) : flowCombo("shadow", theme, { must: entry.need, noExit: true });
    return { combo: c, dist: { i: entry.id, o: exit ? exit.id : null } };
  }
  const distOf = (id) => [...DIST_IN, ...DIST_OUT, ...DIST_FIRST].find((x) => x.id === id);
  /* "Eingang: … · Ausgang: …" (or the exit-first line) for the card and the call */
  function distTxt(it, lg) {
    const d = it && it.dist;
    if (!d) return "";
    const L = lg === 0 ? 0 : 1,
      w = (id) => (distOf(id) || {})[L ? "en" : "de"] || "";
    if (!d.o) return L ? `Exit first: ${w(d.i)}.` : `Ausgang zuerst: ${w(d.i)}.`;
    return L ? `Entry: ${w(d.i)} · combo · exit: ${w(d.o)}.` : `Eingang: ${w(d.i)} · Kombination · Ausgang: ${w(d.o)}.`;
  }
