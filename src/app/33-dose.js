  /* ============ Dose: every exercise says how much – reps, seconds, distance or minutes ============ */
  /* name of a block: its own label where the sport sets one (7b: active flexibility, footwork & shadow, hand-foot links, toughness) */
  const blkName = (b) => (b && b.lbl && t("blkLbl")[b.lbl]) || t(b.key);
  /* per-exercise doses by exercise id: [de, en] */
  /* texts without a timer number; everything with timer numbers comes from its prescription (RX) */
  const DOSE_TXT = {
    // warm-up (shown after the minutes)
    "warm.joint_mobility": ["je Gelenk 10 Kreise", "10 circles per joint"],
    "warm.dynamic_stretching": ["je Bewegung 10 Wdh.", "10 reps per movement"],
    "warm.band_activation": ["je Übung 15 Wdh.", "15 reps per exercise"],
    // cool-down
    // mobility
    "mob.quadruped_hip_circles": ["je Seite 6 Kreise", "6 circles per side"],
    "mob.90_90_hip_switches": ["10 Wechsel", "10 switches"],
    "mob.cossack_squats": ["je Seite 6", "6 per side"],
    "mob.worlds_greatest_stretch": ["je Seite 5", "5 per side"],
    "mob.open_book_rotation": ["je Seite 8", "8 per side"],
    "mob.knee_to_wall_ankle": ["je Seite 10", "10 per side"],
    "mob.band_dislocates": ["10 Wdh.", "10 reps"],
    "mob.cat_cow": ["10 Wdh.", "10 reps"],
    "mob.slow_motion_kicks": ["je Seite 5", "5 per side"],
    "mob.neck_mobility": ["je Richtung 5", "5 each direction"],
    "mob.controlled_leg_swings": ["je Seite 10", "10 per side"],
    "mob.active_leg_raises": ["je Seite 8", "8 per side"],
    // strength specials
    "str.pull_ups": ["so viele saubere wie möglich", "as many clean reps as possible"],
    "str.negative_pull_ups": ["3–5 Wdh.", "3–5 reps"],
    // conditioning with their own pattern (one block per circuit lap)
    "cond.sprints": ["4 Läufe à 20 m", "4 runs of 20 m"],
    "cond.hill_sprints": ["4 Sprints", "4 sprints"],
    "cond.strides": ["2 × 80 m", "2 × 80 m"],
    "cond.kettlebell_swings": ["15 Wdh.", "15 reps"],
    "cond.skater_jumps": ["pro Bein 10", "10 per leg"],
  };
  const DOSE_FIX = { ...DOSE_TXT };
  for (const [k, rx] of Object.entries(RX)) if (k.includes(".")) DOSE_FIX[k] = [rxText(rx, "de"), rxText(rx, "en")];
  /* minutes one circuit lap of these takes (everything else ≈ 1 min) */
  const DOSE_MIN = {
    "cond.rope_intervals": 2,
    "cond.sprints": 1.5,
    "cond.hill_sprints": 2,
    "cond.shadow_sprints": 1.5,
    "cond.bag_sprints": 2,
    "cond.kick_intervals": 1.5,
    "cond.strides": 1.5,
    "cond.rowing_machine_intervals": 2,
    "cond.treadmill_intervals": 2,
    "cond.bike_sprints": 2,
    "cond.speed_rounds": 2,
    "cond.stepping_and_light_footwork": 3,
  };
  const DOSE_SIDE = new Set([
    "str.lunges",
    "str.bulgarian_split_squats",
    "str.step_ups",
    "str.single_leg_calf_raises",
    "str.cable_woodchop",
    "str.pallof_press",
    "str.copenhagen_plank",
    "str.russian_twists",
    "pow.lateral_bounds",
  ]);
  /* one-legged exercises: the dose is per leg ("pro Bein") instead of "je Seite" */
  const DOSE_LEG = new Set([
    "str.lunges",
    "str.bulgarian_split_squats",
    "str.step_ups",
    "str.single_leg_calf_raises",
    "str.single_leg_kick_hold",
    "cond.skater_jumps",
  ]);
  /* sprint-type items that state their own count: a block with several sets repeats it ("3 × 4 Sprints") */
  const DOSE_REPEAT = new Set(["cond.sprints", "cond.hill_sprints", "cond.strides"]);
  const isExplSets = (sets) => /explosiv/i.test(sets || "");
  const sideWord = (key, de = S.profile.lang === "de") =>
    DOSE_LEG.has(key) ? (de ? " pro Bein" : " per leg") : DOSE_SIDE.has(key) ? (de ? " je Seite" : " per side") : "";
  /* a circuit: "3×" without reps – all exercises one after another, then a lap break */
  const isCirc = (b) => /^\d+\s*×$/.test((b.sets || "").trim());
  const circLap = (b) =>
    b.items.reduce((a, it) => {
      const e = EX[it.id];
      return a + (!e ? 1 : DOSE_MIN[e.key] || (DOSE_SIDE.has(e.key) ? 1.5 : 1));
    }, 0) + 1.5;
  /* laps that fill the block's minutes (2–6) */
  const circN = (b) => Math.max(2, Math.min(6, Math.round(b.min / circLap(b))));
  const blockSets = (b) => (isCirc(b) ? circN(b) : parseInt(b.sets) || 3);
  function doseTxt(id, b) {
    const e = EX[id];
    if (!e) return "";
    const de = S.profile.lang === "de",
      L = doseLevel(b),
      fix = DOSE_FIX[e.key] ? DOSE_FIX[e.key][de ? 0 : 1] : "",
      side = sideWord(e.key, de),
      reps = de ? " Wdh." : " reps",
      circ = isCirc(b),
      m = (b.sets || "").match(/^(\d+)×\s*(\d+(?:[–-]\d+)?)?/),
      n = m ? +m[1] : 3;
    if (e.cat === "pre") return fix;
    if (b.key === "warm") {
      const mins = Math.max(2, Math.round(b.min / Math.max(1, b.items.length)));
      return `${mins} ${de ? "Min." : "min"}${fix ? " · " + fix : ""}`;
    }
    if (b.key === "mob") {
      const rx = RX[e.key];
      // a prescription with a timer states the total from that timer (the timer and the text cannot differ)
      if (rx && rx.fillSec) return fix;
      if (rx && rx.k === "hold") return `${fix} · ${de ? "insgesamt ca." : "about"} ${rxMinutes(rx)} ${de ? "Min." : "min in total"}`;
      const mins = Math.max(2, Math.round(b.min / Math.max(1, b.items.length)));
      return `${fix || (de ? "60–90 s halten" : "hold 60–90 s")} · ${de ? "insgesamt ca." : "about"} ${mins} ${de ? "Min." : "min in total"}`;
    }
    if (b.key === "cool" || e.cat === "cool" || e.cat === "mob")
      return fix || (de ? "45–60 s halten" : "hold 45–60 s");
    if (e.cat === "cond") {
      if (fix) return DOSE_REPEAT.has(e.key) && !circ && n > 1 ? `${n} × ${/×/.test(fix) ? `(${fix})` : fix}` : fix;
      if (e.key === "cond.burpees") return ["6", "10", "15"][L] + reps;
      const W = [30, 40, 45][L],
        R = [30, 20, 15][L];
      if (e.key === "cond.bear_crawl")
        return de
          ? `${W} s (ca. 10 m hin und zurück), ${R} s Pause`
          : `${W} s (about 10 m out and back), ${R} s rest`;
      return de ? `${W} s Belastung, ${R} s Pause` : `${W} s work, ${R} s rest`;
    }
    // strength, core and power
    if (e.cat === "pow") {
      const one = (m && m[2] ? m[2] : "5") + (de ? " Wdh." : " reps") + side;
      if (circ) return one;
      if (/^Kontrast|^Contrast/.test(b.sets || ""))
        return de
          ? `3 × 5 Wdh.${side} direkt nach dem Kraftsatz`
          : `3 × 5 reps${side} right after the strength set`;
      return `${n} × ${one} · ${de ? "1–2 Min. Pause" : "1–2 min rest"}`;
    }
    let one;
    // a timed one-legged hold counts in sets (one set = left, then right), not in the fixed 2 × 10 s pattern
    const setHold = TIMED.has(id) && RX[e.key] && RX[e.key].k === "holds";
    if (fix && !setHold) one = fix;
    else if (TIMED.has(id)) {
      const h = [
        [20, 30],
        [30, 45],
        [45, 60],
      ][L] || [30, 45];
      one = `${h[0]}–${h[1]} s${side} ${de ? "halten" : "hold"}${setHold ? (de ? " · ein Satz = erst links, dann rechts" : " · one set = left first, then right") : ""}`;
    } else {
      const heavyBw = bwHeavy(b, id),
        r = heavyBw ? ["8–10", "10–12", "12–15"][L] : m && m[2] ? m[2] : hasKg(id) ? "8–12" : ["8–10", "10–12", "12–15"][L];
      one = r + reps + side + (heavyBw ? (de ? ", langsam (3 s ab)" : ", slow (3 s down)") : "");
    }
    return circ ? one : `${n} × ${one}`;
  }
  /* Training with a partner: you are two and every device is there once.
     Circuit: both work at the same time, B starts further down the list so nobody needs the same device at once
     (duoOff); the plan shows the two orders side by side, A left and B right.
     Sets with set rest: you take turns – the set rest is the partner's set. Other device work: take turns. */
  const exEqOf = (sess, id) => (EX[id] && EX[id].eq ? EX[id].eq.split("|").filter((q) => (sess.eq || []).includes(q)) : []);
  const isDuo = (sess, b) =>
    !!sess && (sess.eq || []).includes("partner") && isCirc(b) && !b.rounds && !["warm", "cool"].includes(b.key) && b.items.length > 1 && b.items.every((it) => EX[it.id]);
  function duoOff(sess, b) {
    const n = b.items.length,
      eqs = b.items.map((it) => exEqOf(sess, it.id)),
      clash = (o) => eqs.filter((e, i) => e.length && eqs[(i + o) % n].some((q) => e.includes(q))).length,
      cand = [Math.ceil(n / 2), ...Array.from({ length: n - 1 }, (_, i) => i + 1).filter((o) => o !== Math.ceil(n / 2))];
    let best = cand[0];
    for (const o of cand) if (clash(o) < clash(best)) best = o;
    return { off: best, clash: clash(best) };
  }
  const duoTxt = () =>
    S.profile.lang === "de"
      ? {
          circ: (k) => `Zu zweit: gleichzeitig, aber versetzt – A beginnt bei Übung 1, B bei Übung ${k}. So ist jedes Gerät immer nur bei einem von euch.`,
          clash: " Wo trotzdem beide dasselbe Gerät brauchen: abwechselnd.",
          sets: " Zu zweit: abwechselnd – die Satzpause ist der Satz deines Partners.",
          turns: "Zu zweit: Geräte abwechselnd – während einer arbeitet, macht der andere Pause, dann tauschen.",
        }
      : {
          circ: (k) => `As a pair: at the same time, but offset – A starts at exercise 1, B at exercise ${k}. That way each device is only ever with one of you.`,
          clash: " Where you both still need the same device: take turns.",
          sets: " As a pair: take turns – the set rest is your partner's set.",
          turns: "As a pair: take turns on the devices – one works, the other rests, then swap.",
        };
  function duoHtml(sess, bi, cur) {
    const b = sess.blocks[bi],
      n = b.items.length,
      { off } = duoOff(sess, b),
      cell = (who, k, on) => `<div class="dc ${who}${on ? " on" : ""}"><i>${k + 1}</i>${esc(itemTitle(sess, bi, k))}</div>`;
    let h = `<div class="duo"><div class="dh a"><b>A</b></div><div class="dh b"><b>B</b></div>`;
    for (let i = 0; i < n; i++) h += cell("a", i, cur === i) + cell("b", (i + off) % n, cur === i);
    return h + `</div>`;
  }
  function blockHead(b, sess) {
    const de = S.profile.lang === "de";
    let info = b.sets || "";
    if (b.key === "mob") info = de ? "je Übung ca. 3–4 Min., Halteübungen 60–90 s" : "about 3–4 min per exercise, holds 60–90 s";
    else if (isCirc(b)) info = de ? `${circN(b)} Durchgänge` : `${circN(b)} laps`;
    if (b.rounds) {
      const w = b.w || (b.items.some((i) => i.k !== "ex") ? 180 : 120),
        r = b.b || 60;
      info = `${b.items.length} × ${fmt(w)} / ${fmt(r)} ${de ? "Pause" : "rest"}`;
    }
    const straight =
        !b.rounds && !isCirc(b) && (b.key === "str" || b.key === "pow") && /^\d+×/.test(b.sets || ""),
      note =
        isCirc(b) && !b.rounds
          ? de
            ? "Zirkel: alle Übungen nacheinander, dann 1–2 Min. Pause. Das ist ein Durchgang."
            : "Circuit: all exercises one after another, then 1–2 min rest. That is one lap."
          : straight
            ? (de
                ? "Erst alle Sätze einer Übung, dazwischen 60–90 s Pause – dann die nächste Übung."
                : "All sets of one exercise first, 60–90 s rest in between – then the next exercise.") +
              (b.items.some((it) => EX[it.id] && bwHeavy(b, it.id))
                ? de
                  ? " Die schweren Wiederholungszahlen gelten für Übungen mit Gewicht; ohne Gewicht machst du mehr Wiederholungen, dafür langsam."
                  : " The heavy rep numbers are for weighted exercises; without weight you do more reps, but slowly."
                : "")
            : "";
    let duo = "",
      extra = "";
    const pair = !!sess && (sess.eq || []).includes("partner") && !b.rounds && !["warm", "cool", "hard", "wrist"].includes(b.key);
    if (pair && isDuo(sess, b)) {
      const bi = sess.blocks.indexOf(b),
        d = duoOff(sess, b);
      extra = " " + duoTxt().circ(d.off + 1) + (d.clash ? duoTxt().clash : "");
      duo = duoHtml(sess, bi, -1);
    } else if (pair && straight) extra = duoTxt().sets;
    else if (pair && b.items.some((it) => exEqOf(sess, it.id).length)) extra = (note ? " " : "") + duoTxt().turns;
    const nt = note + esc(extra);
    return `<div class="bhead"><b>${blkName(b)}</b><span>${b.min} ${t("min")}${info ? ` · ${esc(info)}` : ""}</span></div>${nt ? `<div class="bnote">${nt}${duo}</div>` : ""}`;
  }

