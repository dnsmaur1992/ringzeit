  /* ============ Combinations by movement (Betreiber 25.11.2026, Teil 43) ============
     Before, combos were drawn from fixed lists and changed afterwards (themes, coverage) – nothing checked whether one
     technique gets its swing from the one before. Now every combo is built step by step and each step has to follow
     from the body position the last technique left behind (orthodox stance, V = lead side, H = rear side):
     - Sides alternate: a rear technique turns the hips and loads the lead side (cross → lead hook / lead uppercut / lead
       roundhouse), the lead hook turns them back and loads the rear side (→ cross, rear uppercut, rear roundhouse, low
       kick, knee). The same side twice only as a real double: jab–jab, jab body–jab, jab–lead hook, body hook–head hook.
     - Distance: after a push kick (front kick, side kick, spinning back kick) the partner is away – no hook, uppercut or
       knee; from close range (hook, uppercut, knee) no long kick (front, side, back, axe, hook kick).
     - Weight: after a rear punch the weight is on the lead leg – no lead push, axe or hook kick right after it.
     - Spinning kicks only out of a turn the other way round before (jab, lead hook, lead side kick, lead roundhouse),
       never two spins, a jump only out of a hand technique.
     - A combo opens with a technique that reaches (jab, kick, rarely cross or hook) and ends on a finishing technique
       (power punch or kick) – never on a jab. Kicks in a row: Grundlage at most one, then at most two (kick chains).
     - Taekwondo: kicks land forward, so the legs alternate by themselves; spinning kicks out of a kick that turned the
       body, jumping kicks out of a kick or step, a punch never right after a push kick; steps only at the start.
     The sides come from rawSides() (13-training-flow.js) – the builder and the V/H labels are one rule.
     How often a technique comes up follows how common it is in training (jab, cross, hook, roundhouse first; spinning,
     jumping and Brazilian kicks now and then). */
  const FT = {
    jab: { r: "M", h: 1, open: 3 },
    jabb: { r: "M", h: 1, body: 1, open: 2 },
    cross: { r: "M", h: 1, pow: 1, open: 0.5 },
    crossb: { r: "M", h: 1, pow: 1, body: 1 },
    hook: { r: "C", h: 1, pow: 1, open: 0.4 },
    hookb: { r: "C", h: 1, pow: 1, body: 1 },
    upper: { r: "C", h: 1, pow: 1 },
    front: { r: "L", k: 1, push: 1, open: 2 },
    side: { r: "L", k: 1, push: 1, open: 2 },
    round: { r: "M", k: 1, pow: 1, body: 1, open: 1 },
    roundh: { r: "M", k: 1, pow: 1, head: 1, open: 0.6 },
    lowk: { r: "M", k: 1, pow: 1, open: 1 },
    knee: { r: "C", k: 1, pow: 1 },
    jknee: { r: "M", k: 1, pow: 1, jump: 1 },
    sweep: { r: "M", k: 1 },
    axe: { r: "L", k: 1, head: 1, open: 0.6 },
    hookk: { r: "L", k: 1, head: 1, open: 0.4 },
    back: { r: "L", k: 1, push: 1, spin: 1 },
    shook: { r: "M", k: 1, head: 1, spin: 1 },
    brazil: { r: "M", k: 1, head: 1, open: 0.4 },
    tornado: { r: "M", k: 1, head: 1, spin: 1, jump: 1 },
  };
  // the same side twice: only these real doubles (also in the V/H labels)
  const FLOW_DBL = new Set(["jab>jab", "jab>jabb", "jabb>jab", "jab>hook", "hookb>hook", "hook>hookb"]);
  // a step that loads the next technique especially well (weight 3); everything else allowed weighs 1
  const FLOW_GOOD = new Set([
    "jab>cross", "jabb>cross", "jab>jab", "jabb>jab", "jab>hook", "cross>hook", "cross>hookb", "crossb>hook", "cross>upper",
    "hook>cross", "hookb>hook", "hook>upper", "upper>hook", "hookb>cross", "hook>round", "hook>roundh", "hook>lowk",
    "hookb>roundh", "jab>round", "jab>roundh", "jab>lowk", "front>cross", "side>cross", "jab>knee", "hook>knee",
    "knee>hook", "cross>round", "side>back", "hook>shook", "round>side", "front>round",
  ]);
  const FREQ = { jab: 3, cross: 3, hook: 2.5, round: 2, lowk: 2, knee: 1.5, roundh: 1.2, front: 1.2, upper: 1.2, side: 1, jabb: 1, crossb: 1, hookb: 1, axe: 0.4, back: 0.4, sweep: 0.3, brazil: 0.3, hookk: 0.3, jknee: 0.3, shook: 0.25, tornado: 0.15 };
  const FK_FREQ = { dol: 3, ap: 1.5, dolh: 1.5, yeop: 1.2, jir: 1.2, mireo: 0.8, nae: 0.7, ban: 0.6, dwi: 0.6, dhu: 0.35, ttdol: 0.25, ttyeop: 0.25, dung: 0.8, stepf: 1, slide: 1, swch: 0.6, turn: 0.5 };
  // "more boxing" / "more kicks" in the profile: the preferred side comes up clearly more often; ITF is hand-foot
  const kbFreq = (x, ctx) => (FREQ[x] || 1) * (ctx.focus === "kick" ? (KICKS.has(x) ? 1.9 : 0.6) : ctx.focus === "box" ? (KICKS.has(x) ? 0.55 : 1.6) : 1);
  const fkFreq = (x, ctx) => (isSerId(x) ? 0.3 : FK_FREQ[x] || 1) * (x === "jir" || x === "dung" ? (ctx.itf ? 8 : 0.6) : 1);
  const SPECIAL = new Set(["back", "shook", "tornado", "jknee", "axe", "hookk", "sweep", "brazil"]);
  const FLOW_SPIN_FROM = new Set(["jab", "side", "hook", "round", "roundh", "front"]);
  const REAR_PUNCH = new Set(["cross", "crossb", "upper"]);
  /* taekwondo: kicks, two hand techniques (ITF back fist), steps and series */
  const FK = {
    ap: { k: 1, r: "M", open: 2 },
    dol: { k: 1, r: "M", open: 3 },
    dolh: { k: 1, r: "M", head: 1, open: 1 },
    yeop: { k: 1, r: "L", push: 1, open: 2 },
    mireo: { k: 1, r: "L", push: 1, open: 2 },
    nae: { k: 1, r: "M", head: 1, open: 0.5 },
    ban: { k: 1, r: "M", open: 1 },
    dwi: { k: 1, r: "L", spin: 1 },
    dhu: { k: 1, r: "M", spin: 1, head: 1 },
    ttdol: { k: 1, r: "M", jump: 1 },
    ttyeop: { k: 1, r: "L", jump: 1, push: 1 },
    jir: { h: 1, r: "C", open: 1.5 },
    dung: { h: 1, r: "C", open: 1 },
    stepf: { st: 1, open: 2 },
    slide: { st: 1, open: 2 },
    swch: { st: 1, open: 1 },
    turn: { st: 1, open: 1 },
  };
  const FK_GOOD = new Set(["ap>dol", "dol>dolh", "dol>dwi", "dolh>dwi", "dol>dhu", "dolh>dhu", "yeop>dwi", "mireo>dol", "jir>dol", "dol>nae", "turn>dol", "stepf>dol", "slide>jir", "jir>dolh", "dol>dol", "ap>yeop", "dol>ttdol", "swch>dol"]);
  const isSerId = (x) => !!(tkm().SERIES && tkm().SERIES[x]);
  const fkOf = (x) => FK[x] || (isSerId(x) ? { k: 1, r: "M", ser: 1, open: 1.5 } : null);

  /* weight of the step a → b (0 = not allowed); c = the combo so far (ends with a) */
  function flowW(c, b, ctx) {
    const a = c[c.length - 1];
    if (ctx.tkd) {
      const A = fkOf(a),
        B = fkOf(b);
      if (!A || !B || B.st) return 0;
      if (c.filter((x) => x === b).length >= 2) return 0;
      if (B.spin && (A.spin || !(A.k || a === "turn"))) return 0;
      if (B.jump && (A.spin || A.h || !(A.k || A.st))) return 0;
      if (B.h && A.push) return 0;
      if (B.push && A.push) return 0;
      // a long chain stays clean: at most one spinning and one jumping kick
      if ((B.spin && c.some((x) => fkOf(x) && fkOf(x).spin)) || (B.jump && c.some((x) => fkOf(x) && fkOf(x).jump))) return 0;
      if (B.ser && c.some(isSerId)) return 0;
      if (A.ser && B.spin) return 0;
      if (a === b && !["dol", "jir"].includes(a)) return 0;
      return (FK_GOOD.has(a + ">" + b) ? 3 : 1) * fkFreq(b, ctx);
    }
    const A = FT[a],
      B = FT[b];
    if (!A || !B) return 0;
    const sd = rawSides([...c, b]),
      sa = sd[sd.length - 2],
      sb = sd[sd.length - 1];
    if (sa && sb && sa === sb && !FLOW_DBL.has(a + ">" + b)) return 0;
    if (a === b && a !== "jab" && !(a === "round" && ctx.lvl >= 1)) return 0;
    if (c.filter((x) => x === b).length >= 2) return 0;
    // a long combo stays clean (4–7 actions): at most one special technique (spinning, jumping, axe, hook kick, sweep,
    // Brazilian kick)
    if (SPECIAL.has(b) && c.some((x) => SPECIAL.has(x))) return 0;
    if (A.push && B.r === "C") return 0;
    if (A.r === "C" && B.r === "L") return 0;
    if (B.spin && (A.spin || sa !== "L" || !FLOW_SPIN_FROM.has(a) || (b === "back" && a === "hook"))) return 0;
    if (B.jump && !A.h) return 0;
    if (b === "sweep" && sa !== "R") return 0;
    if (REAR_PUNCH.has(a) && sb === "L" && (B.push || b === "hookk" || b === "axe")) return 0;
    // kicks in a row: Grundlage one, then two
    let run = B.k ? 1 : 0;
    for (let i = c.length - 1; B.k && i >= 0 && FT[c[i]] && FT[c[i]].k; i--) run++;
    if (run > (ctx.lvl >= 1 ? 2 : 1) && !ctx.kickOnly) return 0;
    // the rear hook (and rear body hook) is rare – the hook is the lead hand's punch
    const rare = (b === "hook" || b === "hookb") && sb === "R" ? 0.25 : 1;
    return (FLOW_GOOD.has(a + ">" + b) ? 3 : 1) * kbFreq(b, ctx) * rare;
  }
  const flowEnd = (c, ctx) => {
    const x = c[c.length - 1];
    if (ctx.tkd) return !!(fkOf(x) && fkOf(x).k);
    return !!(FT[x] && (FT[x].pow || FT[x].k));
  };
  /* is a combo built by the rules? (own club combos are never checked – they stay as entered) */
  function flowOk(c, ctx = flowCtx()) {
    const core = c[c.length - 1] === "step" ? c.slice(0, -1) : c;
    if (!core.length) return false;
    // a kick chain (only kicks: wrist limit on the bag, kick chains) may hold more kicks in a row
    if (!ctx.tkd && core.every((x) => KICKS.has(x))) ctx = { ...ctx, kickOnly: true };
    const f = ctx.tkd ? fkOf(core[0]) : FT[core[0]];
    if (!f || !(f.open || ctx.anyOpen) || (ctx.lvl === 0 && f.head && !ctx.anyOpen)) return false;
    for (let i = 1; i < core.length; i++) if (!flowW(core.slice(0, i), core[i], ctx)) return false;
    return core.length === 1 ? !!ctx.single : flowEnd(core, ctx);
  }
  function flowCtx(extra = {}) {
    const lvl = techniqueLevel() || 0;
    return { lvl, tkd: isTkd(), box: isBox(), itf: isTkd() && tkm() === ITFT, focus: lvl === 0 || isBox() || isTkd() ? "bal" : S.profile.focus, ...extra };
  }
  const wPick = (list) => {
    let r = Math.random() * list.reduce((s, x) => s + x.w, 0);
    for (const x of list) if ((r -= x.w) <= 0) return x.id;
    return list[list.length - 1].id;
  };
  /* build one combo: allowed = the techniques that may appear, len = [min, max] techniques (without the exit step);
     start = first technique(s) given, end = allowed last techniques, must = test on the whole combo, exit = a side step
     out at the end, kicks = [min] kick count (taekwondo), avoid = combos already in the unit (joined) */
  function flowGen(spec) {
    const ctx = flowCtx(spec.ctx || {}),
      allowed = [...spec.allowed].filter((x) => (ctx.tkd ? fkOf(x) : FT[x])),
      info = (x) => (ctx.tkd ? fkOf(x) : FT[x]);
    for (let t = 0; t < 160; t++) {
      const [lo, hi] = spec.len,
        L = lo + Math.floor(Math.random() * (hi - lo + 1)),
        c = (spec.start || []).slice();
      let ok = c.every((x) => allowed.includes(x));
      while (ok && c.length < L) {
        const last = c.length === L - 1,
          cand = (c.length
            ? allowed.map((x) => ({ id: x, w: flowW(c, x, ctx) }))
            : allowed.map((x) => ({ id: x, w: (info(x).open || 0) * (ctx.tkd ? fkFreq(x, ctx) : kbFreq(x, ctx)) * (ctx.lvl === 0 && info(x).head ? 0 : 1) }))
          ).filter((x) => x.w > 0 && (!last || ((!spec.end || spec.end.has(x.id)) && flowEnd([...c, x.id], ctx))));
        if (!cand.length) ok = false;
        else c.push(wPick(cand));
      }
      if (!ok || c.length < Math.max(2, lo) || !flowEnd(c, ctx)) continue;
      if (spec.end && !spec.end.has(c[c.length - 1])) continue;
      const kc = ctx.tkd ? c.reduce((n, x) => n + (isSerId(x) ? tkm().SERIES[x].p.filter(([y]) => tkm().KICKS.has(y)).length : info(x).k ? 1 : 0), 0) : 0;
      if (spec.kicks && kc < spec.kicks) continue;
      if (spec.maxKicks && kc > spec.maxKicks) continue;
      if (spec.must && !spec.must(c)) continue;
      if (spec.avoid && spec.avoid.has(c.join()) && t < 120) continue;
      return spec.exit ? [...c, "step"] : c;
    }
    return null;
  }

  /* ---- the specs per sport: which techniques, how long, and what the focus of the unit asks for ---- */
  const KB_LVL = [
    ["jab", "jabb", "cross", "crossb", "hook", "hookb", "front", "round", "roundh", "side", "lowk", "knee"],
    ["upper", "axe", "sweep", "brazil", "shook"],
    ["back", "hookk", "tornado", "jknee"],
  ];
  const BOX_SET = ["jab", "jabb", "cross", "crossb", "hook", "hookb", "upper"];
  function kbAllowed(o = {}) {
    const lvl = techniqueLevel() || 0,
      d = discOf(),
      ka = kneeAnk(),
      kid = ageGroup() === "kids";
    let s = KB_LVL.slice(0, lvl + 1).flat();
    if (isBox()) s = BOX_SET.filter((x) => x !== "upper" || lvl >= 1 || o.must === "upper");
    // the discipline: low kicks in Kick Light and K1, knees only in K1 (WAKO), no sweeps in K1
    s = s.filter((x) => (x !== "lowk" || d === "kl" || d === "k1") && (!["knee", "jknee"].includes(x) || d === "k1") && (x !== "sweep" || d !== "k1"));
    if (ka) s = s.filter((x) => !RISKY.has(x));
    if (young()) s = s.filter((x) => x !== "back");
    if (kid) s = s.filter((x) => !ADV.has(x) && x !== "back");
    if (o.kickOnly) s = s.filter((x) => KICKS.has(x));
    if (o.handOnly) s = s.filter((x) => !KICKS.has(x));
    if (o.noHead) s = s.filter((x) => !HIGHK.has(x));
    return new Set(s);
  }
  // length (Betreiber 26.11.2026): 4–7 actions for everyone and everywhere (also Light Contact); children 2–3
  const COMBO_LEN = [4, 7];
  const kbLen = () => (ageGroup() === "kids" ? [2, 3] : COMBO_LEN.slice());
  const BODY_HEAD = new Set(["jabb>jab", "hookb>hook", "crossb>hook", "hookb>roundh", "round>roundh", "crossb>roundh", "jabb>roundh", "hookb>upper", "crossb>upper"]);
  const hasPair = (c, set) => c.some((x, i) => i > 0 && set.has(c[i - 1] + ">" + x));
  /* the focus of the unit as a rule for the builder (instead of changing finished combos) */
  function focusSpec(theme) {
    const id = theme && theme.id;
    switch (id) {
      case "startJab":
      case "sameStance":
        return { start: ["jab"], end: id === "sameStance" ? new Set(["hook"]) : null };
      case "doubleJab":
        return { start: ["jab", "jab"] };
      case "bodyHead":
        return { must: (c) => hasPair(c, BODY_HEAD) };
      case "frontStart":
        return { start: ["front"] };
      case "sideOpener":
        return { start: ["side"] };
      case "headFinish":
        return { end: new Set(["roundh", "axe", "hookk", "brazil", "shook"]) };
      case "sweepFinish":
        return { end: new Set(["sweep"]) };
      case "lowFinish":
        return { end: new Set(["lowk"]) };
      case "kneeFinish":
        return { end: new Set(["knee"]) };
      case "hookFinish":
        return { end: new Set(["hook"]) };
      case "upperFinish":
        return { end: new Set(["upper"]) };
      case "openStance":
        return { start: ["cross"], end: new Set(isBox() ? ["hook"] : ["round", "roundh", "hook"]) };
      case "tallOpp":
        return { must: (c) => c.some((x) => FT[x] && FT[x].body), exit: true };
      case "shortOpp":
        return { must: (c) => ["jab", "front", "side"].includes(c[0]) && !c.some((x) => FT[x] && FT[x].r === "C"), exit: true };
      default:
        return {};
    }
  }
  /* one combo for a kickboxing or boxing round: kind (shadow, bag, pads) and the focus of the unit; o.must = a
     technique that has to be in it, o.len = other length, o.avoid = combos the unit has already */
  function flowCombo(kind, theme, o = {}) {
    if (isTkd()) return tkdFlow(kind, !!o.noHead, theme, o);
    const p = S.profile,
      lim = p.limits,
      ka = kneeAnk(),
      kickOnly = !isBox() && ((kind === "bag" && lim.includes("wrist")) || (lim.includes("shoulder") && (kind === "bag" || kind === "pads"))),
      handOnly = !isBox() && !kickOnly && ka && kind === "bag",
      allowed = kbAllowed({ kickOnly, handOnly, noHead: o.noHead || lowTime(), must: o.must });
    const fs = kickOnly || handOnly ? {} : focusSpec(theme),
      must0 = o.must ? (c) => c.includes(o.must) && (!fs.must || fs.must(c)) : fs.must,
      must = o.mustFn ? (c) => o.mustFn(c) && (!must0 || must0(c)) : must0,
      len = o.len || kbLen(),
      base = { allowed, len, ctx: { kickOnly }, avoid: o.avoid };
    // kick chains (7f): from level 1 about every fifth combo only kicks – not for children, not with a knee/ankle limit;
    // "more boxing" fewer, "more kicks" more
    const chainP = p.focus === "box" ? 0.08 : p.focus === "kick" ? 0.3 : 0.22;
    if (!kickOnly && !handOnly && !isBox() && !o.must && !o.len && !fs.start && !fs.end && !fs.must && techniqueLevel() >= 1 && ageGroup() !== "kids" && !ka && Math.random() < chainP) {
      const kc = flowGen({ allowed: new Set([...allowed].filter((x) => KICKS.has(x))), len: [4, 5], ctx: { kickOnly: true }, avoid: o.avoid });
      if (kc) return kc;
    }
    const one = () =>
      flowGen({ ...base, start: o.start || (fs.start && fs.start.every((x) => allowed.has(x)) ? fs.start : null), end: fs.end && [...fs.end].some((x) => allowed.has(x)) ? fs.end : null, must, exit: fs.exit && !o.noExit }) ||
      flowGen({ ...base, must: o.must ? (c) => c.includes(o.must) : null }) ||
      flowGen({ ...base, len: [2, Math.max(2, len[1])] });
    const c = one();
    return c || (kickOnly ? ["front", "round"] : handOnly || isBox() ? ["jab", "cross"] : ["jab", "cross"]);
  }
  /* taekwondo: kick chains by the same idea (legs alternate, spins out of a turning kick, jumps out of a kick) */
  function tkdFlow(kind, noHead, theme, o = {}) {
    const M = tkm(),
      ctx = tkdCtx(),
      lim = S.profile.limits,
      lvl = techniqueLevel() || 0;
    let allowed = Object.keys(M.TECH).filter((x) => M.allowed(x, ctx) && fkOf(x) && !["stepb", "steps"].includes(x));
    if (lim.includes("wrist") || lim.includes("shoulder")) allowed = allowed.filter((x) => !TKDT.HANDS.has(x) && !(M.HANDS && M.HANDS.has(x)) && x !== "dung" && x !== "jir");
    if (noHead || lowTime()) allowed = allowed.filter((x) => !M.HEAD.has(x));
    // spinning hook and jumping kicks (7h): about every fifth combo – with 4–7 actions they would come in most of them
    const SJ = ["dhu", "ttdol", "ttyeop"],
      sj = allowed.filter((x) => SJ.includes(x)),
      wantSJ = sj.length && Math.random() < 0.2;
    if (!wantSJ) allowed = allowed.filter((x) => !SJ.includes(x));
    const need = (noHead || M === ITFT ? 1 : 2) + lvl,
      kicks = lvl >= 1 && Math.random() < 0.75 ? need : Math.max(2, need - 1),
      hi = ctx.kid ? 3 : COMBO_LEN[1];
    const allowSet = new Set(allowed),
      spect = M === ITFT && lvl >= 1 && Math.random() < 0.45 ? allowed.filter((x) => ITF_SPECT.has(x)) : [],
      pref = theme && theme.prefer && Math.random() < 0.75 ? theme.prefer.filter((x) => allowSet.has(x)) : [],
      kf = theme && theme.kick && Math.random() < 0.75 && allowSet.has(theme.kick) ? theme.kick : null,
      mustK = o.must || kf;
    const must = (c) =>
      (!spect.length || c.some((x) => spect.includes(x))) &&
      (!pref.length || c.some((x) => pref.includes(x))) &&
      (!mustK || hasKick(c, mustK, M)) &&
      (!wantSJ || c.some((x) => sj.includes(x)));
    const base = { allowed: allowSet, len: o.len || (ctx.kid ? [2, 3] : COMBO_LEN.slice()), kicks: ctx.kid ? 2 : Math.min(kicks, hi), maxKicks: ctx.kid ? 3 : hi, ctx: {}, avoid: o.avoid };
    return (
      (o.start && flowGen({ ...base, start: o.start, must })) ||
      flowGen({ ...base, must }) ||
      flowGen({ ...base, must: mustK ? (c) => hasKick(c, mustK, M) : null }) ||
      flowGen({ ...base, kicks: 2 }) || ["ap", "dol"]
    );
  }
  /* kicks to body height (opening round at 70 %, short on time, safety net): the head kick becomes its body version –
     when that breaks the movement (a spinning hook kick turns into a back kick after a hook …), a combo of the same
     length without head kicks is built instead. Own club combos only get the body version. */
  function lowerFlow(c, kind, theme, mine) {
    const m = c.map((x) => LOWER[x] || x);
    if (mine || isTkd() || m.join() === c.join() || flowOk(m)) return m;
    const n = c[c.length - 1] === "step" ? c.length - 1 : c.length;
    // (a body shot it had stays in the new one)
    const body = (x) => x.some((y) => FT[y] && FT[y].body),
      keep = body(c);
    return flowCombo(kind === "bag" || kind === "shadow" ? kind : "pads", theme, { noHead: true, len: [Math.max(2, n), Math.max(2, n)], mustFn: (x) => !keep || body(x) });
  }
