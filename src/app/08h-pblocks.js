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
  /* the combinations of the blocks, easy → hard */
  function pbCombos(n, theme) {
    const tkd = isTkd(),
      ctx = flowCtx(),
      fs = tkd ? {} : focusSpec(theme);
    // what every unit of the sport carries (17.11.2026): a head kick, Kick Light/K1 low kick, K1 knee, a body shot
    const need = [];
    if (!tkd && !isBox() && !lowTime()) {
      need.push("roundh");
      if (EXTRA[discOf()] && !kneeAnk()) need.push("lowk");
    }
    if (!tkd) need.push("body");
    const has = (c, x) => (x === "body" ? c.some((y) => FT[y] && FT[y].body) : c.includes(x));
    // my club combination: now and then it is the thread of the unit (it stays as entered)
    const mine = myCombos("pads");
    let F = null,
      mineF = false;
    if (mine.length && Math.random() < 0.5) {
      F = rnd(mine).slice();
      mineF = true;
    }
    // the whole combination: 4–7 actions (children 3) – long enough that every block can add one; already the first
    // block has at least 4 actions (26.11.2026)
    const kid = ageGroup() === "kids",
      minL = kid ? 2 : 4,
      fLen = kid ? [3, 3] : [Math.min(7, Math.max(4, n + 3)), 7];
    for (let k = need.length; !F && k >= 0; k--) {
      const nd = need.slice(0, k);
      let c = tkd ? tkdFlow("pads", false, theme, { must: theme && theme.kick ? theme.kick : undefined, len: fLen }) : flowCombo("pads", theme, { len: fLen, noExit: true, strict: true, mustFn: (c) => nd.every((x) => has(c, x)) });
      if (c && nd.every((x) => has(c, x))) F = c;
      // (none: the theme with any length 4–7, only then without it)
      else if (k === 0) {
        for (let t = 0; !c && !tkd && t < 4; t++) c = flowCombo("pads", theme, { len: kid ? [3, 3] : [4, 7], noExit: true, strict: true });
        F = c || flowCombo("pads", theme, { len: fLen, noExit: true });
      }
    }
    // themes with a way out (against taller / smaller, 26.11.2026): every block ends with the step out
    // (taekwondo: the step back)
    const exT = tkd ? "stepb" : "step",
      exit = (F[F.length - 1] === exT || !!fs.exit || (tkd && theme && ["tallOpp", "shortOpp"].includes(theme.id))) && !mineF;
    if (F[F.length - 1] === exT) F = F.slice(0, -1);
    // the blocks: nested windows around the key of the theme, one technique more each time
    const out = [F];
    if (!mineF) {
      const win = pbWindows(F, pbKey(F, theme, fs), ctx, minL);
      let cur = { i: 0, j: F.length - 1 };
      while (out.length < n) {
        const inner = win.filter((w) => w.i >= cur.i && w.j <= cur.j && w.j - w.i < cur.j - cur.i).sort((a, b) => b.j - b.i - (a.j - a.i) || a.i - b.i);
        if (!inner.length) break;
        cur = inner[0];
        out.unshift(cur.c);
      }
    } else
      for (let l = F.length - 1; out.length < n && l >= minL; l--) out.unshift(F.slice(0, l));
    // a combination too short for that: more combinations of the theme with the same beginning (or, for a finishing
    // theme, the same finish) – shorter first, never the same twice
    const seen = new Set(out.map((c) => c.join())),
      key = pbKey(F, theme, fs),
      begN = mineF || fs.end ? 0 : Math.min(F.length - 1, fs.start || (theme && theme.id === "bodyHead") ? Math.max(...key) + 1 : 1),
      beg = F.slice(0, begN);
    for (let t = 0; out.length < n && t < 48; t++) {
      // (after 16 tries without a new one: any combination of the theme, after 32 any combination at all)
      if (t === 16) beg.length = 0;
      // (the theme always stays – 28.11.2026)
      const hi = Math.max(begN + 1, minL, F.length - 1 - (t % 2)),
        o = { len: [Math.max(minL, begN + 1), Math.max(minL, hi)], noExit: true, avoid: seen, start: beg.length ? beg : null, must: tkd && theme && theme.kick ? theme.kick : undefined },
        c = tkd ? tkdFlow("pads", false, theme, o) : flowCombo("pads", theme, { ...o, strict: true });
      // (never harder than the whole combination of the last block)
      if (c && !seen.has(c.join()) && (!beg.length || c.join().startsWith(beg.join())) && (mineF || comboLevel(c) <= comboLevel(F))) {
        seen.add(c.join());
        out.unshift(c);
      }
    }
    while (out.length < n) out.unshift(out[0]);
    out.sort((a, b) => comboLevel(a) - comboLevel(b) || a.length - b.length);
    // the full combination is the last block (my club combination stays marked)
    const fi = out.findIndex((c) => c === F);
    if (fi >= 0 && fi !== out.length - 1) out.push(...out.splice(fi, 1));
    return out.map((c) => ({ c: exit ? [...c, exT] : c, mine: mineF && c === F }));
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
     Counter actions (Betreiber 25.11.2026, after Teil 43): fewer – about 2 of 5 blocks (40 %, at least 1), the later,
     harder blocks; with a defence focus 3 of 5. The partner counters in the middle of the combo – a punch or a kick –
     and A has to answer it before going on with the combo (when the combo is too short for that: after it). Grundlage
     and children: one, in the last block. The other blocks end in competition pace (children: with pace). */
  function pbUnit(type, L, theme) {
    const lvl = ageGroup() === "kids" ? 0 : techniqueLevel() || 0,
      kid = ageGroup() === "kids",
      canReact = !isTkd(),
      defF = !!(theme && (theme.id === "def" || theme.counters)),
      nReact = !canReact ? 0 : lvl === 0 ? 1 : Math.max(1, Math.round(L.n * (defF ? 0.6 : 0.4)));
    usedAtt.clear();
    const cs = pbCombos(L.n, theme);
    const items = cs.map((x, k) => {
      const react = k >= L.n - nReact,
        it = { kind: "round", k: "partner", combo: x.c.slice(), pb: { b: k + 1, n: L.n, c: type === "C" ? 1 : 0, st: pbStages(L.w, react ? "react" : kid ? null : "full") } };
      if (x.mine) it.mine = 1;
      if (react) it.react = partnerReact(it.combo.filter((y) => y !== "step"), theme, { mid: !kid });
      const d = pbDist(it.combo, theme);
      if (d) it.dist = d;
      return it;
    });
    items[0].ease = 1;
    // Full Contact: the 6-kick rule in the pace stage of one block (not the first when there are more)
    if (discOf() === "fc" && !isBox() && !isTkd() && !kneeAnk()) items[Math.min(1, items.length - 1)].six = 1;
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
