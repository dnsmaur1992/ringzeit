// Kickboxing comparison baseline: fixed profiles, dates, history and a seeded Math.random run through the REAL
// production functions (buildSession, weekPlan, computeLoad, doseTxt, exerciseTiming). Step 2 (pure extraction)
// must reproduce this file exactly; intended differences from 2-B/3-U onward are documented, then re-recorded.
//
//   node tests/baseline.mjs           compare with tests/baseline/kickboxing.json (exit 1 on difference)
//   node tests/baseline.mjs --write   record a new baseline
//
// The app is loaded like in training.test.mjs: the inline script without its boot call, browser services stubbed.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import vm from "node:vm";
import { appHtml } from "./app-source.mjs";

const OUT = new URL("./baseline/kickboxing.json", import.meta.url);
const html = appHtml();
const script = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
const unbooted = script.slice(0, script.indexOf("  (function boot() {"));

const TODAY = [2026, 10, 2]; // Monday 2 Nov 2026
const NOW = new Date(...TODAY, 9, 0).getTime();

function load() {
  let seed = 1,
    nowMs = NOW,
    jobId = 0;
  const jobs = new Map(),
    listeners = new Map(),
    calls = [];
  const rand = () => {
    // mulberry32
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const M = Object.create(Math);
  M.random = rand;
  const node = () => ({
    value: "",
    textContent: "",
    innerHTML: "",
    hidden: true,
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    style: { setProperty() {} },
    addEventListener() {},
    setAttribute() {},
    querySelector: () => null,
    querySelectorAll: () => [],
  });
  const store = new Map();
  const ctx = vm.createContext({
    console,
    Date: class extends Date {
      constructor(...a) {
        super(...(a.length ? a : [nowMs]));
      }
      static now() {
        return nowMs;
      }
    },
    Intl,
    Map,
    Set,
    JSON,
    Math: M,
    Object,
    Array,
    Number,
    String,
    Promise,
    setInterval() {},
    clearInterval() {},
    setTimeout(fn, delay = 0) {
      jobs.set(++jobId, { fn, at: nowMs + delay });
      return jobId;
    },
    clearTimeout(id) {
      jobs.delete(id);
    },
    navigator: {},
    window: { addEventListener() {}, scrollTo() {} },
    document: {
      visibilityState: "visible",
      querySelector: () => null,
      getElementById: node,
      querySelectorAll: () => [],
      documentElement: {},
      addEventListener(name, fn) {
        listeners.set(name, [...(listeners.get(name) || []), fn]);
      },
      removeEventListener() {},
    },
    localStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) },
    matchMedia: () => ({ matches: true }),
  });
  new vm.Script(unbooted).runInContext(ctx, { timeout: 5000 });
  const run = (code) => vm.runInContext(code, ctx, { timeout: 10000 });
  // sound, screen and drawing are outside this comparison: record them instead (as in training.test.mjs)
  ctx.record = (...a) => calls.push(a.join(":"));
  run(`bell = n => record('bell', n); beep = () => record('beep'); getWake = () => record('wake'); releaseWake = () => record('release'); render = () => {}; showWin = () => {};`);
  return {
    run,
    calls,
    reseed: (n) => (seed = n),
    // a tap on a button with these data attributes, through the app's real delegated click handler
    async click(dataset, id) {
      const target = {
        id,
        dataset,
        closest(sel) {
          return sel === "button" || (sel === "[data-check]" && dataset.check) ? this : null;
        },
      };
      for (const fn of listeners.get("click") || []) await fn({ target });
    },
    // let virtual time pass; due timers fire in order
    advance(ms) {
      const until = nowMs + ms;
      for (let n = 0; ; n++) {
        const next = [...jobs.entries()].filter(([, j]) => j.at <= until).sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!next) break;
        if (n > 20000) throw new Error("timer loop");
        nowMs = next[1].at;
        jobs.delete(next[0]);
        next[1].fn();
      }
      nowMs = until;
    },
  };
}

// ---- comparison profiles (synthetic; covers disciplines, levels, age groups, limits, club days, tournament phase)
const P = (o) => ({ example: false, planStart: "2026-09-28", days: [0, 2, 4], minutes: 75, lang: "de", ...o });
const PROFILES = {
  "lc-l0-adult": P({ disc: "lc", level: 0, birthYear: 1995 }),
  "lc-l1-adult-club": P({ disc: "lc", level: 1, birthYear: 1995, club: { days: [1, 3], minutes: 90 } }),
  "kl-l1-youth": P({ disc: "kl", level: 1, birthYear: 2010 }),
  "fc-l2-adult-comp": P({ disc: "fc", level: 2, birthYear: 1998, comps: [{ id: "c1", date: "2026-11-28" }] }),
  "k1-l2-adult-knee": P({ disc: "k1", level: 2, birthYear: 1992, limits: ["knee"] }),
  "lc-l1-kids": P({ disc: "lc", level: 1, birthYear: 2016, minutes: 45 }),
  "kl-l1-masters-en": P({ disc: "kl", level: 1, birthYear: 1978, lang: "en", days: [1, 3, 5, 6] }),
  "lc-l1-focus-mob": P({ disc: "lc", level: 1, birthYear: 1995, block: { k: "mob", start: "2026-10-19" } }),
  "kl-l1-shoulder-back": P({ disc: "kl", level: 1, birthYear: 1990, limits: ["shoulder", "back"] }),
  "lc-l1-lowtime": P({ disc: "lc", level: 1, birthYear: 1995, lowTime: { on: true } }),
  "kl-l2-5days": P({ disc: "kl", level: 2, birthYear: 1996, days: [0, 1, 2, 4, 5] }),
  "lc-l1-grading": P({ disc: "lc", level: 1, birthYear: 1994, belt: 2, comps: [{ id: "g1", kind: "grade", date: "2026-11-20" }] }),
};
// own + club history in the two weeks before TODAY (exercises load model inputs)
const HISTORY = [
  { date: "2026-10-20", src: "own", type: "T", minutes: 75, rpe: 7, tHi: 7, inputConfirmed: true, completed: true },
  { date: "2026-10-21", src: "club", type: "club", minutes: 90, rpe: 8, inputConfirmed: true },
  { date: "2026-10-27", src: "own", type: "K", minutes: 60, rpe: 9, tHi: 7, inputConfirmed: true, completed: true },
  { date: "2026-10-28", src: "club", type: "club", minutes: 90, rpe: 9, inputConfirmed: true },
  { date: "2026-10-30", src: "own", type: "S", minutes: 70, rpe: 9, tHi: 7, inputConfirmed: true, completed: false },
];
// session cases: type, location, equipment, options
const CASES = [
  ["T", "gym", ["partner", "bag", "pads", "rope"]],
  ["T", "home", ["bag", "rope", "bands"]],
  ["P", "gym", ["partner", "bag"]],
  ["C", "gym", ["partner", "bag", "pads", "rope"]],
  ["K", "gym", ["rope", "kb"]],
  ["K", "out", [], { run: true }],
  ["S", "gym", ["weights", "kb", "bar", "bands"]],
  ["S", "studio", []],
  ["M", "home", ["bands"]],
];
const DATE = "2026-11-04";
const DATE0 = "2026-11-02"; // today: flows run on the day itself

function snapshot() {
  const a = load();
  const out = { meta: { today: "2026-11-02", date: DATE, cases: CASES.length, profiles: Object.keys(PROFILES) }, profiles: {} };
  for (const [name, prof] of Object.entries(PROFILES)) {
    for (const withHistory of [false, true]) {
      const key = name + (withHistory ? "+history" : "");
      a.run(`S = hydrate({profile:{...DEFAULT_PROFILE, ...${JSON.stringify(prof)}}, log:${JSON.stringify(withHistory ? HISTORY : [])}}); loadCache = {};`);
      const r = { age: a.run("ageGroup()"), days: {}, plan: {}, load: {}, phase: {}, sessions: {} };
      // planned type per day (own sessions) and club days for two weeks
      for (let i = 0; i < 14; i++) {
        const ds = a.run(`iso(addDays(parse("2026-11-02"), ${i}))`);
        r.days[ds] = a.run(`[planOn(${JSON.stringify(ds)}) || "", !!clubOn(${JSON.stringify(ds)})]`);
      }
      for (const mon of ["2026-11-02", "2026-11-09", "2026-11-23"]) {
        r.plan[mon] = a.run(`weekPlan(parse(${JSON.stringify(mon)}))`);
        r.load[mon] = a.run(`(loadCache = {}, weekLoad(${JSON.stringify(mon)}))`);
        r.phase[mon] = a.run(`phaseInfo(${JSON.stringify(mon)})`);
      }
      CASES.forEach(([ty, loc, eq, opts = {}], i) => {
        a.reseed(1000 + i);
        const sess = a.run(`(() => {
          const s = buildSession(${JSON.stringify(DATE)}, ${JSON.stringify(ty)}, ${JSON.stringify(loc)}, ${JSON.stringify(eq)}, ${JSON.stringify(opts)});
          S.sessions[${JSON.stringify(DATE)}] = s;
          const items = s.blocks.map((b, bi) => b.items.map((it, ni) => {
            const tm = exerciseTiming(s, bi, ni);
            return {
              dose: it.kind === "ex" || (it.id != null && EX[it.id]) ? doseTxt(it.id, b) : null,
              timer: tm && { phases: tm.phases?.length || 0, seconds: (tm.phases || []).reduce((x, p) => x + p.seconds, 0), choices: tm.choices, perSet: tm.seconds },
            };
          }));
          const copy = JSON.parse(JSON.stringify(s));
          delete copy.created;
          // 3-U: every built session now carries its sport and a random id (documented, intentional); the sport must be the default
          if (copy.sport !== "kickboxing" || !copy.id) throw new Error("session without sport/id");
          delete copy.sport;
          delete copy.id;
          // 3-D: exercises carry text ids now; the baseline keeps the old row number (legacyIndex) so it stays comparable
          for (const b of copy.blocks) for (const it of b.items) if (typeof it.id === "string" && EX[it.id]) it.id = EX.indexOf(EX[it.id]);
          return { session: copy, items };
        })()`);
        r.sessions[`${ty}-${loc}${opts.run ? "-run" : ""}`] = sess;
      });
      out.profiles[key] = JSON.parse(JSON.stringify(r));
    }
  }
  return out;
}

// ---- misuse flows: navigating around the app during a running workout, then continuing.
// Each checkpoint records what the user would see/continue with; step 2 must keep every checkpoint identical.
async function flows() {
  const out = {};
  const view = (a, label) =>
    a.run(`(() => {
      const s = S.sessions[${JSON.stringify(DATE0)}], et = ui.exerciseTimer, tm = ui.timer;
      return { at: ${JSON.stringify(label)}, tab: ui.tab, sel: ui.sel, workout: ui.workout && { ...ui.workout }, flow: s.flow && { block: s.flow.block, step: s.flow.step },
        step: ui.workout ? playerStep()?.kind : null,
        roundTimer: tm && { phase: tm.phase, round: tm.round, running: !!tm.running, left: Math.round(tm.left ?? -1) },
        exerciseTimer: et && { key: et.key, running: !!et.running, index: et.index, remaining: Math.round((et.remainingMs ?? 0) / 100) / 10, restOnly: !!et.restOnly },
        freeTimer: ui.ft ? { phase: ui.ft.phase, paused: !!ui.ft.paused, round: ui.ft.round } : null,
        done: sessionCompletion(s).done, open: sessionCompletion(s).open, perf: JSON.stringify(s.perf || {}), checks: JSON.stringify(s.checks || s.done || {}),
        logged: S.log.length };
    })()`);
  const setup = (a, type, eq) => {
    a.reseed(4242);
    a.run(`S = hydrate({profile:{...DEFAULT_PROFILE, ...${JSON.stringify(PROFILES["lc-l1-adult-club"])}}}); ui.onb = null; ui.sel = ${JSON.stringify(DATE0)}; ui.tab = "session";
      S.ov[ui.sel] = { t: ${JSON.stringify(type)} }; S.sessions[ui.sel] = buildSession(ui.sel, ${JSON.stringify(type)}, "gym", ${JSON.stringify(eq)}, { min: 45 });`);
  };

  // A: technique session – warm-up timer running, user wanders through tabs, free timer and the guide, comes back
  {
    const a = load(),
      v = [];
    setup(a, "T", ["bag", "rope"]);
    await a.click({ workout: "start" });
    v.push(view(a, "started"));
    await a.click({ player: "toggle" });
    a.advance(40000);
    v.push(view(a, "warm-up timer 40 s"));
    await a.click({ workout: "close" });
    v.push(view(a, "closed with X"));
    await a.click({ tab: "week" });
    await a.click({ tab: "profile" });
    a.advance(30000);
    v.push(view(a, "30 s in profile"));
    await a.click({ ftx: "open" });
    await a.click({ ftx: "start" });
    a.advance(15000);
    v.push(view(a, "free timer 15 s"));
    await a.click({ ftx: "close" });
    await a.click({ open: DATE0 });
    v.push(view(a, "session reopened"));
    await a.click({ workout: "start" });
    v.push(view(a, "workout resumed"));
    await a.click({ player: "toggle" });
    a.advance(5 * 60000);
    v.push(view(a, "continued 5 min"));
    // jump forward to the rounds, start them, leave in the middle of a round and come back
    for (let i = 0; i < 8 && a.run("ui.workout && playerStep()?.kind") !== "rounds"; i++) await a.click({ player: "next" });
    v.push(view(a, "at rounds"));
    await a.click({}, "tgo");
    a.advance(70000);
    v.push(view(a, "round running 70 s"));
    await a.click({ player: "list" });
    a.advance(20000);
    v.push(view(a, "overview open 20 s"));
    await a.click({ player: "flow" });
    v.push(view(a, "back to flow"));
    await a.click({ workout: "close" });
    await a.click({ tab: "history" });
    a.advance(45000);
    await a.click({ open: DATE0 });
    await a.click({ workout: "start" });
    v.push(view(a, "round after 45 s away"));
    await a.click({}, "tgo");
    a.advance(60000);
    v.push(view(a, "round continued 60 s"));
    out["technique-wander"] = { views: v, signals: a.calls.slice() };
  }

  // B: strength session – set rest running, user opens the list, closes, changes tab and returns
  {
    const a = load(),
      v = [];
    setup(a, "S", ["weights"]);
    await a.click({ workout: "start" });
    const i = a.run(`playerSteps(S.sessions[ui.sel]).findIndex(s => s.kind === "sets" && s.lap == null)`);
    a.run(`playerGo(${i})`);
    v.push(view(a, "at first set step"));
    a.run(`(() => { const c = playerStep(); exerciseTimerAction("rest", { key: c.bi + "." + c.ni }); })()`);
    a.advance(20000);
    v.push(view(a, "set rest 20 s"));
    await a.click({ workout: "close" });
    await a.click({ tab: "week" });
    a.advance(25000);
    v.push(view(a, "25 s on Today"));
    await a.click({ open: DATE0 });
    await a.click({ workout: "start" });
    v.push(view(a, "workout resumed"));
    await a.click({ player: "prev" });
    await a.click({ player: "next" });
    await a.click({ player: "next" });
    v.push(view(a, "stepped back and forth"));
    a.advance(90000);
    v.push(view(a, "90 s later"));
    out["strength-wander"] = { views: v, signals: a.calls.slice() };
  }
  return out;
}

const now = snapshot();
now.flows = await flows();
const text = JSON.stringify(now, null, 1) + "\n";
if (process.argv.includes("--write")) {
  mkdirSync(new URL("./baseline/", import.meta.url), { recursive: true });
  writeFileSync(OUT, text);
  console.log(`baseline written: ${Object.keys(now.profiles).length} profile runs × ${CASES.length} sessions, ${Object.keys(now.flows).length} flows`);
} else {
  const old = readFileSync(OUT, "utf8");
  if (old === text) {
    console.log(`baseline identical: ${Object.keys(now.profiles).length} profile runs × ${CASES.length} sessions, ${Object.keys(now.flows).length} flows`);
  } else {
    const A = JSON.parse(old),
      B = now,
      diffs = [];
    const walk = (x, y, path) => {
      if (diffs.length > 40) return;
      if (JSON.stringify(x) === JSON.stringify(y)) return;
      if (x && y && typeof x === "object" && typeof y === "object")
        for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) walk(x[k], y[k], `${path}.${k}`);
      else diffs.push(`${path}: ${JSON.stringify(x)?.slice(0, 120)} -> ${JSON.stringify(y)?.slice(0, 120)}`);
    };
    walk(A, B, "$");
    console.log("BASELINE DIFFERS:\n" + diffs.join("\n"));
    process.exit(1);
  }
}
