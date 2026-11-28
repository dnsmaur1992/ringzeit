/* Boxing techniques: counter combos for the evasion rounds (an imagined or real action of the opponent comes first,
   then the defence, then the counter), the partner's attacks and the themes. Pure data. The combos themselves are built
   by movement rules in the app (08g-flow.js, Teil 43); the fixed lists are gone (26.11.2026). */
/* counter combos after a defence (the defence is the first item, its reason is the opponent's action) */
export const BOX_COUNTER = [
  { d: "slip", att: "jab", c: ["cross", "hook"], lvl: 0 },
  { d: "parry", att: "jab", c: ["cross"], lvl: 0 },
  { d: "parry", att: "cross", c: ["cross", "hook"], lvl: 0 },
  { d: "step", att: "cross", c: ["jab", "cross"], lvl: 0 },
  { d: "slip", att: "cross", c: ["hookb", "hook"], lvl: 1 },
  { d: "duck", att: "hook", c: ["cross", "hook"], lvl: 1 },
  { d: "block", att: "hook", c: ["hook", "cross"], lvl: 1 },
  { d: "slipx", att: "cross", c: ["hook", "cross"], lvl: 2 },
  { d: "slip", att: "jab", c: ["cross", "hook", "cross"], lvl: 2 },
  { d: "duck", att: "hook", c: ["upper", "cross", "hook"], lvl: 2 },
];
/* attacks of the partner in boxing rounds (punches only) */
export const BOX_ATT = new Set(["jab", "cross", "hook", "upper", "hookb", "crossb"]);

export const BOX_THEMES = [
  { id: "startJab", tag: "hand", ap: (c) => (c[0] === "jab" ? c : ["jab", ...c]) },
  { id: "doubleJab", tag: "hand", ap: (c) => ["jab", "jab", ...c.filter((x, i) => !(i < 2 && x === "jab"))] },
  { id: "bodyHead", tag: "mix", ap: (c) => [...c.filter((x) => !["hookb", "hook"].includes(x)).slice(0, 2), "hookb", "hook"] },
  { id: "hookFinish", tag: "hand", ap: (c) => [...c.filter((x) => x !== "hook"), "hook"] },
  { id: "upperFinish", tag: "hand", lvl: 1, ap: (c) => [...c.filter((x) => x !== "upper"), "upper"] },
];

/* catalogue exercises that are about kicks (or whose text mentions kicks): not part of boxing sessions */
export const BOX_NO_EX = new Set([
  "cond.kick_intervals",
  "str.single_leg_kick_hold",
  "str.cable_woodchop",
  "str.copenhagen_plank",
  "mob.slow_motion_kicks",
  "mob.kick_holds",
  "cool.adductors_and_splits",
  // Federn & Antritt: check, chamber, kicks and take-offs for jump kicks
  "plyo.hop_check",
  "plyo.hop_chamber",
  "plyo.hop_kick",
  "plyo.takeoff",
]);
