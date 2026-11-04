/* Prescription: ONE structured source for everything that can be said about the time of an exercise.
   From a prescription (RX[key]) the dose text, the timer phases and the time estimate are all derived, so the number
   the person reads and the number the timer runs can never differ (docs/data-load-concept.md §3).
   Pure data and functions: no app state, no DOM, no translation functions. Phases carry a role and counters; the app
   turns them into labels in the person's language.

   Kinds
     hold    { s, sides, unit?, x?, per? }     one hold (or a range to choose from); sides 2 = left, change, right
     iv      { n, on, off, onW?, offW? }       n work phases, each followed by a rest
     alt     { total, on, off, onW, offW }     alternating fast/easy phases that fill `total` seconds (rope, rower, treadmill)
     holds   { reps, hold, rest, change, unit, fillSec? }  reps holds per side, side 1 then change then side 2;
                                               with fillSec the passes are repeated until about that many seconds are filled
     sets    { n, s, change }                  n sets of s seconds (s may be a range of choices), 5 s change between
     sidedsets { n, s, unit }                  n sets, each side after the other (every set = side 1, side 2)
     dirs    { n, s }                          n directions, s seconds each, 5 s change between
     grip    { n, s, rounds }                  n slow fist closes with an s-second hold, a spread phase between, rounds times */

const CHANGE = 5;
const isRange = (v) => Array.isArray(v);
const lo = (v) => (isRange(v) ? v[0] : v);
const hi = (v) => (isRange(v) ? v[v.length - 1] : v);

export const RX = {
  /* ---- warm-up / cool-down / mobility holds ---- */
  "pre.short_pre_stretch": { k: "hold", s: 120, sides: 1, per: ["je Muskel 15–30 s", "15–30 s per muscle"] },
  "cool.hip_flexor_stretch": { k: "hold", s: 45, sides: 2 },
  "cool.hamstrings": { k: "hold", s: 45, sides: 2 },
  "cool.shoulder_and_chest": { k: "hold", s: 30, sides: 2 },
  "cool.adductors_and_splits": { k: "hold", s: [60, 90], sides: 1 },
  "cool.breathing": { k: "hold", s: 120, sides: 1 },
  "cool.easy_cool_down_jog": { k: "hold", s: 300, sides: 1, x: ["locker", "easy"] },
  "mob.frog_stretch": { k: "hold", s: [60, 90], sides: 1 },
  "mob.pigeon_stretch": { k: "hold", s: [60, 90], sides: 2 },
  "mob.deep_squat_hold": { k: "hold", s: [60, 90], sides: 1 },
  "mob.kick_holds": { k: "holds", reps: 5, hold: [3, 5], rest: 3, change: CHANGE, unit: "side", fillSec: 240 },
  /* ---- conditioning with its own pattern ---- */
  "cond.rope_intervals": { k: "alt", total: 120, on: 30, off: 30, onW: ["zügig", "fast"], offW: ["locker", "easy"] },
  "cond.rowing_machine_intervals": { k: "alt", total: 120, on: 30, off: 30, onW: ["zügig", "fast"], offW: ["locker", "easy"] },
  "cond.treadmill_intervals": { k: "alt", total: 120, on: 30, off: 30, onW: ["zügig", "fast"], offW: ["locker", "easy"] },
  "cond.stepping_and_light_footwork": { k: "hold", s: 180, sides: 1 },
  "cond.shadow_sprints": { k: "iv", n: 3, on: 20, off: 10, onW: ["Vollgas", "all-out"], offW: ["locker", "easy"] },
  "cond.bag_sprints": { k: "iv", n: 4, on: 15, off: 15, offW: ["Pause", "rest"] },
  "cond.kick_intervals": { k: "iv", n: 3, on: 20, off: 10, offW: ["Pause", "rest"] },
  "cond.bike_sprints": { k: "iv", n: 2, on: 20, off: 40, offW: ["locker", "easy"] },
  "cond.speed_rounds": { k: "iv", n: 4, on: 10, off: 20, offW: ["locker", "easy"] },
  /* ---- strength holds ---- */
  "str.single_leg_kick_hold": { k: "holds", reps: 2, hold: 10, rest: 3, change: CHANGE, unit: "leg" },
  "str.neck_iso_hold": { k: "dirs", n: 4, s: 10, names: [["Stirn", "Hinterkopf", "links", "rechts"], ["forehead", "back of head", "left", "right"]] },
  /* ---- hardening (ids without a dot) ---- */
  fGlove: { k: "sets", n: 3, s: 20 },
  fWraps: { k: "sets", n: 2, s: 30 },
  fBare: { k: "sets", n: 2, s: 20 },
  fPads: { k: "sets", n: 3, s: 20 },
  fPlank: { k: "sets", n: 3, s: [20, 30] },
  fWring: { k: "sets", n: 3, s: 20 },
  abs: { k: "sets", n: 3, s: 20 },
  arms: { k: "sets", n: 2, s: 30 },
  checks: { k: "sets", n: 2, s: 30 },
  fTap: { k: "sidedsets", n: 3, s: 30, unit: "hand" },
  bodybag: { k: "sidedsets", n: 3, s: 20, unit: "side" },
  shintap: { k: "hold", s: 60, sides: 2, unit: "leg", nochoice: true },
  neck: { k: "dirs", n: 4, s: 10, names: [["Stirn", "Hinterkopf", "links", "rechts"], ["forehead", "back of head", "left", "right"]] },
  fFinger: { k: "grip", n: 10, s: 3, rounds: 2 },
  /* taekwondo hardening (6b): hand edge, fingertips, foot (docs/taekwondo-concept.md T10) */
  tkEdge: { k: "sidedsets", n: 3, s: 30, unit: "hand" },
  tkTips: { k: "sets", n: 3, s: 10 },
  tkFoot: { k: "hold", s: 60, sides: 2, unit: "leg", nochoice: true },
  tkBall: { k: "sidedsets", n: 3, s: 20, unit: "leg" },
};
/* variants for full-contact adults (the harder dose of a hardening item): only what differs from RX[id] */
export const RX_HARD = {
  fPlank: { s: [30, 45] }, // A1: the text said 30–45 s, the timer offered 20/30
  fTap: { s: 45 }, // A2: 45 s per hand
  fBare: { n: 3 }, // A3: 3 sets
  fWraps: { n: 3 }, // A4: 3 sets
  checks: { n: 3 }, // A13 (found while deriving): the harder text said 3 sets, the timer ran 2
};

export const rxOf = (key, h) => (h && RX_HARD[key] ? { ...RX[key], ...RX_HARD[key] } : RX[key] || null);

/* ---------- text ---------- */
const UNIT = {
  side: ["je Seite", "per side"],
  leg: ["pro Bein", "per leg"],
  hand: ["pro Hand", "per hand"],
};
const dur = (v, de) => (isRange(v) ? `${lo(v)}–${hi(v)} s` : durOne(v, de));
const durOne = (s, de) => (s >= 120 && s % 60 === 0 ? `${s / 60} ${de ? "Min." : "min"}` : `${s} s`);
const mins = (s, de) => `${Math.max(1, Math.round(s / 60))} ${de ? "Min." : "min"}`;

/** The dose text of a prescription in "de" or "en". */
export function rxText(rx, lang) {
  const de = lang === "de",
    u = rx.unit ? UNIT[rx.unit] : null;
  switch (rx.k) {
    case "hold": {
      if (rx.per) return `${rx.per[de ? 0 : 1]} · ${de ? "ca." : "about"} ${mins(rx.s, de)}`;
      if (rx.unit && rx.sides === 2 && !isRange(rx.s) && rx.s % 60 === 0)
        return de ? `je ${rx.unit === "leg" ? "Bein" : "Seite"} ${rx.s / 60 === 1 ? "1 Minute" : rx.s / 60 + " Minuten"}` : `${rx.s / 60 === 1 ? "1 minute" : rx.s / 60 + " minutes"} per ${rx.unit === "leg" ? "leg" : "side"}`;
      if (rx.sides === 2) return de ? `je Seite ${dur(rx.s, de)}` : `${dur(rx.s, de)} per side`;
      if (isRange(rx.s)) return de ? `${dur(rx.s, de)} halten` : `hold ${dur(rx.s, de)}`;
      return durOne(rx.s, de) + (rx.x ? " " + rx.x[de ? 0 : 1] : "");
    }
    case "iv": {
      const w = (sec, word) => `${sec} s${word ? " " + word[de ? 0 : 1] : ""}`;
      return `${rx.n} × (${w(rx.on, rx.onW)} / ${w(rx.off, rx.offW)})`;
    }
    case "alt":
      return de
        ? `${durOne(rx.total, de)} im Wechsel (${rx.on} s ${rx.onW[0]} / ${rx.off} s ${rx.offW[0]})`
        : `${durOne(rx.total, de)} alternating (${rx.on} s ${rx.onW[1]} / ${rx.off} s ${rx.offW[1]})`;
    case "holds": {
      const body = `${rx.reps} × ${dur(rx.hold, de)}`,
        base = de ? `${u[0]} ${body}` : `${body} ${u[1]}`;
      // with a time span to fill the text names the passes and the total, both taken from the timer
      return rx.fillSec ? `${base} · ${de ? "im Wechsel links/rechts, ca." : "alternating left/right, about"} ${rxMinutes(rx)} ${de ? "Min." : "min"}` : base;
    }
    case "sets":
      return `${rx.n}× ${dur(rx.s, de)}`;
    case "sidedsets":
      return de ? `${rx.n}× ${dur(rx.s, de)} ${u[0]}` : `${rx.n}× ${dur(rx.s, de)} ${u[1]}`;
    case "dirs":
      return (de ? `je Richtung ${rx.s} s` : `${rx.s} s each direction`) + (rx.names ? ` (${rx.names[de ? 0 : 1].join(", ")})` : "");
    case "grip":
      return `${rx.n}×`;
  }
  return "";
}
/** Fills {rx} {n} {s} {r} in a text template with the numbers of a prescription. */
export function rxFill(template, rx, lang) {
  return template
    .replace("{rx}", rxText(rx, lang))
    .replace("{n}", rx.n)
    .replace("{s}", isRange(rx.s) ? `${lo(rx.s)}–${hi(rx.s)}` : rx.s)
    .replace("{r}", rx.rounds);
}

/* ---------- phases ---------- */
const ph = (seconds, role, extra) => ({ seconds, role, ...extra });
const change = () => ph(CHANGE, "change");
const ivPhases = (n, on, off, extra) =>
  Array.from({ length: n }, (_, i) => [ph(on, "work", { i: i + 1, n, ...extra }), ...(off ? [ph(off, "rest", extra)] : [])]).flat();

/** The timer of a prescription. opts: { choice, seconds (override of the hold length, e.g. a logged target) , tracked }
    Returns { phases, choices, seconds, sides } with seconds/sides as the app's timer plan reports them. */
export function rxPlan(rx, opts = {}) {
  const { choice } = opts;
  const pick = (v, always) => {
    const ch = isRange(v) ? v : [v];
    return { choices: isRange(v) || always ? ch : [], seconds: ch.includes(choice) ? choice : ch[0] };
  };
  switch (rx.k) {
    case "hold": {
      const { choices, seconds } = pick(opts.seconds != null ? [opts.seconds] : rx.s, !rx.nochoice);
      const sides = rx.sides || 1;
      const phases =
        sides === 2
          ? [ph(seconds, "side", { side: 1, sides: 2 }), change(), ph(seconds, "side", { side: 2, sides: 2 })]
          : [ph(seconds, "run")];
      return { phases, choices, seconds: rx.nochoice ? 0 : seconds, sides };
    }
    case "iv":
      return { phases: ivPhases(rx.n, rx.on, rx.off), choices: [], seconds: 0, sides: 1 };
    case "alt": {
      const cycles = Math.max(1, Math.round(rx.total / (rx.on + rx.off)));
      const phases = Array.from({ length: cycles }, (_, i) => [
        ph(rx.on, "fast", { i: i + 1, n: cycles }),
        ph(rx.off, "easy", { i: i + 1, n: cycles }),
      ]).flat();
      return { phases, choices: [], seconds: 0, sides: 1 };
    }
    case "holds": {
      const { choices, seconds } = pick(rx.hold),
        side = (k, pass) => ivPhases(rx.reps, seconds, rx.rest, { side: k, pass }),
        one = (pass) => [...side(1, pass), ph(rx.change, "change"), ...side(2, pass)],
        passSec = one(1).reduce((a, p) => a + p.seconds, 0),
        passes = rx.fillSec ? Math.max(1, Math.round(rx.fillSec / passSec)) : 1;
      const phases = [];
      for (let k = 1; k <= passes; k++) {
        if (k > 1) phases.push(ph(rx.change, "change"));
        phases.push(...one(k).map((p) => ({ ...p, passes })));
      }
      return { phases, choices, seconds, sides: 2 };
    }
    case "sets": {
      const { choices, seconds } = pick(rx.s, true);
      const phases = Array.from({ length: rx.n }, (_, i) => [
        ph(seconds, "set", { i: i + 1, n: rx.n }),
        ...(i < rx.n - 1 ? [change()] : []),
      ]).flat();
      return { phases, choices, seconds, sides: 1 };
    }
    case "sidedsets": {
      const total = rx.n * 2;
      const phases = Array.from({ length: total }, (_, i) => [
        ph(rx.s, "sideset", { side: (i % 2) + 1, sides: 2, set: Math.floor(i / 2) + 1, sets: rx.n }),
        ...(i < total - 1 ? [change()] : []),
      ]).flat();
      return { phases, choices: [], seconds: 0, sides: 2 };
    }
    case "dirs": {
      const s = opts.seconds || rx.s;
      const phases = Array.from({ length: rx.n }, (_, i) => [
        ph(s, "dir", { i: i + 1, n: rx.n, name: rx.names ? rx.names.map((l) => l[i]) : null }),
        ...(i < rx.n - 1 ? [change()] : []),
      ]).flat();
      return { phases, choices: [], seconds: opts.seconds || 0, sides: 1 };
    }
    case "grip": {
      const total = rx.n * rx.rounds;
      const phases = Array.from({ length: total }, (_, i) => [
        ph(rx.s, "grip", { i: (i % rx.n) + 1, n: rx.n, round: Math.floor(i / rx.n) + 1, rounds: rx.rounds }),
        ...(i < total - 1 ? [ph(rx.s, "spread")] : []),
      ]).flat();
      return { phases, choices: [], seconds: 0, sides: 1 };
    }
  }
  return null;
}

/** Seconds of the whole timer; for a range of choices the shortest and the longest. */
export function rxSeconds(rx) {
  const choices = rx.k === "hold" ? (isRange(rx.s) ? rx.s : [rx.s]) : rx.k === "holds" ? (isRange(rx.hold) ? rx.hold : [rx.hold]) : [undefined];
  const tot = choices.map((c) => rxPlan(rx, { choice: c }).phases.reduce((a, p) => a + p.seconds, 0));
  return [Math.min(...tot), Math.max(...tot)];
}
/** "ca. 2–3 Min." style range of minutes (whole minutes, at least 1). */
export function rxMinutes(rx) {
  const [a, b] = rxSeconds(rx),
    x = Math.max(1, Math.round(a / 60)),
    y = Math.max(x, Math.round(b / 60));
  return x === y ? `${x}` : `${x}–${y}`;
}
