/* Taekwondo WT / DTU: techniques, combos, counter actions, partner tasks and round texts (6b). Pure data and small
   functions; the planner in src/app reads it through RZ.TKDT.
   Names: Kukkiwon terminology (docs/rules-sources.md R3d, docs/taekwondo-concept.md 4.1) – [de, en, korean].
   What is allowed in the fight: docs/taekwondo-concept.md 2.1 (WT Competition Rules Art. 11/12, fassung ab 01.06.2026):
   fist only straight to the trunk, foot anywhere below the ankle to trunk and head.
   Which technique is released when is a training recommendation (docs/taekwondo-concept.md 3.3, decision F2), not a
   rule of the associations. */

/* [de, en, korean transliteration] */
export const TECH = {
  ap: ["Frontkick", "Front kick", "Ap-chagi"],
  dol: ["Halbkreistritt Rumpf", "Roundhouse kick trunk", "Dollyeo-chagi Momtong"],
  dolh: ["Halbkreistritt Kopf", "Roundhouse kick head", "Dollyeo-chagi Eolgul"],
  yeop: ["Seitwärtstritt", "Side kick", "Yeop-chagi"],
  mireo: ["Schiebetritt", "Push kick", "Mireo-chagi"],
  dwi: ["Rückwärtstritt (gedreht)", "Back kick (spinning)", "Dwi-chagi"],
  nae: ["Axttritt", "Axe kick", "Naeryeo-chagi"],
  ban: ["Sicheltritt", "Crescent kick", "Bandal-chagi"],
  dhu: ["Drehhakentritt Kopf", "Spinning hook kick head", "Dwi-huryeo-chagi"],
  ttdol: ["Gesprungener Halbkreistritt", "Jumping roundhouse kick", "Ttwieo-dollyeo-chagi"],
  ttyeop: ["Gesprungener Seitwärtstritt", "Jumping side kick", "Ttwieo-yeop-chagi"],
  jir: ["Fauststoß Rumpf", "Punch trunk", "Momtong-jireugi"],
  stepf: ["Schritt vor", "Step forward", "Nae-ditgi"],
  swch: ["Stellungswechsel (kleiner Hüpfer)", "Stance switch (small hop)", "Bal-bakkum"],
  stepb: ["Schritt zurück", "Step back", "Mulleo-ditgi"],
  steps: ["Schritt seitlich", "Step sideways", "Yeop-ditgi"],
  turn: ["Drehschritt", "Turning step", "Dora-ditgi"],
};
/* kicks (red chip); punch and steps are not */
export const KICKS = new Set(["ap", "dol", "dolh", "yeop", "mireo", "dwi", "nae", "ban", "dhu", "ttdol", "ttyeop"]);
/* hand techniques (a wrist or shoulder limit removes them) */
export const HANDS = new Set(["jir"]);
/* head-height kicks: only after the warm-up rounds */
export const HEAD = new Set(["dolh", "nae", "dhu"]);

/* release: lvl = minimum level (0 beginner, 1 advanced), kup = highest Kup number (7g: level OR grade – either one is
   enough; no grade entered: only the level counts), basic = also for children under 13, risky = not with a knee or ankle limit,
   noYoung = not under 19 for spinning back kicks (same as the kickboxing back kick). */
const REQ = {
  ap: { basic: true },
  dol: { basic: true },
  yeop: { basic: true },
  mireo: { basic: true },
  jir: { basic: true },
  stepf: { basic: true },
  swch: { lvl: 1 },
  stepb: { basic: true },
  steps: { basic: true },
  turn: { lvl: 1 },
  dolh: { lvl: 1 },
  nae: { lvl: 1 },
  ban: { lvl: 1 },
  dwi: { lvl: 1, noYoung: true, risky: true },
  dhu: { lvl: 1, kup: 6, noYoung: true, risky: true },
  ttdol: { lvl: 1, kup: 4, noYoung: true, risky: true },
  ttyeop: { lvl: 1, kup: 4, noYoung: true, risky: true },
};
/** ctx: { level, kup (number 0 = Dan/Poom, null = no grade entered), kid (under 13), young (under 19), risky (knee/ankle limit) } */
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

/* Leg (or hand) side: L = lead (vorderes Bein / vordere Hand), R = rear (hinteres), relative to the fighting stance.
   FIXED = always that side, SIDE_DEF = the side a combo starts with, alternating after that. Hand techniques stay a small part (WT scores punches to the trunk only). */
export const SIDED = new Set(["ap", "dol", "dolh", "yeop", "mireo", "dwi", "nae", "ban", "dhu", "ttdol", "ttyeop", "jir"]);
export const FIXED = { mireo: "L", dwi: "R", dhu: "R", ban: "R", ttdol: "R", ttyeop: "R" };
export const SIDE_DEF = { ap: "R", dol: "R", dolh: "R", yeop: "L", nae: "L", jir: "R" };

/* Series: fast kick sequences without setting down or resetting the stance, shown as one bracketed chip (7).
   Parts are [technique, side] with L = lead leg (V), R = rear leg (H); the step has no side. Allowed only when every part is
   allowed, from level 1, never for children (a series needs several parts at tempo). */
export const SERIES = {
  sr1: { p: [["dol", "L"], ["dol", "R"]] }, // Dollyeo lead, then rear
  sr2: { p: [["ban", "L"], ["dol", "L"]] }, // Ban-dal and Dollyeo, both lead leg
  sr3: { p: [["yeop", "L"], ["dwi", "R"], ["swch", null]] }, // side kick, back kick, switch with a hop
  sr4: { p: [["ap", "L"], ["dol", "R"]] },
  sr5: { p: [["dol", "R"], ["dol", "L"]] },
};
const SIDE_TXT = { de: { L: "V", R: "H" }, en: { L: "L", R: "R" } };
for (const [id, s] of Object.entries(SERIES)) {
  const nm = (i) => s.p.map(([x, sd]) => TECH[x][i] + (sd ? " " + SIDE_TXT[i === 0 ? "de" : "en"][sd] : "")).join(" → ");
  TECH[id] = [nm(0), nm(1), s.p.map(([x, sd]) => TECH[x][2] + (sd ? " " + SIDE_TXT.de[sd] : "")).join(" → ")];
  KICKS.add(id);
  if (s.p.some(([x]) => HEAD.has(x))) HEAD.add(id);
}

/* a series inherits the strictest limits of its parts, is level 1 and never basic (no children) */
for (const [id, s] of Object.entries(SERIES)) {
  const parts = s.p.map(([x]) => REQ[x]),
    kups = parts.map((r) => r.kup).filter((k) => k != null);
  REQ[id] = { lvl: Math.max(1, ...parts.map((r) => r.lvl || 0)), kup: kups.length ? Math.min(...kups) : undefined, noYoung: parts.some((r) => r.noYoung), risky: parts.some((r) => r.risky) };
}

/* combo pools per level (index = level); every combo is filtered through allowed() */
export const COMBOS = [
  [
    ["ap", "dol"],
    ["dol", "dol"],
    ["yeop", "dol"],
    ["jir", "dol"],
    ["ap", "yeop"],
    ["mireo", "dol"],
    ["stepf", "dol", "dol"],
    ["ap", "dol", "yeop"],
    ["stepf", "ap", "dol"],
  ],
  [
    ["dol", "dol", "dolh"],
    ["jir", "dol", "dolh"],
    ["ap", "dol", "dolh"],
    ["mireo", "dol", "dolh"],
    ["dol", "nae"],
    ["ap", "dol", "yeop", "dolh"],
    ["dol", "dolh", "nae", "dol"],
    ["ap", "dol", "dolh", "dol", "yeop"],
    ["ap", "dol", "nae"],
    ["dol", "ban"],
    ["yeop", "dwi"],
    ["stepf", "dol", "dolh", "dwi"],
    ["turn", "dol", "dolh"],
    ["swch", "dol", "dolh"],
    ["sr1"],
    ["sr2"],
    ["sr4", "dolh"],
    ["stepf", "sr1"],
    ["sr5", "nae"],
    ["stepf", "swch", "dol"],
    // 7h: spinning hook and jump kicks in chains (released by level 1 or the grade; never under 19, not with a knee limit)
    ["dol", "dol", "dhu"],
    ["ap", "dol", "ttdol"],
    ["yeop", "dol", "dhu"],
  ],
  [
    ["dol", "dolh", "dwi"],
    ["ap", "dol", "dhu"],
    ["dol", "ttdol"],
    ["dol", "dolh", "ttyeop"],
    ["stepf", "dol", "dolh", "dwi"],
    ["ap", "yeop", "dwi", "dolh"],
    ["turn", "dol", "dwi", "dolh"],
    ["swch", "dol", "dolh", "dwi"],
    ["sr3"],
    ["sr1", "dolh"],
    ["ap", "dol", "dolh", "dwi", "dol"],
    ["sr4", "dolh", "dwi", "dolh"],
    ["turn", "dol", "dolh", "dwi", "dol"],
    ["stepf", "ap", "dol", "dolh", "dwi", "dolh"],
    ["sr1", "sr5", "dolh"],
    // 7h: long chains with spinning hook and jump kicks
    ["dol", "dolh", "dhu", "dol"],
    ["ap", "dol", "ttdol", "dolh"],
  ],
];
/** number of kicks in a combo (a series counts its parts, steps and punches do not) */
export const kickCount = (c) => c.reduce((n, x) => n + (SERIES[x] ? SERIES[x].p.filter(([y]) => KICKS.has(y)).length : KICKS.has(x) ? 1 : 0), 0);

/* with a wrist or shoulder limit: short light work, no pad or bag load */
export const LIGHT = [
  ["ap", "dol"],
  ["stepf", "ap"],
  ["yeop", "dol"],
];

/* counter combos after a defence (the opponent's action is only imagined; only the defence is named) */
export const COUNTER = [
  { d: "bstep", att: "dol", c: ["dol"], lvl: 0 },
  { d: "bstep", att: "ap", c: ["dol"], lvl: 0 },
  { d: "sstep", att: "dol", c: ["ap", "dol"], lvl: 0 },
  { d: "sstep", att: "yeop", c: ["dol"], lvl: 0 },
  { d: "tblock", att: "dol", c: ["dol", "dol"], lvl: 0 },
  { d: "bstep", att: "dol", c: ["dol", "dolh"], lvl: 1 },
  { d: "sstep", att: "ap", c: ["dol", "dwi"], lvl: 1 },
  { d: "tblock", att: "yeop", c: ["jir", "dol", "dolh"], lvl: 1 },
  { d: "turn", att: "dol", c: ["dol", "dolh"], lvl: 1 },
];
/* defence names: [de, en] – the Korean terms only where the terminology names them (Kukkiwon: ditgi = steps) */
export const DEFS = {
  bstep: ["Zurückweichen (Mulleo-ditgi)", "Step back (Mulleo-ditgi)"],
  sstep: ["Seitlich ausweichen (Yeop-ditgi)", "Side step (Yeop-ditgi)"],
  tblock: ["Abblocken mit Arm oder Schienbein", "Block with arm or shin"],
  turn: ["Eindrehen (Dora-ditgi)", "Turn in (Dora-ditgi)"],
};
/* kinds of the counter defences that suit children */
export const KID_DEFS = new Set(["bstep", "sstep", "tblock"]);

/* round texts of the technique and conditioning units: [de title, en title, de text, en text] */
export const RT = {
  shadow: [
    "Schattentritte",
    "Shadow kicking",
    "Kombination sauber wiederholen, Tritte kontrolliert zurückziehen, nach jeder Serie Beinarbeit in Kampfstellung.",
    "Repeat the combo cleanly, pull every kick back with control, footwork in your fighting stance after every set.",
  ],
  bag: [
    "Sack-Tritte",
    "Bag kicks",
    "Kombination mit Kraft auf den Sack, danach sofort aus der Linie.",
    "Throw the combo with power onto the bag, then step off the line straight away.",
  ],
  partner: [
    "Pratzendrill",
    "Pad drill",
    "A tritt die Kombination kontrolliert auf die Pratzen, B hält sicher mit beiden Händen. Nach 3–5 Wiederholungen Rollen tauschen.",
    "A kicks the combo with control onto the pads, B holds firmly with both hands. Swap roles every 3–5 reps.",
  ],
  foot: [
    "Beinarbeit-Runde",
    "Footwork round",
    "Schattentritte mit Fokus auf die Schritte: vor, zurück, seitlich, Drehschritt. Distanz halten, nach jedem Schritt wieder in die Kampfstellung.",
    "Shadow kicking with a focus on steps: forward, back, sideways, turning step. Hold the distance, back into your fighting stance after every step.",
  ],
  evade: [
    "Ausweichen & Kontern",
    "Evade & counter",
    "Stell dir einen Angriff vor, weiche aus und kontere sofort mit der Kombination. Hände oben, Tritte kontrolliert.",
    "Picture an attack, evade it and counter straight away with the combination. Hands up, kicks under control.",
  ],
  rope: [
    "Seil-Runde",
    "Rope round",
    "Die ganze Runde springen, letzte 20 s Vollgas.",
    "Skip the whole round, last 20 s all-out.",
  ],
};

/* Partner and solo tasks for the "Sparring" units, same shape as the boxing tasks: de/en = [title, partner text,
   solo text (null = partner only)]. sport: "taekwondo". lvl = minimum level, light = allowed in taper/recovery weeks,
   gear = needs a partner and full protection, touch = at most one round per session, not for children. */
export const TASKS = [
  {
    id: "tk_pad", sport: "taekwondo", style: "wt", light: true,
    de: ["Tritt-Pratze", "A tritt kontrolliert auf die Pratzen, B hält und gibt vor, welche Tritte kommen. Nach 3–5 Aktionen Rollen tauschen.", "Tritte auf den Sack oder in die Luft mit sauberem Zurückziehen, Beinarbeit dazwischen."],
    en: ["Kick pads", "A kicks the pads with control, B holds and calls which kicks come. Swap roles every 3–5 actions.", "Kicks onto the bag or into the air with a clean pull-back, footwork in between."],
  },
  {
    id: "tk_step", sport: "taekwondo", style: "wt", light: true,
    de: ["Step-Sparring", "A greift mit einem vorher festgelegten Tritt an, B weicht aus oder blockt und kontert mit einem festgelegten Tritt. Langsam und kontrolliert, danach Rollen tauschen.", null],
    en: ["Step sparring", "A attacks with a kick agreed beforehand, B evades or blocks and counters with an agreed kick. Slow and controlled, then swap roles.", null],
  },
  {
    id: "tk_kicks", sport: "taekwondo", style: "wt", light: true,
    de: ["Nur Tritte zum Rumpf", "Beide treten nur zum Rumpf, kontrolliert und ohne Härte, die Hände bleiben oben. Fokus: Distanz und sauberes Zurückziehen.", "Nur Tritte zum Rumpf gegen einen vorgestellten Gegner, dazwischen Beinarbeit."],
    en: ["Trunk kicks only", "Both kick to the trunk only, with control and no force, hands stay up. Focus: distance and a clean pull-back.", "Trunk kicks only against an imagined opponent, footwork in between."],
  },
  {
    id: "tk_dist", sport: "taekwondo", light: true,
    de: ["Distanzspiel", "Beide arbeiten nur mit Schritten und Antäuschen, ohne zu treffen: Wer die Distanz kontrolliert, bestimmt den Angriff. Dann erst ein kontrollierter Tritt.", "Schritte vor, zurück, seitlich mit Antäuschen gegen einen vorgestellten Gegner."],
    en: ["Distance game", "Both only use steps and feints, without hitting: whoever controls the distance decides the attack. Only then one controlled kick.", "Steps forward, back and sideways with feints against an imagined opponent."],
  },
  {
    id: "tk_counter", sport: "taekwondo", light: true, lvl: 1,
    de: ["Konter nach Zurückweichen", "A greift an, B weicht zurück oder zur Seite aus und kontert sofort. Nach 3–5 Aktionen tauschen.", "Stell dir einen Angriff vor: ausweichen, dann sofort kontern."],
    en: ["Counter after stepping back", "A attacks, B steps back or aside and counters straight away. Swap every 3–5 actions.", "Picture an attack: evade, then counter straight away."],
  },
  {
    id: "tk_situ", sport: "taekwondo", lvl: 1,
    de: ["Situations-Sparring", "Eine feste Ausgangslage, zum Beispiel A drängt nach vorn und B muss kontern, oder B steht an der Grenzlinie. Eine Aktion, dann Stopp und neu starten. Kontrolliert.", null],
    en: ["Situation sparring", "A fixed starting situation, for example A pushes forward and B has to counter, or B stands on the boundary line. One action, then stop and restart. Controlled.", null],
  },
  {
    id: "tk_free", sport: "taekwondo", style: "wt", lvl: 1, gear: true, touch: true,
    de: ["Freies technisches Sparring", "Frei treten mit höchstens 50 % Tempo und Härte, Partner und volle Schutzausrüstung. Freies Sparring nur nach Absprache mit deinem Trainer und unter Aufsicht.", null],
    en: ["Free technical sparring", "Spar freely at no more than 50 % speed and force, with a partner and full protective gear. Free sparring only in agreement with your coach and under supervision.", null],
  },
];
