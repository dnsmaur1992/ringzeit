/* Taekwondo grades per style (6a). Pure data and small functions; the belt area in src/app reads it through RZ.TKDT.
   WT: DTU Prüfungsordnung Nr. 10.1 (Stand MV 12.09.2026), docs/rules-sources.md R3c.
   ITF: ITF-D Prüfungsordnung (Stand 14.02.2025), R4a. Belt colours ITF: statement of the operator (03.11.2026), the
   ITF-D documents do not name them. Exam parts are an overview "laut PO", not a replacement for the examiner.
   Only grades up to the 1st Dan are known; no higher Dan programmes. A grade changes only by an entered exam or a
   manual correction – never by sessions, badges or fitness. WT and ITF are kept apart, there is no transfer. */

/* Catalogue exercises whose texts are about kickboxing or boxing technique (shadow boxing, guard, hooks, bag work):
   not part of taekwondo units. Kick holds, slow-motion kicks and the single-leg hold stay (active flexibility and
   standing-leg work are part of the WT plan, docs/taekwondo-concept.md 6.1). */
export const NO_EX = new Set([
  "warm.easy_shadowboxing",
  "cond.shadow_sprints",
  "cond.bag_sprints",
  "cond.stepping_and_light_footwork",
  "str.cable_woodchop",
  "str.russian_twists",
  "str.band_rows",
]);

export const STYLES = ["wt", "itf"];

export const COLORS = {
  white: "#F1EFE8",
  yellow: "#E8C33A",
  green: "#4F9D5A",
  blue: "#3F74C4",
  red: "#C8323A",
  black: "#16161A",
};
const B = (base, tip) => ({ base: COLORS[base], tip: tip ? COLORS[tip] : null });

/* belt per grade code: k10…k1 (Kup), d1 (1st Dan), p1 (1st Poom, WT under 15 – colour drawn as red/black halves, not fixed in the PO) */
const BELT = {
  k10: B("white"),
  k9: B("white", "yellow"),
  k8: B("yellow"),
  k7: B("yellow", "green"),
  k6: B("green"),
  k5: B("green", "blue"),
  k4: B("blue"),
  k3: B("blue", "red"),
  k2: B("red"),
  k1: B("red", "black"),
  d1: B("black"),
  p1: { base: COLORS.red, tip: COLORS.black, half: true },
};
/** Belt of a grade code; no grade (empty) is the white standard drawing – not a confirmed grade. */
export const beltOf = (code) => BELT[code] || BELT.k10;

const KUP = ["k10", "k9", "k8", "k7", "k6", "k5", "k4", "k3", "k2", "k1"];
export const isGrade = (style, code) => (style === "itf" ? [...KUP, "d1"] : [...KUP, "d1", "p1"]).includes(code);

/** Selectable grades of a style. WT: 1st Poom instead of the 1st Dan under 15 years (PO: Poom under 15, Dan from 15). */
export function gradesFor(style, age) {
  if (style === "itf") return [...KUP, "d1"];
  return [...KUP, age != null && age < 15 ? "p1" : "d1"];
}
/** The next grade up, or null at the top (no higher Dan). */
export function nextGrade(style, code, age) {
  const list = gradesFor(style, age),
    i = list.indexOf(code || "k10");
  return i >= 0 && i < list.length - 1 ? list[i + 1] : null;
}

const ORD = (n) => n + ({ 1: "st", 2: "nd", 3: "rd" }[n] || "th");
/** "10. Kup", "1. Dan", "1. Poom" (EN: "10th Kup", "1st Dan") */
export const gradeText = (code, lang) => {
  const n = +code.slice(1),
    kind = code[0] === "k" ? "Kup" : code[0] === "d" ? "Dan" : "Poom";
  return lang === "en" ? `${ORD(n)} ${kind}` : `${n}. ${kind}`;
};

/* minimum waiting time in months before the exam FOR this grade (WT: PO § 2; ITF: PO § 2/§ 3). 9. Kup WT counts from the first training. */
export const WAIT = {
  wt: { k9: 2, k8: 2, k7: 2, k6: 2, k5: 2, k4: 4, k3: 4, k2: 6, k1: 6, d1: 12, p1: 12 },
  itf: { k9: 2, k8: 2, k7: 3, k6: 3, k5: 4, k4: 4, k3: 5, k2: 5, k1: 6, d1: 12 },
};
export const waitMonths = (style, code) => (WAIT[style] || WAIT.wt)[code] || 0;

/* forms named in the exam (name only, no content): WT – the PO only numbers them; the usual Kukkiwon sequence is shown with a note.
   ITF – Tul names from the PO § 7/§ 8. */
export const WT_FORM = {
  k7: [1, "Taegeuk Il Jang"],
  k6: [2, "Taegeuk Ee Jang"],
  k5: [3, "Taegeuk Sam Jang"],
  k4: [4, "Taegeuk Sa Jang"],
  k3: [5, "Taegeuk Oh Jang"],
  k2: [6, "Taegeuk Yuk Jang"],
  k1: [7, "Taegeuk Chil Jang"],
  d1: [8, "Taegeuk Pal Jang"],
  p1: [8, "Taegeuk Pal Jang"],
};
export const ITF_TUL = {
  k8: "Chon-Ji",
  k7: "Dan-Gun",
  k6: "Do-San",
  k5: "Won-Hyo",
  k4: "Yul-Gok",
  k3: "Joong-Gun",
  k2: "Toi-Gye",
  k1: "Hwa-Rang",
  d1: "Choong-Moo",
};
/** The form of an exam as [number or null, name] or null */
export const formOf = (style, code) =>
  style === "itf" ? (ITF_TUL[code] ? [null, ITF_TUL[code]] : null) : WT_FORM[code] || null;

/* exam parts per grade (codes; labels in the app). Overview only. */
const WT_PARTS = (c) => {
  if (c === "k9") return ["basics", "step", "pads", "theory"];
  if (c === "k8") return ["basics", "step", "pads", "elective", "theory"];
  if (["k7", "k6", "k5"].includes(c)) return ["basics", "form", "step", "pads", "elective", "theory"];
  if (c === "k4") return ["basics", "form", "pads", "situ", "break1", "elective", "theory"];
  if (["k3", "k2", "k1"].includes(c)) return ["basics", "form", "pads", "situ", "break2", "elective", "theory"];
  if (c === "d1" || c === "p1") return ["form", "more"];
  return [];
};
const ITF_PARTS = (c) => {
  if (c === "k9") return ["gibon", "ilon"];
  if (["k8", "k7"].includes(c)) return ["tul", "sambo", "ilon"];
  if (c === "k6") return ["tul", "sambo", "jayu", "ilon"];
  if (c === "k5") return ["tul", "ibo", "jayu", "kyokpa", "ilon"];
  if (c === "k4") return ["tul", "ibo", "jayu", "hosinsul", "kyokpa", "ilon"];
  if (["k3", "k2", "k1"].includes(c)) return ["tul", "ilbo", "jayu", "hosinsul", "kyokpa", "ilon"];
  if (c === "d1") return ["tul", "sambo", "ibo", "ilbo", "jayu", "kyokpa", "ilon", "more"];
  return [];
};
export const examParts = (style, code) => (style === "itf" ? ITF_PARTS(code) : WT_PARTS(code));

/** Earliest date for an exam: the day of the last grading plus the minimum waiting time (a hint, never a lock). */
export function earliestExam(style, code, lastDate) {
  const m = waitMonths(style, code);
  if (!m || !lastDate) return null;
  const d = new Date(lastDate + "T12:00:00");
  d.setMonth(d.getMonth() + m);
  return d.toISOString().slice(0, 10);
}
