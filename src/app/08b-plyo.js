  /* ============ Federn & Antritt (Betreiber 17.11.2026) ============
     Stance, footwork, movement patterns and the spring of feet and ankles: catalogue drills of the category "plyo".
     sp   where a drill belongs: "box", the kickboxing disciplines lc/kl/fc/k1 and the taekwondo styles wt/itf
     use  "pow" = counted or short timed jumps (strength unit, closing block of the focus, technique & conditioning),
          "cmd" = footwork drills that also fill a conditioning round
     load weighted ground contacts of the whole prescription (easy bounces count less, one-legged landings full);
          a unit never asks for more than PLYO_CAP of the technique level (60 / 100 / 140)
     cmd  the command list: called in the work phases of the exercise or round timer, shown and said from the same list */
  const PLYO_ALL = "box lc kl fc k1 wt itf",
    PLYO_KB = "lc kl fc k1",
    PLYO_TKD = "wt itf";
  const PLYO = {
    "plyo.pogo_jumps": { sp: PLYO_ALL, use: "pow", load: 30 },
    "plyo.stance_bounce": { sp: PLYO_ALL, use: "cmd", load: 20, cmd: "bounce" },
    "plyo.line_jumps": { sp: PLYO_ALL, use: "pow", load: 40 },
    "plyo.boxer_skip": { sp: "box " + PLYO_KB, use: "cmd", load: 20 },
    "plyo.four_square": { sp: PLYO_ALL, use: "pow", load: 35 },
    "plyo.quarter_turn": { sp: "box " + PLYO_KB, use: "pow", load: 30 },
    "plyo.switch_jumps": { sp: PLYO_KB + " " + PLYO_TKD, use: "cmd", load: 30, cmd: "switch" },
    "plyo.shuffle": { sp: "box " + PLYO_KB, use: "cmd", load: 30, cmd: "shuffle" },
    "plyo.burst": { sp: PLYO_ALL, use: "cmd", load: 30, cmd: "burst" },
    "plyo.hop_stick": { sp: PLYO_ALL, use: "pow", load: 30 },
    "plyo.hop_check": { sp: "kl k1", use: "pow", load: 36 },
    "plyo.hop_chamber": { sp: PLYO_KB + " " + PLYO_TKD, use: "pow", load: 30 },
    "plyo.single_pogo": { sp: PLYO_ALL, use: "pow", load: 60 },
    "plyo.single_line_jumps": { sp: PLYO_ALL, use: "pow", load: 50 },
    "plyo.hop_kick": { sp: PLYO_KB + " " + PLYO_TKD, use: "pow", load: 24 },
    "plyo.takeoff": { sp: PLYO_TKD, use: "pow", load: 24 },
    "plyo.react": { sp: PLYO_ALL, use: "cmd", load: 30, cmd: "dirs" },
    "plyo.bounce_slip": { sp: "box " + PLYO_KB, use: "cmd", load: 20, cmd: "slip" },
    // rolling under a hook: boxing only – in kickboxing knees (K1) and head kicks make the deep duck a different move (E6, 17.11.2026)
    "plyo.bounce_roll": { sp: "box", use: "cmd", load: 20, cmd: "roll" },
  };
  const PLYO_CAP = [60, 100, 140];
  const plyoTag = () => (isBox() ? "box" : isTkd() ? tkdUnitStyle() : discOf() || "lc");
  const plyoFits = (key) => !PLYO[key] || PLYO[key].sp.split(" ").includes(plyoTag());
  const plyoCap = () => PLYO_CAP[techniqueLevel()] ?? PLYO_CAP[0];
  /* points of a round spent bouncing (a "Federn & Antritt" round, or a footwork drill filling a conditioning round):
     by its length, like the stance bounce – 90 s of bouncing = 20 points, a 3-minute round = 40 */
  const bounceRoundPts = (w) => Math.round(((w || 180) / 90) * 20);
  /* weighted contacts of a unit over ALL blocks and rounds (17.11.2026: the bounce rounds count too) */
  function plyoLoad(sess) {
    let n = 0;
    for (const b of (sess && sess.blocks) || [])
      for (const it of b.items || []) {
        const e = it.id && EX[it.id] && PLYO[EX[it.id].key];
        if (b.rounds && (it.k === "bounce" || e)) n += bounceRoundPts(b.w);
        else if (e) n += e.load;
      }
    return n;
  }
  /* a "Federn & Antritt" unit: only as many bounce rounds as the cap allows – the rest stay footwork rounds without the
     bouncing; the closing block then gets what is left of the cap */
  function plyoLimitRounds(items, w) {
    const allowed = Math.floor(plyoCap() / bounceRoundPts(w));
    let k = 0;
    for (const r of items) if (r.k === "bounce" && ++k > allowed) r.k = "foot";
    return items;
  }
  /* up to n drills of one use (or any), place, equipment, limits, level and sport checked by okEx, within the cap */
  function plyoPick(n, loc, eq, used, use, base = 0) {
    const cap = plyoCap(),
      pool = shuffle(EX.filter((e) => e.cat === "plyo" && (!use || PLYO[e.key].use === use) && okEx(e, loc, eq) && !used.has(e.id))),
      out = [];
    let sum = base;
    for (const e of pool) {
      if (out.length >= n) break;
      if (sum + PLYO[e.key].load > cap) continue;
      out.push(e);
      sum += PLYO[e.key].load;
    }
    out.forEach((e) => used.add(e.id));
    return out.map((e) => ({ kind: "ex", id: e.id }));
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
  const cmdGap = (sess) =>
    inUnit(sess, () => {
      const g = CMD_GAP[techniqueLevel()] || CMD_GAP[0];
      return g[0] + Math.floor(Math.random() * (g[1] - g[0] + 1));
    });
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
      tm.cmdAt = el + cmdGap(sess) * 1000;
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
