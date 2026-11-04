/* Taekwondo ITF-D plans (6c): hand-foot technique, Matsogi drills, own terminology. Pure data, same shape as the WT data
   in techniques.js so that the planner takes either module by the style of the unit (docs/taekwondo-concept.md 2.2, 4.1, 5, 6).
   Names: only terms of the ITF-D examination rules (PO, R4a) and the ITF competition rules (R4c) carry the ITF spelling; what
   they do not name (axe kick, crescent kick, push kick, steps, back fist as a strike) is named in German/English only
   (the third field stays null, rule D4: no invented Korean terms). */
import { KICKS, LIGHT, HEAD, SIDED as WT_SIDED, FIXED as WT_FIXED, SIDE_DEF as WT_SIDE_DEF } from "./techniques.js";

/* [de, en, ITF spelling or null] */
export const TECH = {
  ap: ["Frontkick", "Front kick", "Ap Chagi"],
  dol: ["Halbkreistritt Rumpf", "Roundhouse kick trunk", "Dollyo Chagi"],
  dolh: ["Halbkreistritt Kopf", "Roundhouse kick head", "Dollyo Chagi (Kopf)"],
  yeop: ["Seitwärtstritt", "Side kick", "Yop Chagi"],
  mireo: ["Schiebetritt", "Push kick", null],
  dwi: ["Rückwärtstritt", "Back kick", "Dwit Chagi"],
  nae: ["Axttritt", "Axe kick", null],
  ban: ["Sicheltritt", "Crescent kick", null],
  dhu: ["Drehhakentritt", "Spinning hook kick", "Bandae Dollyo Chagi"],
  ttdol: ["Gesprungener Halbkreistritt", "Jumping roundhouse kick", "Twimyo Dollyo Chagi"],
  ttyeop: ["Gesprungener Seitwärtstritt", "Jumping side kick", "Twimyo Yop Chagi"],
  jir: ["Fauststoß (Vorderfaust)", "Punch (front fist)", "Ap Joomuk Jirugi"],
  dung: ["Faustrücken-Schlag", "Back-fist strike", null],
  stepf: ["Schritt vor", "Step forward", null],
  stepb: ["Schritt zurück", "Step back", null],
  steps: ["Schritt seitlich", "Step sideways", null],
  turn: ["Drehschritt", "Turning step", null],
  swch: ["Stellungswechsel (kleiner Hüpfer)", "Stance switch (small hop)", null],
  slide: ["Gleitschritt", "Sliding step", null],
};
export const SERIES = {}; // no series chips in the ITF plans
export { KICKS, HEAD, LIGHT };
/* hand techniques (wrist or shoulder limit removes them) */
export const HANDS = new Set(["jir", "dung"]);
export const SIDED = new Set([...WT_SIDED, "dung"]);
export const FIXED = { ...WT_FIXED, dung: "L" };
export const SIDE_DEF = { ...WT_SIDE_DEF, dung: "L" };

/* release: lvl = minimum level, kup = highest Kup number (grade entered; 7g: level OR grade), basic = also under 13, risky = not with a knee or
   ankle limit, noYoung = not under 19 (spinning kicks). Jump kicks from the 2nd Kup (Kyok-Pa list, R4a), none for children. */
const REQ = {
  ap: { basic: true },
  dol: { basic: true },
  yeop: { basic: true },
  mireo: { basic: true },
  jir: { basic: true },
  dung: { lvl: 1 },
  stepf: { basic: true },
  stepb: { basic: true },
  steps: { basic: true },
  slide: { basic: true },
  turn: { lvl: 1 },
  swch: { lvl: 1 },
  dolh: { lvl: 1 },
  nae: { lvl: 1 },
  ban: { lvl: 1 },
  dwi: { lvl: 1, kup: 4, noYoung: true, risky: true },
  dhu: { lvl: 1, kup: 4, noYoung: true, risky: true },
  ttdol: { lvl: 1, kup: 2, risky: true },
  ttyeop: { lvl: 1, kup: 2, risky: true },
};
export function allowed(id, ctx) {
  const r = REQ[id];
  if (!r) return false;
  if (ctx.kid && !r.basic) return false;
  // 7g: level OR grade – with a grade entered, either the level or the Kup releases it; without a grade only the level counts
  const lvlOk = (ctx.level || 0) >= (r.lvl || 0);
  if (r.kup != null && ctx.kup != null) {
    if (!lvlOk && ctx.kup > r.kup) return false;
  } else if (!lvlOk) return false;
  if (r.noYoung && ctx.young) return false;
  if (r.risky && ctx.risky) return false;
  return true;
}

/** 7g: released only by the grade (level alone would not be enough) – the plan then also draws combos above the level pool */
export function byGrade(id, ctx) {
  const r = REQ[id];
  return !!r && r.kup != null && ctx.kup != null && ctx.kup <= r.kup && (ctx.level || 0) < (r.lvl || 0) && allowed(id, ctx);
}

/* combo pools per level (hand-foot connections, about 40 % hand / 60 % foot); every combo is filtered through allowed() */
export const COMBOS = [
  [
    ["jir", "dol"],
    ["jir", "ap"],
    ["ap", "dol"],
    ["jir", "jir", "dol"],
    ["jir", "yeop"],
    ["stepf", "jir", "dol"],
    ["slide", "jir", "dol"],
    ["dol", "dol"],
    ["ap", "jir", "dol"],
  ],
  [
    ["jir", "dol", "dolh"],
    ["dung", "dol", "dolh"],
    ["jir", "dung", "dol"],
    ["slide", "jir", "dol", "dolh"],
    ["jir", "ap", "dol", "yeop"],
    ["dol", "jir", "dolh"],
    ["jir", "dol", "nae"],
    ["swch", "jir", "dol", "dolh"],
    ["turn", "jir", "dol", "dwi"],
    ["jir", "jir", "dol", "dolh"],
    // 7f: longer hand-foot chains
    ["jir", "dol", "dol", "dolh"],
    ["ap", "dol", "yeop"],
    ["slide", "dol", "yeop", "dol"],
    ["jir", "dol", "ban", "dol"],
  ],
  [
    ["jir", "jir", "dol", "dolh", "dwi"],
    ["slide", "dung", "dol", "dolh", "dhu"],
    ["jir", "dol", "ttdol"],
    ["dol", "jir", "dolh", "ttyeop"],
    ["swch", "jir", "dung", "dol", "dolh", "dwi"],
    ["jir", "ap", "dol", "dolh", "dwi", "dol"],
    ["jir", "dung", "dol", "dolh", "ttdol"],
    // 7f: longer hand-foot chains
    ["jir", "ap", "dol", "dolh", "yeop"],
    ["dol", "dol", "dolh", "jir", "dwi"],
    ["slide", "yeop", "dol", "dolh", "dhu"],
  ],
];
export const kickCount = (c) => c.reduce((n, x) => n + (KICKS.has(x) ? 1 : 0), 0);

/* counter combos after a defence; the ids of the defences carry the prefix i (plain German/English, no Korean terms) */
export const COUNTER = [
  { d: "ibstep", att: "dol", c: ["jir", "dol"], lvl: 0 },
  { d: "isstep", att: "ap", c: ["dol"], lvl: 0 },
  { d: "itblock", att: "dol", c: ["jir", "jir", "dol"], lvl: 0 },
  { d: "ibstep", att: "yeop", c: ["dol", "jir"], lvl: 0 },
  { d: "isstep", att: "dol", c: ["jir", "dol", "dolh"], lvl: 1 },
  { d: "iturn", att: "ap", c: ["dung", "dol"], lvl: 1 },
  { d: "ibstep", att: "dol", c: ["dol", "dwi"], lvl: 1 },
];
export const DEFS = {
  ibstep: ["Zurückweichen", "Step back"],
  isstep: ["Seitlich ausweichen", "Side step"],
  itblock: ["Abblocken mit Arm oder Schienbein", "Block with arm or shin"],
  iturn: ["Eindrehen", "Turn in"],
};
export const KID_DEFS = new Set(["ibstep", "isstep", "itblock"]);

/* round texts (ITF accent: hand-foot connections) */
export const RT = {
  shadow: [
    "Schattentechnik Hand-Fuß",
    "Shadow technique, hand and foot",
    "Kombination sauber wiederholen: Hand führt, Fuß folgt, alles kontrolliert zurückziehen. Nach jeder Serie Beinarbeit.",
    "Repeat the combo cleanly: the hand leads, the foot follows, pull everything back with control. Footwork after every set.",
  ],
  bag: [
    "Sack Hand-Fuß",
    "Bag, hand and foot",
    "Kombination mit Kraft auf den Sack, die Faust in den Tritt hinein verbinden, danach sofort aus der Linie.",
    "Throw the combo with power onto the bag, link the punch into the kick, then step off the line straight away.",
  ],
  partner: [
    "Pratzendrill Hand-Fuß",
    "Pad drill, hand and foot",
    "A schlägt und tritt die Kombination kontrolliert auf die Pratzen, B hält sicher mit beiden Händen. Nach 3–5 Wiederholungen Rollen tauschen.",
    "A punches and kicks the combo with control onto the pads, B holds firmly with both hands. Swap roles every 3–5 reps.",
  ],
  foot: [
    "Beinarbeit-Runde",
    "Footwork round",
    "Schattentechnik mit Fokus auf Gleit- und Wechselschritt: rein, Hand-Fuß-Verbindung, raus. Nach jeder Aktion wieder in die Kampfstellung.",
    "Shadow technique focused on sliding and switching steps: in, hand-foot connection, out. Back to your fighting stance after every action.",
  ],
  evade: [
    "Ausweichen & Kontern",
    "Evade & counter",
    "Stell dir einen Angriff vor, weiche aus und kontere sofort mit der Hand-Fuß-Kombination. Hände oben, Tritte kontrolliert.",
    "Picture an attack, evade it and counter straight away with the hand-foot combination. Hands up, kicks under control.",
  ],
  rope: [
    "Seil-Runde",
    "Rope round",
    "Die ganze Runde springen, letzte 20 s Vollgas.",
    "Skip the whole round, last 20 s all-out.",
  ],
};
/* ITF partner and solo tasks (Matsogi = sparring drills of the exam; sport "taekwondo", style "itf"). Fields as in the WT
   tasks, plus: kup = highest Kup number from which the task appears (no grade entered: level 1 needed), minAge / maxAge,
   gear = partner and full protection, touch = at most one round per session. Children under 12 only get the pad task and the
   semi-contact drill (T11). */
export const TASKS = [
  {
    id: "it_pad", sport: "taekwondo", style: "itf", light: true,
    de: ["Pratze Hand-Fuß", "A schlägt und tritt kontrolliert auf die Pratzen, B hält und gibt vor, welche Verbindung kommt. Nach 3–5 Aktionen Rollen tauschen.", "Hand-Fuß-Verbindungen auf den Sack oder in die Luft, dazwischen Beinarbeit."],
    en: ["Hand-foot pads", "A punches and kicks the pads with control, B holds and calls which connection comes. Swap roles every 3–5 actions.", "Hand-foot connections onto the bag or into the air, footwork in between."],
  },
  {
    id: "it_semi", sport: "taekwondo", style: "itf", light: true, maxAge: 11,
    de: ["Semikontakt-Drill (Punkt-Stopp)", "A und B zeigen abwechselnd eine Aktion, nach jedem kontrollierten Treffer Stopp und neu aufstellen. Nur leichte Berührung, keine Härte.", null],
    en: ["Semi-contact drill (point stop)", "A and B take turns with one action; after each controlled touch, stop and reset. Light touch only, no force.", null],
  },
  {
    id: "it_sambo", sport: "taekwondo", style: "itf", light: true, minAge: 12,
    de: ["Sambo-Matsogi (Drei-Schritt)", "A greift in drei vorher festgelegten Schritten an, B weicht aus oder blockt und kontert mit einer festgelegten Hand-Fuß-Verbindung. Langsam, danach Rollen tauschen.", null],
    en: ["Sambo Matsogi (three-step)", "A attacks in three steps agreed beforehand, B evades or blocks and counters with an agreed hand-foot connection. Slow, then swap roles.", null],
  },
  {
    id: "it_ibo", sport: "taekwondo", style: "itf", light: true, minAge: 12, kup: 5,
    de: ["Ibo-Matsogi (Zwei-Schritt)", "A greift in zwei vorher festgelegten Schritten an, B kontert nach Abwehr. Kontrolliert und im Tempo gesteigert, danach Rollen tauschen.", null],
    en: ["Ibo Matsogi (two-step)", "A attacks in two steps agreed beforehand, B counters after the defence. Controlled, with rising tempo, then swap roles.", null],
  },
  {
    id: "it_ilbo", sport: "taekwondo", style: "itf", light: true, minAge: 12, kup: 3,
    de: ["Ilbo-Matsogi (Ein-Schritt)", "A greift mit einer festgelegten Technik an, B wehrt ab und kontert mit einer Hand-Fuß-Verbindung. Kontrolliert, nach 3–5 Aktionen Rollen tauschen.", null],
    en: ["Ilbo Matsogi (one-step)", "A attacks with an agreed technique, B defends and counters with a hand-foot connection. Controlled, swap roles every 3–5 actions.", null],
  },
  {
    id: "it_jayu", sport: "taekwondo", style: "itf", lvl: 1, gear: true, touch: true, minAge: 12,
    de: ["Jayu Matsogi (Leichtkontakt)", "Freies Kämpfen mit leichtem Kontakt, höchstens 50 % Tempo und Härte, Partner und volle Schutzausrüstung. Nur in Absprache mit deinem Trainer und unter Aufsicht.", null],
    en: ["Jayu Matsogi (light contact)", "Free sparring with light contact, at no more than 50 % speed and force, with a partner and full protective gear. Only in agreement with your coach and under supervision.", null],
  },
  {
    id: "it_hosin", sport: "taekwondo", style: "itf", lvl: 1, light: true, minAge: 12,
    de: ["Hosinsul (Selbstverteidigung, langsam)", "A greift langsam ein Handgelenk oder eine Faust an, B löst oder weicht aus und beendet mit einem kontrollierten Tritt in die Luft. Alles in Zeitlupe, nichts durchziehen; Hosinsul im Verein vertiefen.", null],
    en: ["Hosinsul (self-defence, slow)", "A slowly grabs a wrist or throws a slow punch, B releases or evades and finishes with a controlled kick into the air. All in slow motion, nothing carried through; deepen Hosinsul in your club.", null],
  },
];
