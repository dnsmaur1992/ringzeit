  /* ============ Partner units in theme blocks (Betreiber 25.11.2026, Teil 43) ============
     With a partner (technique and conditioning, all three sports, also in tournament preparation) the main part is
     no longer a row of 3-minute rounds with a new task each time. It has one theme for the whole unit (the focus of
     the unit, now shown) and is split into blocks of 8–12 minutes in one go (children 5–6), easy → hard:
     - the blocks build one combination up: the first block the core of the theme, every further block one technique
       more, the last block the whole combination (when the combination is too short: combinations of the theme from
       easy to hard);
     - inside a block the stages change by time (said by the timer): slow and clean → with pace, entering and leaving
       the range (the former range & exit round) → with the partner's counter action (the former defence round).
       Grundlage and children: the counter action once (the last block), otherwise competition pace; Taekwondo has no
       partner counter actions (competition pace with a moving partner); conditioning: rhythm → high pace → counter;
       (counter actions only in about 2 of 5 blocks, in the middle of the combo – see pbUnit)
     - A and B take turns as before: swap roles after 3–5 repetitions;
     - the breaks between blocks are the round breaks of the unit; the progression shortens them as before – if the
       time gets tight, the blocks get shorter, none falls out. */
  const PB_SPLIT = [0.3, 0.35];
  function pbLayout(mainMin, restB) {
    const kid = ageGroup() === "kids",
      target = kid ? 330 : 600,
      lo = kid ? 300 : 480,
      hi = kid ? 360 : 720,
      sec = mainMin * 60;
    let best = null;
    // (children: units of 45–60 minutes – at most 6 blocks)
    for (let n = 1; n <= (kid ? 6 : 5); n++) {
      const w = Math.floor((sec - (n - 1) * restB) / n / 30) * 30;
      // a short main part stays one block rather than splitting into short pieces
      if (w < 120 || (n > 1 && w < lo * 0.75)) break;
      const d = Math.abs(w - target) + (w < lo || w > hi ? 120 : 0);
      if (!best || d < best.d) best = { n, w, d };
    }
    return best ? { n: best.n, w: best.w } : { n: 1, w: Math.max(60, Math.floor(sec / 30) * 30) };
  }
  /* the stages of one block: [[stage, seconds], …] */
  function pbStages(w, s3) {
    const a = Math.max(30, Math.round((w * PB_SPLIT[0]) / 30) * 30),
      b = Math.max(30, Math.round((w * PB_SPLIT[1]) / 30) * 30);
    // children without a counter action: clean, then pace to the end (no competition pace)
    if (!s3) return [
        ["clean", a],
        ["tempo", Math.max(30, w - a)],
      ];
    return [
      ["clean", a],
      ["tempo", b],
      [s3, Math.max(30, w - a - b)],
    ];
  }
  /* the block length changed (progression): the stages keep their shares */
  function pbRescale(items, w) {
    for (const it of items) if (it.pb) it.pb.st = pbStages(w, it.pb.st[2] ? it.pb.st[2][0] : null);
  }
  /* the windows of the full combination that keep the theme: key = indices that must stay in */
  function pbWindows(F, key, ctx, minL = 2) {
    const L = F.length,
      lo = Math.min(...key),
      hi = Math.max(...key),
      ok = [];
    for (let i = 0; i <= lo; i++)
      for (let j = hi; j < L; j++) {
        const w = F.slice(i, j + 1);
        if (w.length >= minL && (w.length === L || flowOk(w, ctx))) ok.push({ i, j, c: w });
      }
    return ok;
  }
  /* the key of the theme in the full combination */
  function pbKey(F, theme, fs) {
    const L = F.length;
    if (fs.start) return [...Array(Math.min(fs.start.length, L)).keys()];
    if (fs.end) return [L - 1];
    if (theme && theme.id === "bodyHead") {
      const i = F.findIndex((x, k) => k > 0 && BODY_HEAD.has(F[k - 1] + ">" + x));
      if (i > 0) return [i - 1, i];
    }
    // against taller: every block keeps the body shot (28.11.2026)
    if (theme && theme.id === "tallOpp") {
      const i = F.findIndex((x) => FT[x] && FT[x].body);
      if (i >= 0) return [i];
    }
    if (theme && theme.kick) {
      const i = F.findIndex((x) => hasKick([x], theme.kick, tkm()));
      if (i >= 0) return [i];
    }
    if (theme && theme.prefer) {
      const i = F.findIndex((x) => theme.prefer.includes(x));
      if (i >= 0) return [i];
    }
    return [0];
  }
  /* the combinations of the blocks (Betreiber 28.11.2026): two big combinations of 6–8 actions, each built up in two
     blocks – the first block its first 3–5 actions, the second block the whole combination; the blocks left over get
     short combinations of 3–5 actions. Only room for 2–3 blocks: one big combination (+ one short); one block: the big
     combination whole. Children: no build-up – every block its own short combination (2–3). Every combination carries
     the theme of the unit.
     role: part / full / short, big: 0 / 1 (which big combination) */
  function pbCombos(n, theme) {
    const tkd = isTkd(),
      ctx = flowCtx(),
      fs = tkd ? {} : focusSpec(theme),
      kid = ageGroup() === "kids",
      bigLen = kid ? [3, 3] : [6, 8],
      shortLen = kid ? [2, 3] : [3, 5],
      nBig = n >= 4 ? 2 : 1;
    // what every unit of the sport carries (17.11.2026): a head kick, Kick Light/K1 low kick, a body shot
    const need = [];
    if (!tkd && !isBox() && !lowTime()) {
      need.push("roundh");
      if (EXTRA[discOf()] && !kneeAnk()) need.push("lowk");
    }
    if (!tkd) need.push("body");
    const has = (c, x) => (x === "body" ? c.some((y) => FT[y] && FT[y].body) : c.includes(x));
    const gen = (len, o = {}) => (tkd ? tkdFlow("pads", false, theme, { must: theme && theme.kick ? theme.kick : undefined, len, avoid: o.avoid }) : flowCombo("pads", theme, { len, noExit: true, strict: true, ...o }));
    // a big combination: as many of the needs as possible, the theme always (only at the very end without it)
    const big = (nd0, avoid) => {
      for (let k = nd0.length; k >= 0; k--) {
        const nd = nd0.slice(0, k);
        for (let t = 0; t < (k ? 1 : 4); t++) {
          const c = gen(bigLen, { avoid, mustFn: (c) => nd.every((x) => has(c, x)) });
          if (c && nd.every((x) => has(c, x)) && (!avoid || !avoid.has(c.join()))) return c;
        }
      }
      // (a theme that does not fit 6–8 actions – e.g. boxing at range: a little shorter, but with the theme)
      for (let t = 0; t < 4; t++) {
        const c = gen(kid ? bigLen : [4, bigLen[1]], { avoid });
        if (c) return c;
      }
      return gen(bigLen, { avoid }) || (tkd ? tkdFlow("pads", false, theme, { len: bigLen }) : flowCombo("pads", theme, { len: bigLen, noExit: true }));
    };
    // my club combination: now and then it is the first big combination (it stays as entered)
    const mine = myCombos("pads"),
      exT = tkd ? "stepb" : "step",
      exit = !!fs.exit || (tkd && theme && ["tallOpp", "shortOpp"].includes(theme.id)),
      strip = (c) => (c[c.length - 1] === exT ? c.slice(0, -1) : c),
      seen = new Set(),
      bigs = [];
    // (the first block needs a clean ending among the first 3–5 actions – children: the first 2)
    // (and keeps the theme: a body shot / body–head pair / the opening of the theme inside it)
    const partOk = (F) => {
      const key = pbKey(F, theme, fs);
      for (let l = kid ? 2 : 3; l <= Math.min(kid ? 2 : 5, F.length - 1); l++) {
        const p = F.slice(0, l);
        if (flowOkG(p, ctx) && (!fs.must || fs.must(p)) && Math.max(...key) < l) return true;
      }
      return false;
    };
    for (let b = 0; b < nBig; b++) {
      let c,
        m = false;
      if (b === 0 && mine.length && Math.random() < 0.5) {
        c = rnd(mine).slice();
        m = true;
      } else {
        // the second one carries what the first did not
        const nd = b === 0 ? need : need.filter((x) => !has(bigs[0].c, x)).concat(need.filter((x) => has(bigs[0].c, x)));
        for (let t = 0; t < 14 && (!c || (n >= 2 && !partOk(c))); t++) c = strip(big(nd, seen));
      }
      seen.add(c.join());
      bigs.push({ c, m });
    }
    // the first block of a big combination: its first 3–5 actions (children 2), a clean ending, the theme kept
    const part = (F) => {
      const key = pbKey(F, theme, fs),
        lo = kid ? 2 : 3,
        hi = Math.min(kid ? 2 : 5, F.length - 1),
        ok = [];
      for (let l = lo; l <= hi; l++) {
        const p = F.slice(0, l);
        if (!flowOkG(p, ctx)) continue;
        ok.push({ p, w: (Math.max(...key) < l ? 3 : 0.05) * (fs.must && !fs.must(p) ? 0.02 : 1) });
      }
      // (no clean ending in the first actions: a short combination with the same opening instead)
      if (!ok.length) return (tkd ? null : flowCombo("pads", theme, { len: [lo, Math.max(lo, hi)], noExit: true, start: [F[0]] })) || F.slice(0, Math.max(lo, Math.min(hi, 3)));
      let r = Math.random() * ok.reduce((s, x) => s + x.w, 0);
      for (const x of ok) if ((r -= x.w) <= 0) return x.p;
      return ok[ok.length - 1].p;
    };
    const out = [];
    // children: no build-up (a combo of 3 has no clean beginning of 2) – every block its own short combination
    if (!kid)
      for (const [b, x] of bigs.entries()) {
        if (n - out.length >= 2) {
          const p = x.m ? x.c.slice(0, Math.min(5, Math.max(2, x.c.length - 1))) : part(x.c);
          seen.add(p.join());
          out.push({ c: p, role: "part", big: b, mine: false });
        }
        out.push({ c: x.c, role: "full", big: b, mine: x.m });
      }
    // the blocks left over: short combinations of the theme, never the same twice
    for (let t = 0; out.length < n && t < 40; t++) {
      const c = gen(shortLen, { avoid: seen });
      if (c && !seen.has(strip(c).join())) {
        seen.add(strip(c).join());
        out.push({ c: strip(c), role: "short", big: -1, mine: false });
      }
    }
    while (out.length < n) out.push({ ...out[out.length - 1] });
    // themes with a way out (against taller / smaller): every block ends with the step out (taekwondo: the step back)
    return out.slice(0, n).map((x) => ({ ...x, c: exit && !x.mine && x.c[x.c.length - 1] !== exT ? [...x.c, exT] : x.c }));
  }
  /* the entry and exit for the pace stage (kickboxing and boxing; the combo stays as it is) */
  function pbDist(c, theme) {
    if (isTkd()) return null;
    const fits = (x) => distOk(x) && (!x.need || c.includes(x.need)) && !(theme && theme.id === "shortOpp" && x.id === "knee"),
      first = techniqueLevel() >= 1 && ageGroup() !== "kids" && Math.random() < 0.35,
      inn = (first ? DIST_FIRST : DIST_IN).filter(fits),
      outs = DIST_OUT.filter(distOk);
    if (!inn.length) return null;
    const e = rnd(inn);
    return { i: e.id, o: first ? null : rnd(outs).id };
  }
  /* the main part of a partner unit: n blocks of w seconds
     Counter actions (Betreiber 28.11.2026): in the second block of each big combination – when the whole combination
     sits, the partner counters in the middle of it (a punch or a kick) and A answers before going on; Grundlage and
     children only in the last big combination; with a defence focus also in the short blocks; Taekwondo none. The
     other blocks end in competition pace (children: with pace). */
  function pbUnit(type, L, theme) {
    const lvl = ageGroup() === "kids" ? 0 : techniqueLevel() || 0,
      kid = ageGroup() === "kids",
      canReact = !isTkd(),
      defF = !!(theme && (theme.id === "def" || theme.counters));
    usedAtt.clear();
    const cs = pbCombos(L.n, theme),
      lastBig = Math.max(...cs.map((x) => x.big));
    const items = cs.map((x, k) => {
      const react = canReact && (kid ? k === cs.length - 1 : (x.role === "full" && (lvl >= 1 || x.big === lastBig)) || (x.role === "short" && defF && lvl >= 1)),
        it = { kind: "round", k: "partner", combo: x.c.slice(), pb: { b: k + 1, n: L.n, c: type === "C" ? 1 : 0, r: x.role, st: pbStages(L.w, react ? "react" : kid ? null : "full") } };
      if (x.mine) it.mine = 1;
      if (react) it.react = partnerReact(it.combo.filter((y) => y !== "step" && y !== "stepb"), theme, { mid: !kid });
      const d = pbDist(it.combo, theme);
      if (d) it.dist = d;
      return it;
    });
    items[0].ease = 1;
    // Full Contact: the 6-kick rule in the pace stage of the first whole combination
    if (discOf() === "fc" && !isBox() && !isTkd() && !kneeAnk()) (items.find((x) => x.pb.r === "full") || items[0]).six = 1;
    return items;
  }
  /* texts: "Block 1 von 3 · 10 Min. am Stück", the stage plan, the current stage */
  function pbStageName(it, s) {
    const P = t("pBlk").st;
    return it.pb.c && s === "clean" ? P.cClean : it.pb.c && s === "tempo" ? P.cTempo : P[s];
  }
  function pbHead(it) {
    const B = t("pBlk"),
      w = it.pb.st.reduce((a, x) => a + x[1], 0);
    return B.lbl(it.pb.b, it.pb.n, fmtMin(w));
  }
  const fmtMin = (sec) => {
    const m = sec / 60,
      de = S.profile.lang === "de";
    return Number.isInteger(m) ? String(m) : de ? String(m).replace(".", ",") : String(m);
  };
  function pbPlan(it, lg) {
    const B = t("pBlk");
    return it.pb.st.map(([s, sec], i) => `${i + 1}. ${fmtMin(sec)} ${B.min} ${pbStageName(it, s)}${s === "tempo" && it.dist ? " – " + distTxt(it, lg) : ""}`);
  }
  /* which stage runs at second el of the block */
  function pbStageAt(it, el) {
    let acc = 0;
    for (let i = 0; i < it.pb.st.length; i++) {
      acc += it.pb.st[i][1];
      if (el < acc) return i;
    }
    return it.pb.st.length - 1;
  }
  const pbBounds = (it) => it.pb.st.slice(0, -1).reduce((a, x) => [...a, (a.length ? a[a.length - 1] : 0) + x[1]], []);
  /* the stage text for the training mode and the voice: "Stufe 2: mit Tempo" */
  function pbNow(it, i, lg) {
    const B = t("pBlk"),
      [s] = it.pb.st[i];
    return `${B.stage(i + 1)}: ${pbStageName(it, s)}${s === "tempo" && it.dist ? ". " + distTxt(it, lg) : ""}`;
  }
  /* the theme of a partner unit, shown above the blocks */
  function pbTheme(sess) {
    const B = t("pBlk"),
      id = sess && sess.theme;
    return (id && B.titles[id]) || B.titles.any;
  }
  /* a stage change in the running block: signal, voice, the card shows the new stage */
  function pbTick(tm) {
    const sess = S.sessions[tm.ds],
      rb = sess && roundBlock(sess),
      it = rb && rb.items[tm.round - 1];
    if (!it || !it.pb || tm.phase !== "work") return false;
    const el = itemWork(tm, tm.round) - tm.left;
    if (!pbBounds(it).includes(el)) return false;
    const i = pbStageAt(it, el);
    bell(2);
    if (voiceOn()) say(inUnit(sess, () => pbNow(it, i, S.profile.lang === "de" ? 0 : 1)), 0.95);
    return true;
  }
