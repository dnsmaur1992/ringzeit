/* Kickboxing techniques (WAKO disciplines LC, KL, FC, K1): names [de, en], technique groups, the disciplines with leg
   kicks and the technique themes. Pure data. The combos are built by movement rules in the app (08g-flow.js, Teil 43);
   the fixed combo lists are gone (26.11.2026). */
export const TECH = {
  jab: ["Jab", "Jab"],
  cross: ["Cross", "Cross"],
  jabb: ["Jab Körper", "Jab body"],
  crossb: ["Cross Körper", "Cross body"],
  hook: ["Haken", "Hook"],
  hookb: ["Körperhaken", "Body hook"],
  upper: ["Uppercut", "Uppercut"],
  front: ["Frontkick Körper", "Front kick body"],
  round: ["Roundhouse Körper", "Roundhouse body"],
  roundh: ["High Kick Kopf", "High kick head"],
  side: ["Sidekick Körper", "Side kick body"],
  back: ["Backkick gedreht Körper", "Spinning back kick body"],
  hookk: ["Hook-Kick Kopf", "Hook kick head"],
  axe: ["Axe-Kick Kopf", "Axe kick head"],
  brazil: ["Brazilian Kick Kopf", "Brazilian kick head"],
  shook: ["Spinning Hook Kick Kopf", "Spinning hook kick head"],
  tornado: ["Tornado Kick Kopf", "Tornado kick head"],
  jknee: ["Gesprungenes Knie Kopf", "Flying knee head"],
  sweep: ["Fußfeger", "Foot sweep"],
  lowk: ["Low Kick Oberschenkel", "Low kick thigh"],
  knee: ["Knie Körper", "Knee body"],
  slip: ["Abtauchen", "Slip"],
  step: ["Seitschritt", "Side step"],
  block: ["Block", "Block"],
};
export const KICKS = new Set([
  "front",
  "round",
  "roundh",
  "side",
  "back",
  "hookk",
  "axe",
  "brazil",
  "shook",
  "tornado",
  "sweep",
  "lowk",
  "knee",
  "jknee",
]);
export const STRIKE = new Set(["jab", "cross", "jabb", "crossb", "hook", "hookb", "upper", ...KICKS]);
export const RISKY = new Set(["back", "hookk", "brazil", "shook", "tornado", "sweep", "lowk", "knee", "jknee"]);
/* demanding spinning and jumping techniques – not in kids mode */
export const ADV = new Set(["brazil", "shook", "tornado", "jknee"]);
/* the disciplines with leg kicks (low kick; K1 also knees) – the combos themselves come from the movement builder
   (src/app/08g-flow.js, Teil 43) */
export const EXTRA = { kl: true, k1: true };

/* Technique themes — chosen automatically and balanced; the movement builder turns them into rules (start, finish …),
   in partner units they are the visible theme of the unit (Teil 43) */
export const THEMES = [
  {
    id: "startJab",
    tag: "hand",
    ap: (c) => (c[0] === "jab" ? c : ["jab", ...c]),
  },
  {
    id: "doubleJab",
    tag: "hand",
    ap: (c) => ["jab", "jab", ...c.filter((x, i) => !(i < 2 && x === "jab"))],
  },
  {
    id: "bodyHead",
    tag: "mix",
    ap: (c) => [...c.filter((x) => !["roundh", "hookb", "round"].includes(x)).slice(0, 2), "hookb", "roundh"],
  },
  {
    id: "frontStart",
    tag: "kick",
    kick: true,
    ap: (c) => (c[0] === "front" ? c : ["front", ...c.filter((x) => x !== "front")]),
  },
  {
    id: "sideOpener",
    tag: "kick",
    kick: true,
    ap: (c) => ["side", ...c.filter((x) => x !== "side")],
  },
  {
    id: "headFinish",
    tag: "kick",
    kick: true,
    ap: (c) => [...c.filter((x) => x !== "roundh"), "roundh"],
  },
  {
    id: "sweepFinish",
    tag: "kick",
    risky: true,
    lvl: 1,
    ap: (c) => [...c.filter((x) => x !== "sweep"), "sweep"],
  },
  {
    id: "lowFinish",
    tag: "kick",
    kick: true,
    risky: true,
    disc: ["kl", "k1"],
    ap: (c) => [...c.filter((x) => x !== "lowk"), "lowk"],
  },
  {
    id: "kneeFinish",
    tag: "mix",
    risky: true,
    disc: ["k1"],
    ap: (c) => [...c.filter((x) => x !== "knee"), "knee"],
  },
];

