// Tests for the shared core modules (src/core, later src/catalog and src/sports), imported directly as ES modules.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { fmtTime, pad } from "../src/core/format.js";
import { iso, parse, monday, addDays, daysBetween, wd } from "../src/core/dates.js";
import { rnd, shuffle } from "../src/core/random.js";
import { createStore } from "../src/core/storage.js";

test("format: m:ss and two digits", () => {
  assert.equal(pad(7), "07");
  assert.equal(fmtTime(0), "0:00");
  assert.equal(fmtTime(65), "1:05");
  assert.equal(fmtTime(180), "3:00");
});

test("dates: local ISO strings, Monday weeks, day arithmetic across the DST change", () => {
  assert.equal(iso(parse("2026-11-02")), "2026-11-02");
  assert.equal(parse("2026-11-02"), parse("2026-11-02")); // cached object
  assert.equal(iso(monday(parse("2026-11-08"))), "2026-11-02");
  assert.equal(iso(addDays(parse("2026-10-24"), 2)), "2026-10-26"); // 25 Oct is 25 hours long in Berlin
  assert.equal(daysBetween(parse("2026-10-24"), parse("2026-10-26")), 2);
  assert.equal(wd("2026-11-02"), 0);
  assert.equal(wd("2026-11-08"), 6);
});

test("random: helpers follow Math.random, shuffle keeps the input", () => {
  const orig = Math.random;
  try {
    Math.random = () => 0.99;
    assert.equal(rnd(["a", "b", "c"]), "c");
    const a = [1, 2, 3, 4];
    Math.random = () => 0;
    assert.deepEqual(shuffle(a), [2, 3, 4, 1]);
    assert.deepEqual(a, [1, 2, 3, 4]);
  } finally {
    Math.random = orig;
  }
});

function memory(limit = Infinity) {
  const m = new Map();
  return {
    m,
    getItem: (k) => m.get(k) ?? null,
    setItem(k, v) {
      if (v.length > limit) throw new Error("QuotaExceededError");
      m.set(k, v);
    },
  };
}
const hooks = (state, extra = {}) => ({
  key: "test.v1",
  getState: () => state,
  compact: () => (state.big = ""),
  onFull: () => (state.warned = (state.warned || 0) + 1),
  cloud: null,
  applyCloud() {},
  cloudDocs: () => ({ app: {}, log: {} }),
  onCloudLost() {},
  ...extra,
});

test("storage: writes and reads only its own key", () => {
  const mem = memory(),
    state = { a: 1 };
  mem.setItem("ringzeit.v1", "stable data");
  const s = createStore(hooks(state, { storage: () => mem }));
  s.save();
  assert.deepEqual(s.readLocal(), { a: 1 });
  assert.equal(mem.getItem("ringzeit.v1"), "stable data");
  assert.equal(s.mode, "local");
});

test("storage: when full it compacts once and retries; warns only once if that fails too", () => {
  const mem = memory(30),
    state = { a: 1, big: "x".repeat(40) };
  const s = createStore(hooks(state, { storage: () => mem }));
  s.save();
  assert.deepEqual(s.readLocal(), { a: 1, big: "" });
  state.big = "y".repeat(40);
  state.more = "z".repeat(40);
  s.save();
  s.save();
  assert.equal(state.warned, 1);
});

test("storage: unreadable storage or broken JSON reads as no data", () => {
  const broken = createStore(hooks({}, { storage: () => { throw new Error("SecurityError"); } }));
  assert.equal(broken.readLocal(), null);
  broken.save(); // must not throw
  const mem = memory();
  mem.setItem("test.v1", "{not json");
  assert.equal(createStore(hooks({}, { storage: () => mem })).readLocal(), null);
});

test("storage: no cloud host (or switched off) stays local", async () => {
  const s = createStore(hooks({}, { storage: () => memory(), cloud: () => false }));
  await s.init();
  assert.equal(s.mode, "local");
  assert.equal(await s.loadCloud(), false);
});

test("storage: with a cloud host it loads, mirrors on save and falls back to local when revoked", async () => {
  const docs = { "data/users/u1/app": { profile: { x: 1 } } },
    writes = [];
  let refuse = false;
  const host = {
    use: async (n) =>
      n === "user"
        ? { id: async () => "u1" }
        : {
            doc: (path) => ({
              get: async () => ({ exists: path in docs, data: () => docs[path] }),
              set: async (d) => {
                if (refuse) throw { code: "revoked" };
                writes.push([path, d]);
              },
            }),
          },
  };
  const got = [],
    lost = [];
  const s = createStore(
    hooks({}, { storage: () => memory(), cloud: () => host, applyCloud: (a, l) => got.push([a, l]), cloudDocs: () => ({ app: { p: 1 }, log: { l: 2 } }), onCloudLost: () => lost.push(1) }),
  );
  await s.init();
  assert.equal(s.mode, "cloud");
  assert.equal(await s.loadCloud(), true);
  assert.deepEqual(got, [[{ profile: { x: 1 } }, null]]);
  s.flush();
  await Promise.all(Object.values(s.chain));
  assert.deepEqual(writes, [["data/users/u1/app", { p: 1 }], ["data/users/u1/log", { l: 2 }]]);
  refuse = true;
  s.flush();
  await Promise.all(Object.values(s.chain));
  assert.equal(s.mode, "local");
  assert.ok(lost.length >= 1);
});

// shared modules must not reach into the app: no app state, no DOM/browser globals, no imports from src/app
test("boundaries: core, catalog and sports modules use only explicit inputs", () => {
  const root = fileURLToPath(new URL("../src/", import.meta.url));
  const files = [];
  for (const dir of ["core", "catalog", "sports"]) {
    const walk = (d) => {
      try {
        for (const f of readdirSync(d)) {
          const p = join(d, f);
          if (statSync(p).isDirectory()) walk(p);
          else if (p.endsWith(".js")) files.push(p);
        }
      } catch (e) {
        if (e.code !== "ENOENT") throw e;
      }
    };
    walk(join(root, dir));
  }
  assert.ok(files.length >= 5);
  for (const f of files) {
    const code = readFileSync(f, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "")
      .replace(/(["'`])(?:\\.|(?!\1)[^\\])*\1/g, '""');
    for (const bad of [/\bS\./, /\bui\./, /\bdocument\b/, /\bwindow\b/, /\blocalStorage\b/, /\bt\(/, /\brender\(/])
      assert.doesNotMatch(code, bad, `${f} uses ${bad}`);
    assert.doesNotMatch(readFileSync(f, "utf8"), /from\s+["'][^"']*\/app\//, `${f} imports from src/app`);
  }
});

/* ---------- shared history and load (src/core/history.js), acceptance cases of docs/data-load-concept.md §5 ---------- */
import {
  entryLoad, weekLoadSum, weekIncomplete, deloadFor, projectWeek, clubRegions, exRegions, entryRegions, lightRegions, levelFor,
} from "../src/core/history.js";

test("history: load = minutes × effort; aborted unit counts the confirmed minutes (case 2); entries without values count 0", () => {
  assert.equal(entryLoad({ minutes: 30, rpe: 6 }), 180);
  assert.equal(entryLoad({ minutes: 30 }), 0);
  assert.equal(entryLoad({ rpe: 6 }), 0);
  const log = [{ date: "2026-11-02", minutes: 30, rpe: 6 }, { date: "2026-11-03", src: "club", sport: "boxing", minutes: 60, rpe: 5 }, { date: "2026-11-04", minutes: 40 }];
  assert.equal(weekLoadSum(log, "2026-11-02"), 480, "every sport and club count");
  assert.equal(weekIncomplete(log, "2026-11-02"), 1);
  assert.equal(weekLoadSum(log, "2026-11-09"), 0, "a not begun / expired unit has no entry and no load (case 3)");
});

test("history: free run 40 min, 7.5 km, effort 6 → load 240; the distance has no effect (case 12)", () => {
  assert.equal(entryLoad({ minutes: 40, rpe: 6, km: 7.5, run: "free" }), 240);
  assert.equal(entryLoad({ minutes: 40, rpe: 6, km: 99, run: "free" }), 240);
});

test("history: deload rules unchanged – planned 5th week, hard sessions, acute jump; taper/recover/ramp never", () => {
  const mon = parse("2026-11-09");
  const wk = (m, rpe, n = 1, extra = {}) => Array.from({ length: n }, () => ({ date: m, minutes: 60, rpe, ...extra }));
  assert.equal(deloadFor({ log: [], mon, phase: "base", ramp: false, planStart: "2026-10-12" }).why, "plan");
  assert.equal(deloadFor({ log: [], mon, phase: "taper", ramp: false, planStart: "2026-10-12" }).deload, false);
  assert.equal(deloadFor({ log: [], mon, phase: "base", ramp: true, planStart: "2026-10-12" }).deload, false);
  const hard = wk("2026-11-03", 9, 2, { tHi: 6 });
  assert.equal(deloadFor({ log: hard, mon, phase: "base", ramp: false, planStart: "" }).why, "rpe");
  const log = [...wk("2026-10-19", 5, 2), ...wk("2026-10-26", 5, 2), ...wk("2026-11-02", 9, 2)];
  assert.equal(deloadFor({ log, mon, phase: "base", ramp: false, planStart: "" }).why, "acwr");
});

test("history: week projection (done + planned) over 1.3 × chronic average lightens the open sessions (case 7)", () => {
  const mon = parse("2026-11-02");
  const chronic = ["2026-10-12", "2026-10-19", "2026-10-26"].map((d) => ({ date: d, minutes: 90, rpe: 5 }));
  const none = deloadFor({ log: chronic, mon, phase: "base", ramp: false, planStart: "", projected: projectWeek({ log: chronic, monISO: "2026-11-02", plannedDays: [{ minutes: 60, rpe: 6 }] }) });
  assert.equal(none.deload, false);
  const log = [...chronic, { date: "2026-11-02", minutes: 120, rpe: 9 }];
  const projected = projectWeek({ log, monISO: "2026-11-02", plannedDays: [{ minutes: 75, rpe: 6 }, { minutes: 75, rpe: 6 }] });
  assert.equal(projected, 1080 + 900);
  assert.equal(deloadFor({ log, mon, phase: "base", ramp: false, planStart: "", projected }).why, "proj");
});

test("history: regions – club kinds, boxing carries the arms, free run; hard day before → light regions (case 1)", () => {
  assert.deepEqual(clubRegions("P"), { legs: 0.35, arms: 0.35, core: 0.1, endu: 0.2 });
  assert.equal(clubRegions("P", "boxing").legs, 0.15);
  assert.ok(clubRegions("P", "boxing").arms > 0.5);
  assert.deepEqual(entryRegions({ run: "free" }), { legs: 0.3, endu: 0.7 });
  assert.deepEqual(exRegions({ cat: "mob", avoid: "" }), { mob: 1 });
  assert.deepEqual(exRegions({ cat: "str", avoid: "ka" }), { legs: 1 });
  assert.deepEqual(exRegions({ cat: "warm", avoid: "k" }), {});
  const club = [{ date: "2026-11-02", src: "club", ck: "P", minutes: 90, rpe: 9 }];
  assert.deepEqual(lightRegions({ log: club, date: "2026-11-03" }), ["legs", "arms"]);
  assert.deepEqual(lightRegions({ log: club, date: "2026-11-04" }), [], "only the day after");
  assert.deepEqual(lightRegions({ log: [{ ...club[0], rpe: 5 }], date: "2026-11-03" }), [], "not hard enough");
  assert.deepEqual(lightRegions({ log: [{ ...club[0], ck: "X" }], date: "2026-11-03" }), [], "mixed stays below the share");
});

test("history: level per sport – shared values 42 days, technique part per sport (cases 9, 10)", () => {
  const legacy = { id: "t1", date: "2026-10-14", scores: { str: 4, spd: 4, end: 4, flx: 4, tec: 4 }, complete: true };
  assert.equal(levelFor([legacy], "kickboxing").level, 2, "legacy test = kickboxing technique, same result as before");
  assert.equal(levelFor([legacy], "kickboxing").needTech, false);
  const box = levelFor([legacy], "boxing");
  assert.equal(box.level, 0);
  assert.equal(box.needTech, true, "first boxing unit: only the technique part is missing");
  assert.equal(box.needShared, false);
  const part = { id: "t2", date: "2026-11-03", scores: { tec: 2 }, techBy: { boxing: 2 } };
  const b2 = levelFor([legacy, part], "boxing");
  assert.equal(b2.level, 1, "4+4+4+4+2 = 18, minimum 2");
  assert.equal(levelFor([legacy, part], "kickboxing").level, 2, "the kickboxing level does not move");
  assert.equal(levelFor([], "kickboxing").level, 0);
});

/* ---------- 3-D: stable exercise ids and prescriptions (docs/data-load-concept.md §3, §6) ---------- */
import { EX_KEYS, keyOfLegacy, legacyIndex } from "../src/catalog/ids.js";
import { EX } from "../src/catalog/exercises.js";
import { RX, RX_HARD, rxOf, rxText, rxPlan, rxSeconds, rxMinutes } from "../src/core/prescription.js";

test("ids: 88 unique text ids, row order = legacy index, EX reachable by id and by old number", () => {
  assert.equal(EX_KEYS.length, 88);
  assert.equal(new Set(EX_KEYS).size, 88);
  EX_KEYS.forEach((k, i) => {
    assert.match(k, /^(warm|cond|str|mob|cool|pow|pre)\.[a-z0-9_]+$/);
    assert.equal(keyOfLegacy(i), k);
    assert.equal(legacyIndex(k), i);
    assert.equal(EX[k], EX[i]);
    assert.equal(EX[i].id, k);
    assert.equal(EX[i].cat, k.split(".")[0], k);
  });
  assert.equal(keyOfLegacy(9999), 9999); // unknown values stay as they are
});

test("prescriptions: every key exists in the catalogue; text, timer and estimate come from the same numbers", () => {
  for (const k of Object.keys(RX)) if (k.includes(".")) assert.ok(EX[k], k);
  // sets: "3× 20–30 s" ↔ 3 work phases with the first choice
  const sets = rxPlan(RX.fPlank);
  assert.deepEqual(sets.choices, [20, 30]);
  assert.equal(sets.phases.filter((p) => p.role === "set").length, 3);
  assert.equal(rxText(RX.fPlank, "de"), "3× 20–30 s");
  // every prescription: text has the numbers of the timer
  assert.equal(rxText(RX["cond.shadow_sprints"], "de"), "3 × (20 s Vollgas / 10 s locker)");
  assert.equal(rxPlan(RX["cond.shadow_sprints"]).phases.reduce((a, p) => a + p.seconds, 0), 3 * 30);
  assert.equal(rxText(RX["cool.hip_flexor_stretch"], "en"), "45 s per side");
  assert.equal(rxPlan(RX["cool.hip_flexor_stretch"]).phases.map((p) => p.seconds).join(), "45,5,45");
});

test("prescriptions A1–A4, A13: the harder full-contact dose changes text AND timer together", () => {
  assert.equal(rxText(rxOf("fPlank", true), "de"), "3× 30–45 s");
  assert.deepEqual(rxPlan(rxOf("fPlank", true)).choices, [30, 45]); // A1
  assert.equal(rxText(rxOf("fTap", true), "de"), "3× 45 s pro Hand");
  assert.ok(rxPlan(rxOf("fTap", true)).phases.filter((p) => p.role === "sideset").every((p) => p.seconds === 45)); // A2
  assert.equal(rxPlan(rxOf("fBare", true)).phases.filter((p) => p.role === "set").length, 3); // A3
  assert.equal(rxPlan(rxOf("fWraps", true)).phases.filter((p) => p.role === "set").length, 3); // A4
  assert.equal(rxPlan(rxOf("checks", true)).phases.filter((p) => p.role === "set").length, 3); // A13
  // normal dose unchanged
  assert.equal(rxPlan(rxOf("fBare", false)).phases.filter((p) => p.role === "set").length, 2);
  assert.ok(Object.keys(RX_HARD).every((k) => RX[k]));
});

test("prescriptions A6/A7/A9/A11: neck names the four hand positions, kick holds fill ≈4 min, holds state their total, rope alternates", () => {
  assert.match(rxText(RX["str.neck_iso_hold"], "de"), /je Richtung 10 s \(Stirn, Hinterkopf, links, rechts\)/);
  assert.equal(rxPlan(RX["str.neck_iso_hold"]).phases.filter((p) => p.role === "dir").length, 4);
  const kick = rxPlan(RX["mob.kick_holds"], { choice: 3 }),
    tot = kick.phases.reduce((a, p) => a + p.seconds, 0);
  assert.ok(tot >= 200 && tot <= 290, String(tot));
  assert.ok(kick.phases.some((p) => p.side === 1) && kick.phases.some((p) => p.side === 2));
  assert.equal(rxMinutes(RX["mob.pigeon_stretch"]), "2–3");
  assert.equal(rxMinutes(RX["mob.frog_stretch"]), "1–2");
  const alt = rxPlan(RX["cond.rope_intervals"]);
  assert.equal(alt.phases.length, 4);
  assert.deepEqual(alt.phases.map((p) => p.seconds), [30, 30, 30, 30]);
  assert.equal(rxSeconds(RX["cond.rope_intervals"])[0], 120);
});

/* ---------- boxing (4a-U, U1/U2) ---------- */
import { dbvClass, dbvFormat, standardFormat, KO_DAYS, WKB_URL } from "../src/sports/boxing/rules.js";
import { BOX_COMBOS, BOX_LIGHT, BOX_COUNTER, BOX_ATT, BOX_THEMES } from "../src/sports/boxing/techniques.js";
import { BOX_TASKS } from "../src/sports/boxing/tasks.js";
import { KICKS, TECH } from "../src/sports/kickboxing/techniques.js";
import { SPORTS, visibleSports, previewSports } from "../src/sports/index.js";

test("boxing rules: DBV age classes by calendar year and the round lengths of §46/§47", () => {
  assert.deepEqual([9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 40, 41].map(dbvClass), [null, "u13", "u13", "u15", "u15", "u17", "u17", "u19", "u19", "a", "a", null]);
  assert.equal(dbvClass(null), "a", "nothing entered: adult");
  assert.deepEqual(dbvFormat("lc", 11), { r: 3, w: 60, b: 60, cls: "u13" });
  assert.deepEqual([13, 15, 17, 25].map((a) => dbvFormat(null, a).w), [90, 120, 180, 180]);
  assert.equal(dbvFormat(null, 45), null, "over 40: no official format");
  assert.equal(dbvFormat("fc", 30).r, 3);
});
test("boxing rules: training standard without a tournament, over-40 format, ban duration, link", () => {
  assert.equal(standardFormat(null).w, 180);
  assert.equal(standardFormat(22).w, 180);
  assert.equal(standardFormat(14).w, 90);
  assert.equal(standardFormat(9).w, 60);
  const m = standardFormat(45);
  assert.deepEqual([m.r, m.w, m.b, m.official], [3, 120, 60, false]);
  assert.equal(KO_DAYS, 30);
  assert.match(WKB_URL, /^https:\/\/www\.boxverband\.de\/.*WKB.*\.pdf$/);
});
test("boxing techniques: punches only, every name exists, defence only where it has a reason", () => {
  const all = [...BOX_COMBOS.flat(), ...BOX_LIGHT];
  for (const c of all) for (const x of c) assert.ok(TECH[x] && !KICKS.has(x), `${x} is a punch or a shared move`);
  for (const t of BOX_THEMES) for (const c of BOX_COMBOS.flat().slice(0, 6)) for (const x of t.ap(c.slice(), {})) assert.ok(!KICKS.has(x));
  for (const c of BOX_COUNTER) {
    assert.ok(BOX_ATT.has(c.att));
    c.c.forEach((x) => assert.ok(!KICKS.has(x) && TECH[x]));
  }
  assert.ok(BOX_COMBOS.every((l) => l.length >= 6), "enough combos per level");
});
test("boxing tasks: all with partner text or solo text; touch sparring needs a partner and gear and is from level 1", () => {
  assert.ok(BOX_TASKS.every((t) => t.sport === "boxing" && t.de[0] && t.en[0] && t.de[1] && t.en[1]));
  const free = BOX_TASKS.find((t) => t.touch);
  assert.ok(free.gear && free.lvl >= 1 && free.de[2] === null);
  assert.match(free.de[1], /30–40 %/);
  assert.match(free.de[1], /nur nach Absprache mit deinem Trainer und unter Aufsicht/);
  assert.ok(BOX_TASKS.filter((t) => t.touch).length === 1);
  for (const t of BOX_TASKS) assert.ok(!/Kick|Tritt/.test(t.de.join(" ")), t.id + " has no kick wording");
});
test("sports: boxing (4b) and taekwondo (6a) are visible next to kickboxing; no preview sports remain", () => {
  assert.equal(SPORTS.boxing.visible, true);
  assert.deepEqual(visibleSports().map((s) => s.id), ["kickboxing", "boxing", "taekwondo"]);
  assert.deepEqual(previewSports().map((s) => s.id), []);
});

import { BOX_NO_EX } from "../src/sports/boxing/techniques.js";
test("boxing: every catalogue exercise whose text is about kicks is excluded from boxing sessions", () => {
  const kicky = EX.filter((e) => /kick|tritt|schienbein|roundhouse|spinning|sweep/i.test([e.de, e.en, e.dde, e.den].join(" "))).map((e) => e.key);
  assert.ok(kicky.length >= 7);
  for (const k of kicky) assert.ok(BOX_NO_EX.has(k), k + " is missing in BOX_NO_EX");
  for (const k of BOX_NO_EX) assert.ok(EX.some((e) => e.key === k), k + " exists in the catalogue");
});

/* ---------- taekwondo grades (6a) ---------- */
import * as TKD from "../src/sports/taekwondo/grades.js";
test("taekwondo grades: belts per grade, WT and ITF use the same colour sequence, no grade above the 1st Dan", () => {
  const seq = { k10: ["white", null], k9: ["white", "yellow"], k8: ["yellow", null], k7: ["yellow", "green"], k6: ["green", null], k5: ["green", "blue"], k4: ["blue", null], k3: ["blue", "red"], k2: ["red", null], k1: ["red", "black"], d1: ["black", null] };
  for (const [c, [b, t]] of Object.entries(seq)) {
    assert.equal(TKD.beltOf(c).base, TKD.COLORS[b], c);
    assert.equal(TKD.beltOf(c).tip, t ? TKD.COLORS[t] : null, c);
  }
  assert.equal(TKD.beltOf("").base, TKD.COLORS.white, "no grade = white standard drawing");
  assert.deepEqual(TKD.gradesFor("itf", 30), ["k10", "k9", "k8", "k7", "k6", "k5", "k4", "k3", "k2", "k1", "d1"]);
  assert.equal(TKD.gradesFor("wt", 30).at(-1), "d1");
  assert.equal(TKD.gradesFor("wt", 12).at(-1), "p1", "WT under 15: 1st Poom instead of the 1st Dan");
  assert.equal(TKD.gradesFor("wt", null).at(-1), "d1", "unknown age: Dan");
  assert.equal(TKD.isGrade("itf", "p1"), false);
  assert.equal(TKD.nextGrade("wt", "k1", 30), "d1");
  assert.equal(TKD.nextGrade("wt", "d1", 30), null, "no higher Dan");
  assert.equal(TKD.nextGrade("itf", "", 30), "k9");
});
test("taekwondo grades: waiting times, forms (name only), exam parts, earliest date", () => {
  assert.equal(TKD.waitMonths("wt", "k4"), 4);
  assert.equal(TKD.waitMonths("wt", "k1"), 6);
  assert.equal(TKD.waitMonths("itf", "k7"), 3);
  assert.equal(TKD.waitMonths("itf", "k1"), 6);
  assert.equal(TKD.waitMonths("wt", "d1"), 12);
  assert.deepEqual(TKD.formOf("wt", "k6"), [2, "Taegeuk Ee Jang"]);
  assert.deepEqual(TKD.formOf("wt", "d1"), [8, "Taegeuk Pal Jang"]);
  assert.deepEqual(TKD.formOf("itf", "k3"), [null, "Joong-Gun"]);
  assert.equal(TKD.formOf("itf", "k9"), null);
  assert.ok(TKD.examParts("wt", "k4").includes("break1") && TKD.examParts("wt", "k3").includes("break2"));
  assert.ok(!TKD.examParts("wt", "k5").some((p) => p.startsWith("break")), "no break test before the 4th Kup");
  assert.ok(TKD.examParts("itf", "k5").includes("kyokpa") && !TKD.examParts("itf", "k6").includes("kyokpa"));
  assert.equal(TKD.earliestExam("wt", "k4", "2026-01-31"), "2026-05-31");
  assert.equal(TKD.earliestExam("wt", "k4", null), null);
  assert.equal(TKD.gradeText("k4", "de"), "4. Kup");
  assert.equal(TKD.gradeText("d1", "en"), "1st Dan");
  assert.equal(TKD.gradeText("k10", "en"), "10th Kup");
});
