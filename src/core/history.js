/* Shared training history: load of an entry and of a week, deload triggers, the week projection, the five-region
   overlap model and the level from the fitness test. Every function gets its inputs explicitly ({ log, tests, … });
   nothing here reads app state, the DOM or storage. All sports read the same functions (docs/data-load-concept.md §4). */
import { iso, parse, addDays } from "./dates.js";

export const DEFAULT_SPORT_ID = "kickboxing";
export const entrySport = (e) => (e && e.sport) || DEFAULT_SPORT_ID;

/* ---------- load of an entry and of a week (session RPE: minutes × effort, source T1 in rules-sources.md) ---------- */
export const entryComplete = (e) => !!e && e.minutes > 0 && e.rpe > 0;
export const entryLoad = (e) => (entryComplete(e) ? e.minutes * e.rpe : 0);

const inWeek = (log, monISO) => {
  const end = iso(addDays(parse(monISO), 6));
  return log.filter((e) => e.date >= monISO && e.date <= end);
};
/** Sum of all entries Mon–Sun (own + club, every sport). Entries without minutes/effort count 0. */
export const weekLoadSum = (log, monISO) => inWeek(log, monISO).reduce((a, e) => a + entryLoad(e), 0);
/** Number of entries of a week that cannot be counted (old data without minutes or effort). */
export const weekIncomplete = (log, monISO) => inWeek(log, monISO).filter((e) => !entryComplete(e)).length;

const weekAt = (mon, off) => iso(addDays(mon, off));

/* ---------- deload triggers ----------
   in = { log, mon: Date (Monday), phase: "base"|…, ramp: boolean, planStart: ISO|"", projected?: number }
   Existing rules unchanged: planned 5th week · clearly-too-hard sessions · acute:chronic jump of more than 30 %
   (a simple, explainable trigger for "a bit lighter", not an injury forecast – source T2).
   projected = expected total of the CURRENT week (done + planned); compared with the 3 weeks before it. */
export function deloadFor({ log, mon, phase, ramp, planStart, projected }) {
  if (phase === "taper" || phase === "recover") return { deload: false };
  if (ramp) return { deload: false };
  if (planStart) {
    const start = parse(planStart);
    const w = Math.round((mon - start) / (7 * 864e5));
    if (w > 0 && (w + 1) % 5 === 0) return { deload: true, why: "plan" };
  }
  const prev = inWeek(log, weekAt(mon, -7)).filter((e) => e.tHi);
  const over = prev.filter((e) => e.rpe >= e.tHi + 2).length;
  const avgOver = prev.length ? prev.reduce((a, e) => a + (e.rpe - e.tHi), 0) / prev.length : 0;
  if (prev.length >= 2 && (over >= 2 || avgOver > 1)) return { deload: true, why: "rpe" };
  const last = weekLoadSum(log, weekAt(mon, -7)),
    base = [14, 21, 28].map((d) => weekLoadSum(log, weekAt(mon, -d))),
    avg = base.reduce((a, b) => a + b, 0) / 3;
  if (base.filter((x) => x > 0).length >= 2 && last > 600 && last > avg * 1.3) return { deload: true, why: "acwr" };
  if (projected != null) {
    const c = [7, 14, 21].map((d) => weekLoadSum(log, weekAt(mon, -d))),
      cavg = c.reduce((a, b) => a + b, 0) / 3;
    if (c.filter((x) => x > 0).length >= 2 && projected > 600 && projected > cavg * 1.3) return { deload: true, why: "proj" };
  }
  return { deload: false };
}

/** Expected total of the current week: entries up to and including `today` + planned days still to come.
    plannedDays = [{ minutes, rpe }] for days that are planned but have no entry (planned values are never entries). */
export function projectWeek({ log, monISO, plannedDays }) {
  return weekLoadSum(log, monISO) + (plannedDays || []).reduce((a, d) => a + (d.minutes > 0 && d.rpe > 0 ? d.minutes * d.rpe : 0), 0);
}

/* ---------- five regions ---------- */
export const REGIONS = ["legs", "arms", "core", "endu", "mob"];
const norm = (r) => {
  const sum = REGIONS.reduce((a, k) => a + (r[k] || 0), 0) || 1,
    o = {};
  for (const k of REGIONS) if (r[k]) o[k] = Math.round((r[k] / sum) * 100) / 100;
  return o;
};
/* club training without content, by kind (T technique, P sparring, K conditioning, S strength, X mixed) */
const CLUB = {
  T: { legs: 0.4, arms: 0.4, core: 0.2 },
  P: { legs: 0.35, arms: 0.35, core: 0.1, endu: 0.2 },
  K: { legs: 0.2, arms: 0.1, core: 0.1, endu: 0.6 },
  S: { legs: 0.35, arms: 0.35, core: 0.3 },
  X: { legs: 0.3, arms: 0.3, core: 0.1, endu: 0.3 },
};
/* own session by type, used when an entry carries no exercise-based shares (C = fight conditioning) */
const OWN = { ...CLUB, C: { legs: 0.25, arms: 0.3, core: 0.1, endu: 0.35 }, M: { mob: 1 } };
export const FREE_RUN = { legs: 0.3, endu: 0.7 };

function boxingAdjust(r) {
  const o = { ...r };
  const move = Math.max(0, (o.legs || 0) - 0.15);
  if (move) {
    o.legs = 0.15;
    o.arms = (o.arms || 0) + move;
  }
  return o;
}
/* Taekwondo by style (docs/taekwondo-concept.md 6.1, own simple setting like 3-Q): WT kicks almost only, ITF with hands. */
const TKD = { wt: { legs: 0.5, arms: 0.15, core: 0.15, endu: 0.2 }, itf: { legs: 0.4, arms: 0.25, core: 0.15, endu: 0.2 } };
/** Shares of a taekwondo technique, sparring or fight-conditioning unit (club or own) for the style (default WT). */
export const tkdRegions = (style) => norm(TKD[style === "itf" ? "itf" : "wt"]);
export function clubRegions(ck, sport, style) {
  // taekwondo: technique, sparring and mixed club sessions follow the style table; strength and conditioning stay general
  if (sport === "taekwondo" && ["T", "P", "X"].includes(ck || "X")) return tkdRegions(style);
  const r = CLUB[ck] || CLUB.X;
  return norm(sport === "boxing" ? boxingAdjust(r) : r);
}
/** Shares of one catalogue exercise from existing data: avoid codes k/a → legs, s/w → arms, b → core; category cond → endu, mob/cool → mob. */
export function exRegions(ex) {
  const r = {};
  const av = String(ex.avoid || "");
  if (ex.cat === "warm") return r;
  if (ex.cat === "cond") r.endu = 1;
  else if (ex.cat === "mob" || ex.cat === "cool") r.mob = 1;
  else {
    const parts = [];
    if (/[ka]/.test(av)) parts.push("legs");
    if (/[sw]/.test(av)) parts.push("arms");
    if (/b/.test(av)) parts.push("core");
    for (const p of parts) r[p] = 1 / parts.length;
  }
  return r;
}
/** Mean of several exercises' shares; empty → null (caller falls back to the type table). */
export function meanRegions(list) {
  const parts = list.filter((r) => r && Object.keys(r).length);
  if (!parts.length) return null;
  const sum = {};
  for (const r of parts) for (const k of REGIONS) sum[k] = (sum[k] || 0) + (r[k] || 0);
  return norm(sum);
}
/** Shares of a log entry: stored shares, else free run, club kind or own type. */
export function entryRegions(e) {
  if (e.reg && Object.keys(e.reg).length) return e.reg;
  if (e.run === "free") return norm(FREE_RUN);
  if (e.src === "club") return clubRegions(e.ck, entrySport(e), e.tstyle);
  if (entrySport(e) === "taekwondo" && ["T", "P", "C"].includes(e.type)) return tkdRegions(e.tstyle);
  return norm(OWN[e.type] || OWN.T);
}
/** Regions in which yesterday's entries were hard (RPE ≥ 7, share ≥ 0.35) – today's session is built lighter there. */
export function lightRegions({ log, date }) {
  const prev = iso(addDays(parse(date), -1)),
    out = new Set();
  for (const e of log) {
    if (e.date !== prev || !(e.rpe >= 7)) continue;
    const r = entryRegions(e);
    for (const k of REGIONS) if (k !== "mob" && (r[k] || 0) >= 0.35) out.add(k);
  }
  return REGIONS.filter((k) => out.has(k));
}

/* ---------- level from the fitness test, per sport ---------- */
export const techKey = (sport, style) => (style ? `${sport || DEFAULT_SPORT_ID}:${style}` : sport || DEFAULT_SPORT_ID);
const SHARED = ["str", "spd", "end", "flx"];
const sharedDone = (t) => !!t.scores && SHARED.every((k) => t.scores[k] != null);
/* technique value of a test for one sport: techBy when the test names its sport; tests from before (no techBy) are kickboxing */
const techOf = (t, key) => (t.techBy ? (t.techBy[key] != null ? t.techBy[key] : null) : key === DEFAULT_SPORT_ID && t.scores && t.scores.tec != null ? t.scores.tec : null);
/** Level 0–2 for one sport: the shared values (strength, speed, endurance, flexibility) of the latest test that has
    them all, plus the technique self-rating of THIS sport from the latest test that rated it.
    Thresholds as before: total ≥ 20 and minimum ≥ 3 → 2; ≥ 15 and ≥ 2 → 1.
    Also reports what is missing, so a new sport inside the 42 days only needs its technique part. */
export function levelFor(tests, sport, style) {
  const key = techKey(sport, style),
    list = (tests || []).slice().sort((a, b) => a.date.localeCompare(b.date)),
    shared = list.filter(sharedDone).pop(),
    tecT = list.filter((t) => techOf(t, key) != null).pop();
  if (!shared || !tecT) return { level: 0, needShared: !shared, needTech: !tecT, shared: shared || null };
  const vals = [...SHARED.map((k) => shared.scores[k]), techOf(tecT, key)],
    total = vals.reduce((a, v) => a + v, 0),
    min = Math.min(...vals);
  const level = total >= 20 && min >= 3 ? 2 : total >= 15 && min >= 2 ? 1 : 0;
  return { level, needShared: false, needTech: false, shared, total, min };
}
