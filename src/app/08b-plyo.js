  /* ============ Federn & Antritt (Betreiber 17.11.2026) ============
     Stance, footwork, movement patterns and the spring of feet and ankles: catalogue drills of the category "plyo".
     sp   where a drill belongs: "box", the kickboxing disciplines lc/kl/fc/k1 and the taekwondo styles wt/itf
     use  "pow" = counted or short timed jumps (strength unit, closing block of the focus, technique & conditioning),
          "cmd" = footwork drills that also fill a conditioning round
     kind how it is counted (Schritt 5, E13/E27–E29): "bounce" = loose bouncing and footwork (Federzeit, seconds),
          "jump" = timed jumps on both legs (Federzeit; landings only as an estimate, 2 per second),
          "single" = timed jumps on one leg (Federzeit, estimate 1.5 per second and leg; needs an allowance for
          intensive landings), "reps" = counted landings (land = all of them, both legs; every one is one-legged)
     cmd  the command list: called in the work phases of the exercise or round timer, shown and said from the same list */
  const PLYO_ALL = "box lc kl fc k1 wt itf",
    PLYO_KB = "lc kl fc k1",
    PLYO_TKD = "wt itf";
  const PLYO = {
    "plyo.pogo_jumps": { sp: PLYO_ALL, use: "pow", kind: "jump" },
    "plyo.stance_bounce": { sp: PLYO_ALL, use: "cmd", kind: "bounce", cmd: "bounce" },
    "plyo.line_jumps": { sp: PLYO_ALL, use: "pow", kind: "jump" },
    "plyo.boxer_skip": { sp: "box " + PLYO_KB, use: "cmd", kind: "bounce" },
    "plyo.four_square": { sp: PLYO_ALL, use: "pow", kind: "jump" },
    "plyo.quarter_turn": { sp: "box " + PLYO_KB, use: "pow", kind: "jump" },
    "plyo.switch_jumps": { sp: PLYO_KB + " " + PLYO_TKD, use: "cmd", kind: "jump", cmd: "switch" },
    "plyo.shuffle": { sp: "box " + PLYO_KB, use: "cmd", kind: "bounce", cmd: "shuffle" },
    "plyo.burst": { sp: PLYO_ALL, use: "cmd", kind: "bounce", cmd: "burst" },
    "plyo.hop_stick": { sp: PLYO_ALL, use: "pow", kind: "reps", land: 30 },
    "plyo.hop_check": { sp: "kl k1", use: "pow", kind: "reps", land: 36 },
    "plyo.hop_chamber": { sp: PLYO_KB + " " + PLYO_TKD, use: "pow", kind: "reps", land: 30 },
    "plyo.single_pogo": { sp: PLYO_ALL, use: "pow", kind: "single" },
    "plyo.single_line_jumps": { sp: PLYO_ALL, use: "pow", kind: "single" },
    "plyo.hop_kick": { sp: PLYO_KB + " " + PLYO_TKD, use: "pow", kind: "reps", land: 24 },
    "plyo.takeoff": { sp: PLYO_TKD, use: "pow", kind: "reps", land: 24 },
    "plyo.react": { sp: PLYO_ALL, use: "cmd", kind: "bounce", cmd: "dirs" },
    "plyo.bounce_slip": { sp: "box " + PLYO_KB, use: "cmd", kind: "bounce", cmd: "slip" },
    // rolling under a hook: boxing only – in kickboxing knees (K1) and head kicks make the deep duck a different move (E6, 17.11.2026)
    "plyo.bounce_roll": { sp: "box", use: "cmd", kind: "bounce", cmd: "roll" },
  };
  const plyoTag = () => (isBox() ? "box" : isTkd() ? tkdUnitStyle() : discOf() || "lc");
  const plyoFits = (key) => !PLYO[key] || PLYO[key].sp.split(" ").includes(plyoTag());
  /* internal limits per unit by fitness level (E13, own values – no measured contacts, no confirmed safety limits):
     Federzeit 600/900/1200 s, landings 40/80/120, of them intensive 0/20/40; a deload week −30 %. No settling-in phase
     after a break (E27). Skipping with a rope does not count (E29). The technique level only unlocks the difficulty. */
  const PLYO_LIM = { fed: [600, 900, 1200], land: [40, 80, 120], int: [0, 20, 40] };
  let buildDate = null;
  function plyoLimits() {
    const f = Math.max(0, Math.min(2, fitnessLevel())),
      k = buildDate && weekLoad(buildDate).deload ? 0.7 : 1;
    return { fed: Math.round(PLYO_LIM.fed[f] * k), land: Math.round(PLYO_LIM.land[f] * k), int: Math.round(PLYO_LIM.int[f] * k) };
  }
  /* what one drill asks for: work seconds (Federzeit), counted landings, intensive landings, estimated landings */
  function plyoCost(key, it) {
    const p = PLYO[key];
    if (!p) return { fed: 0, land: 0, int: 0, est: 0 };
    if (p.kind === "reps") {
      const n = plyoReps(key, it);
      return { fed: 0, land: n, int: n, est: 0 };
    }
    const rx = plyoRx(key, it),
      work = rx ? (rx.k === "sidedsets" ? rx.n * rx.s * 2 : rx.n * rx.on) : 0;
    return {
      fed: work,
      land: 0,
      int: 0,
      est: p.kind === "jump" ? Math.round(work * 2) : p.kind === "single" ? Math.round(work * 1.5) : 0,
      single: p.kind === "single",
    };
  }
  /* the effective prescription of a timed drill (with the progression of the unit's item, Schritt 7) */
  function plyoRx(key, it) {
    const rx = RX[key];
    if (!rx) return null;
    const pr = it && it.prog;
    if (!pr) return rx;
    if (rx.k === "sidedsets") return { ...rx, s: rx.s + (pr.add || 0) };
    return { ...rx, on: rx.on + (pr.add || 0), off: Math.max(10, rx.off - (pr.rest || 0)) };
  }
  /* counted landings of a rep drill, all sets and both legs (with the progression: +1 per step in one set) */
  const plyoReps = (key, it) => (PLYO[key] && PLYO[key].land ? PLYO[key].land + 2 * ((it && it.prog && it.prog.add) || 0) : 0);
  /* the whole unit: all blocks and rounds (a bounce round or a footwork drill in a round = its round time) */
  function plyoBudget(sess) {
    const o = { fed: 0, land: 0, int: 0, est: 0 };
    for (const b of (sess && sess.blocks) || [])
      for (const it of b.items || []) {
        const e = it.id && EX[it.id] && PLYO[EX[it.id].key] ? EX[it.id].key : null;
        if (b.rounds && (it.k === "bounce" || e)) o.fed += b.w || 180;
        else if (e) {
          const c = plyoCost(e, it);
          o.fed += c.fed;
          o.land += c.land;
          o.int += c.int;
          o.est += c.est;
        }
      }
    return o;
  }
  const plyoFitsBudget = (cur, c, L) =>
    cur.fed + c.fed <= L.fed && cur.land + c.land <= L.land && cur.int + c.int <= L.int && !(c.single && L.int <= 0);
  /* a "Federn & Antritt" unit: only as many bounce rounds as the Federzeit allows – the rest stay footwork rounds
     without the bouncing; the closing block then gets what is left */
  function plyoLimitRounds(items, w) {
    const allowed = Math.floor(plyoLimits().fed / (w || 180));
    let k = 0;
    for (const r of items) if (r.k === "bounce" && ++k > allowed) r.k = "foot";
    return items;
  }
  /* ---- Progression (Schritt 7, E5/E30–E34, Betreiber 17.11.2026) ----
     Automatic and cautious, per drill of the closing block (not in rounds). Evidence: the last 3 own units with this
     drill at the current step all complete, effort (RPE) ≤ 6 and no complaints (a note with pain/complaints or an active
     knee/ankle limit) → one step up. One step is about +5 %: +1 repetition in one set (rep drills) or +5 s per set (timed
     drills). Order: first the amount up to +4 steps (and only within the unit's limits), then the rest −5 s per step to
     −15 s at most, then the commands 1 s faster (once). A signal – RPE ≥ 9, complaints or the drill not done (aborted) –
     goes one step back. A deload week keeps the step reached but trains it without the additions. The step is stored
     with the drill in the unit and in the log entry ("plyo": id, step, done); older entries without it start at 0.
     Rebuilding an unbegun unit computes the same step again – nothing moves without a new entry. */
  const PROG_ADD = 4,
    PROG_MAX = PROG_ADD + 3 + 1;
  function progOf(lv) {
    lv = Math.max(0, Math.min(PROG_MAX, lv || 0));
    return { lv, add: Math.min(lv, PROG_ADD), rest: lv > PROG_ADD ? 5 * Math.min(3, lv - PROG_ADD) : 0, cmd: lv > PROG_ADD + 3 ? 1 : 0 };
  }
  const plyoComplaint = (e) => /schmerz|beschwerd|weh\b|pain|hurt|sore/i.test((e && e.note) || "") || kneeAnk();
  function plyoHistory(id) {
    return (S.log || [])
      .filter((e) => e && e.src === "own" && Array.isArray(e.plyo) && (!buildDate || e.date < buildDate) && e.plyo.some((x) => x.id === id))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : String(b.id).localeCompare(String(a.id))))
      .map((e) => ({ e, x: e.plyo.find((x) => x.id === id) }));
  }
  function plyoStep(id) {
    const h = plyoHistory(id);
    if (!h.length) return 0;
    const lv = h[0].x.lv || 0;
    // a signal in the last unit with this drill: one step back
    if (!h[0].x.done || h[0].e.rpe >= 9 || plyoComplaint(h[0].e)) return Math.max(0, lv - 1);
    const ok = h.slice(0, 3).filter((r) => (r.x.lv || 0) === lv && r.x.done && r.e.rpe > 0 && r.e.rpe <= 6 && !plyoComplaint(r.e));
    return ok.length === 3 ? Math.min(PROG_MAX, lv + 1) : lv;
  }
  /* the step of a drill for this unit: deload keeps it without additions; the amount stays inside the limits */
  function plyoProg(e, cur, L) {
    const lv = plyoStep(e.id);
    if (!lv) return null;
    if (buildDate && weekLoad(buildDate).deload) return { lv, add: 0, rest: 0, cmd: 0, dl: 1 };
    const p = progOf(lv);
    while (p.add > 0 && !plyoFitsBudget(cur, plyoCost(e.key, { prog: p }), L)) p.add--;
    return p;
  }
  /* up to n drills of one use (or any), place, equipment, limits, level and sport checked by okEx, within the limits */
  function plyoPick(n, loc, eq, used, use, base = null) {
    const L = plyoLimits(),
      cur = { fed: 0, land: 0, int: 0, ...(base || {}) },
      pool = shuffle(EX.filter((e) => e.cat === "plyo" && (!use || PLYO[e.key].use === use) && okEx(e, loc, eq) && !used.has(e.id))),
      out = [];
    for (const e of pool) {
      if (out.length >= n) break;
      if (!plyoFitsBudget(cur, plyoCost(e.key), L)) continue;
      const pr = plyoProg(e, cur, L),
        c = plyoCost(e.key, pr ? { prog: pr } : null);
      out.push(pr ? { ...e, prog: pr } : e);
      cur.fed += c.fed;
      cur.land += c.land;
      cur.int += c.int;
    }
    out.forEach((e) => used.add(e.id));
    return out.map((e) => (e.prog ? { kind: "ex", id: e.id, prog: e.prog } : { kind: "ex", id: e.id }));
  }
  /* the small line in the unit (E28): only when it contains jumps or bouncing; estimates are marked */
  function plyoLine(sess) {
    const o = plyoBudget(sess);
    if (!o.fed && !o.land) return "";
    const de = S.profile.lang === "de",
      parts = [];
    if (o.fed) parts.push(de ? `Federzeit ${fmt(o.fed)} Min.` : `Bounce time ${fmt(o.fed)} min`);
    if (o.land) parts.push(de ? `${o.land} Landungen (davon ${o.int} einbeinig)` : `${o.land} landings (${o.int} on one leg)`);
    if (o.est) parts.push(de ? `ca. ${o.est} Bodenkontakte geschätzt` : `approx. ${o.est} ground contacts estimated`);
    return (de ? "Federn & Antritt heute: " : "Bounce & burst today: ") + parts.join(" · ");
  }

  /* ---- Schwerpunkt-Reihenfolge (E3/E9, Betreiber 17.11.2026) ----
     The focus that has waited longest among the units with technique rounds (technique, technique & conditioning,
     sparring) of the same sport – taekwondo: the same style – comes next; a tie (e.g. never used) is decided by chance.
     No penalty for the broad foci any more: footwork, defence and bounce come up in turn like every other focus.
     A weight only stretches the waiting time: "more boxing/kicks" ×1.5 for its side (÷1.5 for the other), the opponent
     focus that fits one's build ×2 (E16). */
  function rotatePick(ok, weight = () => 1) {
    const sp = sportNow(),
      sty = isTkd() ? tkdUnitStyle() : null,
      hist = Object.values(S.sessions)
        .filter((s) => s && s.theme && ["T", "C", "P"].includes(s.type) && (s.sport || mainSport()) === sp && (!sty || (s.tstyle || tkdStyle()) === sty))
        .sort((a, b) => (b.created || 0) - (a.created || 0))
        .map((s) => s.theme),
      age = (id) => {
        const i = hist.indexOf(id);
        return i < 0 ? Infinity : i + 1;
      };
    const sc = ok.map((th) => ({ th, s: age(th.id) * weight(th), r: Math.random() }));
    sc.sort((a, b) => b.s - a.s || a.r - b.r);
    return sc.length ? sc[0].th : null;
  }
  /* own build for the opponent foci (E8/E15, Betreiber 17.11.2026): ponderal index = height (cm) ÷ ∛weight (kg) with the
     limit of the weight class of the next tournament, else the last logged weight. Above 44.5 rather tall, below 41.5
     rather short for the class – an own rule of thumb, shown as an estimate. No height or no weight: nothing. */
  function buildOf(p = S.profile) {
    const h = +p.height;
    if (!(h >= 120 && h <= 230)) return null;
    const nc = nextComp(),
      last = S.weights.length ? S.weights[S.weights.length - 1].kg : null,
      kg = (nc && nc.wc) || last;
    if (!kg) return null;
    const pi = h / Math.cbrt(kg);
    return { pi: Math.round(pi * 10) / 10, kg, cls: !!(nc && nc.wc), k: pi > 44.5 ? "tall" : pi < 41.5 ? "short" : "mid" };
  }
  /* weight of a focus in the rotation: More boxing/kicks and the own build */
  function focusWeight(th) {
    const focus = techniqueLevel() === 0 || isTkd() ? "bal" : S.profile.focus;
    let w = 1;
    if ((focus === "box" && th.tag === "hand") || (focus === "kick" && th.tag === "kick")) w *= 1.5;
    if ((focus === "box" && th.tag === "kick") || (focus === "kick" && th.tag === "hand")) w /= 1.5;
    const b = buildOf();
    // a tall athlete meets smaller opponents more often – and the other way round
    if (b && ((b.k === "tall" && th.id === "shortOpp") || (b.k === "short" && th.id === "tallOpp"))) w *= 2;
    return w;
  }
  /* ---- commands: one list gives the word on the screen and the word that is said ---- */
  const CMD_W = {
    de: { fwd: "Vor", back: "Zurück", left: "Links", right: "Rechts", stop: "Stopp", sw: "Wechsel", sw2: "Doppelwechsel", fwd2: "Doppelt vor", back2: "Doppelt zurück", slip: "Slip", roll: "Rollen" },
    en: { fwd: "Forward", back: "Back", left: "Left", right: "Right", stop: "Stop", sw: "Switch", sw2: "Double switch", fwd2: "Double forward", back2: "Double back", slip: "Slip", roll: "Roll" },
  };
  /* the gap between two commands (seconds) by technique level */
  const CMD_GAP = [
    [4, 6],
    [3, 5],
    [2, 4],
  ];
  function cmdList(set, sp) {
    const box = sp === "boxing",
      tkd = sp === "taekwondo",
      burst = box ? [["jab"], ["jab", "cross"]] : tkd ? [["ap"], ["dol"]] : [["jab"], ["front"], ["jab", "cross"]],
      bounce = ["fwd", "back", "stop", ...(box ? [] : ["sw"])];
    switch (set) {
      case "bounce":
        return bounce;
      case "switch":
        return ["sw", "sw", "sw2", "stop"];
      case "shuffle":
        return ["fwd", "back", "fwd2", "back2"];
      case "burst":
        return burst;
      case "dirs":
        return ["fwd", "back", "left", "right"];
      case "slip":
        return ["slip", "slip", ["slip", ["cross"]], ["slip", ["hook"]]];
      case "roll":
        return ["roll", "roll", ["roll", ["hook"]], ["roll", ["cross"]]];
      case "round":
        return [...bounce, ...burst];
    }
    return [];
  }
  /* which command list an item has: a drill of the catalogue or a "Federn & Antritt" technique round */
  function cmdOf(it) {
    if (!it) return null;
    if (it.k === "bounce") return "round";
    const e = it.id && EX[it.id];
    return (e && PLYO[e.key] && PLYO[e.key].cmd) || null;
  }
  /* runs fn in the sport (and taekwondo style) of a unit, so names and levels are those of the unit */
  function inUnit(sess, fn) {
    const prev = buildSport,
      prevStyle = unitStyle;
    buildSport = (sess && sess.sport) || null;
    unitStyle = sess && sess.sport === "taekwondo" ? sess.tstyle || null : null;
    try {
      return fn();
    } finally {
      buildSport = prev;
      unitStyle = prevStyle;
    }
  }
  /* the next command: { show, speak } – never the same twice in a row */
  function cmdPick(set, sess, last) {
    return inUnit(sess, () => {
      const W = CMD_W[S.profile.lang === "de" ? "de" : "en"],
        list = cmdList(set, sportNow()),
        // shown = said: the words of the speech, parts separated by " · " on the screen
        all = list.map((x) => {
          const speak = typeof x === "string" ? W[x] : typeof x[0] === "string" && Array.isArray(x[1]) ? `${W[x[0]]}, ${comboWords(x[1])}` : comboWords(x);
          return { show: speak.replace(/, /g, " · "), speak };
        }),
        fresh = all.filter((c) => c.show !== last);
      return rnd(fresh.length ? fresh : all);
    });
  }
  const cmdGap = (sess, it) =>
    inUnit(sess, () => {
      const g = CMD_GAP[techniqueLevel()] || CMD_GAP[0];
      // progression (last stage): the commands come 1 s faster, never closer than 2 s
      return Math.max(2, g[0] + Math.floor(Math.random() * (g[1] - g[0] + 1)) - ((it && it.prog && it.prog.cmd) || 0));
    });
  /* the log of a finished unit: per drill of the closing blocks its step and whether it was done */
  function plyoLog(sess) {
    const out = [];
    ((sess && sess.blocks) || []).forEach((b, bi) => {
      if (b.rounds) return;
      b.items.forEach((it, ni) => {
        if (it.kind === "ex" && EX[it.id] && EX[it.id].cat === "plyo") out.push({ id: it.id, lv: (it.prog && it.prog.lv) || 0, done: !!itemDone(sess, bi, ni) });
      });
    });
    return out.length ? out : undefined;
  }
  /* dose text of a drill with its step: timed from plyoRx, counted per set (+1 in one set per step) */
  function plyoDose(key, it, de) {
    const p = it && it.prog;
    if (PLYO[key] && PLYO[key].kind === "reps") {
      const base = DOSE_TXT[key] ? DOSE_TXT[key][de ? 0 : 1] : "";
      if (!p || (!p.add && !p.rest)) return base;
      const per = PLYO[key].land / 6,
        sets = [0, 1, 2].map((i) => per + Math.floor(p.add / 3) + (i < p.add % 3 ? 1 : 0)),
        same = sets.every((x) => x === sets[0]);
      return base
        .replace(/^3 × \d+/, same ? `3 × ${sets[0]}` : sets.join(" · "))
        .replace(/(\d+) s (Pause|rest)/, (m, s, w) => `${Math.max(10, +s - (p.rest || 0))} s ${w}`);
    }
    const rx = plyoRx(key, it);
    return rx ? rxText(rx, de ? "de" : "en") : "";
  }
  /* said like the coach calls of the round timer; with the announcements off only shown, with a short signal */
  function cmdSay(c) {
    if (voiceOn()) say(c.speak, 1.05);
    else beep(880, 0.08, 1);
  }
  function cmdShow(txt) {
    const el = typeof document !== "undefined" && document.getElementById("cmdcall");
    if (!el || el.textContent === (txt || "")) return;
    el.textContent = txt || "";
    if (txt) {
      el.classList.remove("pop");
      void el.offsetWidth;
      el.classList.add("pop");
    }
  }
  const restLike = (ph) => !ph || ph.prep || /Pause|Rest|Wechsel|Change/.test(ph.label || "");
  /* exercise timer: commands only in a running work phase, the first after 3–4 s, none in the last 2 s and none
     while the 10-second call is due; a paused timer does not tick, so nothing is called */
  function cmdTickExercise(tm, changed) {
    const sess = S.sessions[tm.ds],
      it = sess && sess.blocks[tm.bi] && sess.blocks[tm.bi].items[tm.ni],
      set = tm.restOnly ? null : cmdOf(it),
      ph = tm.phases[tm.index];
    if (tm.cmdI !== tm.index) {
      tm.cmdI = tm.index;
      tm.cmdAt = 3000 + Math.floor(Math.random() * 1000);
      tm.cmdTxt = "";
    }
    if (!set || !tm.running || tm.done || restLike(ph)) {
      tm.cmdTxt = "";
      return;
    }
    const el = ph.seconds * 1000 - (tm.remainingMs || 0),
      tenCall = ph.seconds >= 20 && tm.remainingMs > 7500 && tm.remainingMs <= 11000;
    if (!changed && el >= tm.cmdAt && tm.remainingMs > 2000 && !tenCall) {
      const c = cmdPick(set, sess, tm.cmdTxt || tm.cmdLast);
      tm.cmdTxt = tm.cmdLast = c.show;
      cmdSay(c);
      tm.cmdAt = el + cmdGap(sess, it) * 1000;
    }
  }
  /* round timer (one call per timer second): the same in the work phase of a round with commands */
  function cmdTickRound(tm) {
    const sess = S.sessions[tm.ds],
      rb = sess && roundBlock(sess),
      it = rb && rb.items[tm.round - 1],
      set = tm.phase === "work" ? cmdOf(it) : null;
    if (!set) {
      tm.cmdTxt = "";
      return;
    }
    if (tm.cmdR !== tm.round) {
      tm.cmdR = tm.round;
      tm.cmdTxt = "";
      tm.cmdNext = tm.work - 3 - Math.floor(Math.random() * 2);
    }
    if (tm.left <= tm.cmdNext && tm.left > 2 && !(tm.left >= 9 && tm.left <= 11)) {
      const c = cmdPick(set, sess, tm.cmdTxt || tm.cmdLast);
      tm.cmdTxt = tm.cmdLast = c.show;
      cmdSay(c);
      tm.cmdNext = tm.left - cmdGap(sess);
    }
  }
